"""Brand quality gate for client deliverables.

Checks a finished deliverable's copy, colors and disclosure metadata against
a brand rules file (default: brand/luxor9.yaml) before it ships:

- Copy: discouraged buzzwords (warning) and prohibited promissory claims
  such as "guaranteed returns" (error).
- Colors: every color must sit near the approved palette; retired
  off-brand colors are named explicitly (error).
- Disclosure: AI-generated deliverables need an AI-use disclosure (error).
- Testimonials: synthetic testimonials are never allowed (error) — see the
  FTC rule on fake reviews and testimonials (16 CFR Part 465).
- Claims: every factual claim needs a source for the evidence pack (error).

Brand rules live in YAML; change them there, not here.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

import yaml

from tools.base_tool import (
    BaseTool,
    Determinism,
    ExecutionMode,
    ResourceProfile,
    ToolResult,
    ToolRuntime,
    ToolStability,
    ToolStatus,
    ToolTier,
)

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
BRAND_DIR = REPO_ROOT / "brand"
_HEX_RE = re.compile(r"^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
_BRAND_NAME_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")


@dataclass
class BrandViolation:
    rule: str
    severity: str  # "error" | "warning"
    message: str
    field: str = ""

    def to_dict(self) -> dict[str, str]:
        return {
            "rule": self.rule,
            "severity": self.severity,
            "message": self.message,
            "field": self.field,
        }


@dataclass
class BrandQualityResult:
    error_penalty: float = 0.25
    warning_penalty: float = 0.05
    pass_threshold: float = 0.8
    violations: list[BrandViolation] = field(default_factory=list)

    @property
    def errors(self) -> list[BrandViolation]:
        return [v for v in self.violations if v.severity == "error"]

    @property
    def warnings(self) -> list[BrandViolation]:
        return [v for v in self.violations if v.severity == "warning"]

    @property
    def score(self) -> float:
        raw = 1.0 - self.error_penalty * len(self.errors) - self.warning_penalty * len(self.warnings)
        return round(max(0.0, raw), 4)

    @property
    def passed(self) -> bool:
        return not self.errors and self.score >= self.pass_threshold

    def add(self, rule: str, severity: str, message: str, field_name: str = "") -> None:
        self.violations.append(BrandViolation(rule, severity, message, field_name))

    def to_dict(self) -> dict[str, Any]:
        return {
            "passed": self.passed,
            "score": self.score,
            "errors": [v.to_dict() for v in self.errors],
            "warnings": [v.to_dict() for v in self.warnings],
        }


def load_brand_rules(brand: str = "luxor9") -> dict[str, Any]:
    """Load brand rules by name from brand/<name>.yaml."""
    if not _BRAND_NAME_RE.match(brand):
        raise ValueError(f"Invalid brand name: {brand!r}")
    path = BRAND_DIR / f"{brand}.yaml"
    if not path.is_file():
        raise FileNotFoundError(f"No brand rules at {path}")
    with open(path, encoding="utf-8") as f:
        rules = yaml.safe_load(f) or {}
    if not isinstance(rules, dict):
        raise ValueError(f"Brand rules at {path} must be a mapping")
    return rules


def _parse_hex(value: str) -> Optional[tuple[int, int, int]]:
    match = _HEX_RE.match(value.strip())
    if not match:
        return None
    digits = match.group(1)
    if len(digits) == 3:
        digits = "".join(c * 2 for c in digits)
    return tuple(int(digits[i:i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def _distance(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def _phrase_pattern(phrase: str) -> re.Pattern[str]:
    # Word boundaries on both ends; tolerate straight or curly apostrophes.
    escaped = re.escape(phrase.lower()).replace("'", "['’]")
    return re.compile(rf"(?<![\w-]){escaped}(?![\w-])", re.IGNORECASE)


def validate_copy(texts: dict[str, str], rules: dict[str, Any], result: BrandQualityResult) -> None:
    copy_rules = rules.get("copy", {}) or {}
    checks = [
        ("prohibited_claim", "error", copy_rules.get("prohibited_phrases", []) or []),
        ("discouraged_phrase", "warning", copy_rules.get("discouraged_phrases", []) or []),
    ]
    for field_name, text in texts.items():
        if not text:
            continue
        for rule, severity, phrases in checks:
            for phrase in phrases:
                if _phrase_pattern(str(phrase)).search(text):
                    result.add(rule, severity, f"Copy contains {phrase!r}", field_name)


def validate_colors(colors: list[str], rules: dict[str, Any], result: BrandQualityResult) -> None:
    palette = {
        name: rgb
        for name, value in (rules.get("palette", {}) or {}).items()
        if (rgb := _parse_hex(str(value))) is not None
    }
    tolerance = float(rules.get("color_tolerance", 24))
    retired = {
        rgb: note
        for value, note in (rules.get("retired_colors", {}) or {}).items()
        if (rgb := _parse_hex(str(value))) is not None
    }
    for color in colors:
        rgb = _parse_hex(str(color))
        if rgb is None:
            result.add("invalid_color", "error", f"Not a hex color: {color!r}", "colors")
            continue
        retired_note = next((note for r, note in retired.items() if _distance(rgb, r) <= tolerance), None)
        if retired_note:
            result.add("retired_color", "error", f"{color} is a retired off-brand color ({retired_note})", "colors")
            continue
        if not any(_distance(rgb, p) <= tolerance for p in palette.values()):
            result.add("off_palette_color", "error", f"{color} is not within tolerance of the brand palette", "colors")


def validate_disclosure(metadata: dict[str, Any], result: BrandQualityResult) -> None:
    if metadata.get("ai_generated") and not metadata.get("ai_disclosure"):
        result.add(
            "missing_ai_disclosure", "error",
            "AI-generated deliverable has no AI-use disclosure", "metadata.ai_disclosure",
        )
    if metadata.get("synthetic_testimonial"):
        result.add(
            "synthetic_testimonial", "error",
            "Synthetic testimonials are not allowed (FTC 16 CFR Part 465)", "metadata.synthetic_testimonial",
        )


def validate_claims(claims: list[dict[str, Any]], result: BrandQualityResult) -> None:
    for i, claim in enumerate(claims):
        text = str(claim.get("text", "")).strip()
        source = str(claim.get("source", "")).strip()
        if not source:
            label = text[:60] or f"claim {i}"
            result.add("unsourced_claim", "error", f"Claim has no source: {label!r}", f"claims[{i}]")


def evaluate(
    texts: Optional[dict[str, str]] = None,
    colors: Optional[list[str]] = None,
    metadata: Optional[dict[str, Any]] = None,
    claims: Optional[list[dict[str, Any]]] = None,
    rules: Optional[dict[str, Any]] = None,
    brand: str = "luxor9",
) -> BrandQualityResult:
    """Run every brand check and return one result."""
    rules = rules if rules is not None else load_brand_rules(brand)
    scoring = rules.get("scoring", {}) or {}
    result = BrandQualityResult(
        error_penalty=float(scoring.get("error_penalty", 0.25)),
        warning_penalty=float(scoring.get("warning_penalty", 0.05)),
        pass_threshold=float(scoring.get("pass_threshold", 0.8)),
    )
    validate_copy(texts or {}, rules, result)
    validate_colors(colors or [], rules, result)
    validate_disclosure(metadata or {}, result)
    validate_claims(claims or [], result)
    return result


class BrandQualityGate(BaseTool):
    name = "brand_quality_gate"
    version = "0.1.0"
    tier = ToolTier.CORE
    capability = "analysis"
    provider = "local"
    stability = ToolStability.BETA
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.DETERMINISTIC
    runtime = ToolRuntime.LOCAL

    dependencies = ["python:yaml"]
    install_instructions = "pip install pyyaml"

    capabilities = ["brand_check", "pre_delivery_check"]
    best_for = [
        "blocking off-brand colors and retired palettes before delivery",
        "catching promissory financial claims and buzzwords in copy",
        "enforcing AI-use disclosure and sourced claims for the evidence pack",
    ]
    not_good_for = [
        "judging visual taste or composition (use visual_qa / reviewer)",
        "legal sign-off (the gate flags; compliance approves)",
    ]

    input_schema = {
        "type": "object",
        "properties": {
            "brand": {"type": "string", "default": "luxor9", "description": "Rules file name under brand/"},
            "texts": {
                "type": "object",
                "additionalProperties": {"type": "string"},
                "description": "Copy to check, keyed by field (e.g. narration, captions, cta)",
            },
            "colors": {"type": "array", "items": {"type": "string"}, "description": "Hex colors used"},
            "metadata": {
                "type": "object",
                "properties": {
                    "ai_generated": {"type": "boolean"},
                    "ai_disclosure": {"type": "boolean"},
                    "synthetic_testimonial": {"type": "boolean"},
                },
            },
            "claims": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {"text": {"type": "string"}, "source": {"type": "string"}},
                },
            },
        },
    }
    output_schema = {
        "type": "object",
        "properties": {
            "passed": {"type": "boolean"},
            "score": {"type": "number"},
            "errors": {"type": "array"},
            "warnings": {"type": "array"},
        },
    }

    resource_profile = ResourceProfile(cpu_cores=1, ram_mb=64, vram_mb=0, disk_mb=0, network_required=False)
    side_effects: list[str] = []
    user_visible_verification = ["Report errors and warnings to the user before delivery"]

    def get_status(self) -> ToolStatus:
        return ToolStatus.AVAILABLE if BRAND_DIR.is_dir() else ToolStatus.UNAVAILABLE

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        try:
            result = evaluate(
                texts=inputs.get("texts"),
                colors=inputs.get("colors"),
                metadata=inputs.get("metadata"),
                claims=inputs.get("claims"),
                brand=inputs.get("brand", "luxor9"),
            )
        except (FileNotFoundError, ValueError, yaml.YAMLError) as exc:
            return ToolResult(success=False, error=str(exc))
        return ToolResult(success=True, data=result.to_dict())
