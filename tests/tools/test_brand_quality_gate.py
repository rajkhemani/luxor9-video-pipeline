"""Tests for the brand quality gate (tools/analysis/brand_quality_gate.py)."""
from __future__ import annotations

import pytest

from tools.analysis.brand_quality_gate import (
    BrandQualityGate,
    evaluate,
    load_brand_rules,
)


@pytest.fixture(scope="module")
def rules():
    return load_brand_rules("luxor9")


def test_clean_deliverable_passes(rules):
    result = evaluate(
        texts={"narration": "Every approval, logged. Every claim, sourced."},
        colors=["#0C0E0F", "#ECE8DF", "#79C6BF"],
        metadata={"ai_generated": True, "ai_disclosure": True},
        claims=[{"text": "Settles in one business day", "source": "client FAQ, 2026-09"}],
        rules=rules,
    )
    assert result.passed
    assert result.score == 1.0
    assert result.errors == [] and result.warnings == []


def test_near_palette_color_is_tolerated(rules):
    result = evaluate(colors=["#0E1012", "#7ac7c0", "#fff"], rules=rules)
    assert result.passed


@pytest.mark.parametrize("color,rule", [
    ("#C8A96A", "retired_color"),
    ("#00d4ff", "retired_color"),
    ("#FF0000", "off_palette_color"),
    ("not-a-color", "invalid_color"),
])
def test_bad_colors_block(rules, color, rule):
    result = evaluate(colors=[color], rules=rules)
    assert not result.passed
    assert [e.rule for e in result.errors] == [rule]


@pytest.mark.parametrize("text", [
    "Guaranteed returns for every client.",
    "A RISK-FREE way to invest.",
    "You can’t lose with this plan.",
])
def test_prohibited_claims_block(rules, text):
    result = evaluate(texts={"cta": text}, rules=rules)
    assert not result.passed
    assert result.errors[0].rule == "prohibited_claim"
    assert result.errors[0].field == "cta"


def test_buzzwords_warn_without_blocking(rules):
    result = evaluate(texts={"captions": "A revolutionary, cutting-edge platform."}, rules=rules)
    assert result.errors == []
    assert {w.rule for w in result.warnings} == {"discouraged_phrase"}
    assert result.score == pytest.approx(0.9)
    assert result.passed


def test_phrase_match_respects_word_boundaries(rules):
    # Whole-phrase matches only: "economic risk" is not "no risk",
    # and "unleashed" is not "unleash".
    result = evaluate(texts={"narration": "Economic risk is disclosed. Unleashed potential."}, rules=rules)
    assert result.violations == []


def test_many_warnings_fail_threshold(rules):
    text = "revolutionary game-changing cutting-edge disruptive world-class synergy"
    result = evaluate(texts={"x": text}, rules=rules)
    assert result.errors == []
    assert result.score < 0.8
    assert not result.passed


def test_missing_ai_disclosure_and_synthetic_testimonial(rules):
    result = evaluate(metadata={"ai_generated": True, "synthetic_testimonial": True}, rules=rules)
    assert {e.rule for e in result.errors} == {"missing_ai_disclosure", "synthetic_testimonial"}


def test_unsourced_claim_blocks(rules):
    result = evaluate(claims=[{"text": "Lowest fees in India", "source": " "}], rules=rules)
    assert [e.rule for e in result.errors] == ["unsourced_claim"]
    assert result.errors[0].field == "claims[0]"


def test_tool_execute_returns_report():
    tool = BrandQualityGate()
    out = tool.execute({"texts": {"cta": "Guaranteed profit"}, "colors": ["#C8A96A"]})
    assert out.success
    assert out.data["passed"] is False
    assert len(out.data["errors"]) == 2


@pytest.mark.parametrize("brand", ["../config", "missing_brand", "Bad Name"])
def test_tool_rejects_bad_brand(brand):
    out = BrandQualityGate().execute({"brand": brand})
    assert not out.success
    assert out.error


def test_registry_discovers_gate():
    from tools.tool_registry import registry

    # Discover only the analysis package so this test does not depend on
    # heavy optional deps (numpy, PIL) imported by other tool packages.
    assert "brand_quality_gate" in registry.discover("tools.analysis")
    assert registry.get("brand_quality_gate") is not None
