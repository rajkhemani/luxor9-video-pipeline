"""LUXOR9 Studio capability map: short public names over hidden routes.

`public_catalog()` is the only view meant for users: labels and summaries,
never tool, pipeline or provider names. `resolve()` returns the internal
route an agent should run, applying the "mix" cost policy: free route by
default, paid upgrade route only when the user explicitly upgrades.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
CAPABILITIES_PATH = REPO_ROOT / "capabilities.yaml"


class CapabilityError(ValueError):
    """Unknown capability or a request the policy does not allow."""


@dataclass(frozen=True)
class Route:
    capability: str
    status: str
    tier: str  # "free" | "upgrade"
    pipeline: Optional[str]
    skill: Optional[str]
    integration: Optional[str]
    tools: tuple[str, ...]
    guard: Optional[str]

    def to_dict(self) -> dict[str, Any]:
        return {
            "capability": self.capability,
            "status": self.status,
            "tier": self.tier,
            "pipeline": self.pipeline,
            "skill": self.skill,
            "integration": self.integration,
            "tools": list(self.tools),
            "guard": self.guard,
        }


def load_capabilities(path: Optional[Path] = None) -> dict[str, Any]:
    with open(path or CAPABILITIES_PATH, encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    if not isinstance(data.get("capabilities"), dict):
        raise CapabilityError("capabilities.yaml has no 'capabilities' mapping")
    return data


def public_catalog(data: Optional[dict[str, Any]] = None) -> list[dict[str, Any]]:
    """User-safe view: short names only, no internal routing."""
    data = data or load_capabilities()
    return [
        {
            "name": name,
            "label": cap["label"],
            "summary": cap["summary"],
            "status": cap.get("status", "ready"),
            "premium_only": bool(cap.get("paid_only", False)),
        }
        for name, cap in data["capabilities"].items()
    ]


def resolve(name: str, upgrade: bool = False, data: Optional[dict[str, Any]] = None) -> Route:
    """Internal route for a capability under the mix cost policy."""
    data = data or load_capabilities()
    cap = data["capabilities"].get(name)
    if cap is None:
        raise CapabilityError(f"Unknown capability: {name!r}")
    if cap.get("paid_only") and not upgrade:
        raise CapabilityError(
            f"{cap['label']} is premium-only: ask the user to upgrade this asset first"
        )
    route = cap.get("route", {}) or {}
    free = list(route.get("free", []) or [])
    paid = list(route.get("upgrade", []) or [])
    # Upgrade prefers paid tools and keeps free ones as fallbacks.
    tools = tuple(dict.fromkeys(paid + free)) if upgrade else tuple(free)
    return Route(
        capability=name,
        status=cap.get("status", "ready"),
        tier="upgrade" if upgrade else "free",
        pipeline=route.get("pipeline"),
        skill=route.get("skill"),
        integration=route.get("integration"),
        tools=tools,
        guard=cap.get("guard"),
    )
