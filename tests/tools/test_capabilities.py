"""Tests for the Studio capability map (capabilities.yaml, lib/capabilities.py)."""
from __future__ import annotations

import re
from pathlib import Path

import pytest

from lib.capabilities import CapabilityError, load_capabilities, public_catalog, resolve

REPO = Path(__file__).resolve().parents[2]


def _static_tool_names() -> set[str]:
    # Read tool names from source so the test needs no heavy tool imports.
    names = set()
    for path in (REPO / "tools").rglob("*.py"):
        names.update(re.findall(r'^\s+name = "([a-z0-9_]+)"', path.read_text(encoding="utf-8"), re.M))
    return names


def _provider_names() -> set[str]:
    providers = set()
    for path in (REPO / "tools").rglob("*.py"):
        providers.update(re.findall(r'^\s+provider = "([a-z0-9_]+)"', path.read_text(encoding="utf-8"), re.M))
    # Generic placeholders, not vendor names.
    return providers - {"local", "openmontage", "multi", "selector"}


@pytest.fixture(scope="module")
def data():
    return load_capabilities()


def test_every_routed_tool_pipeline_and_integration_exists(data):
    tools = _static_tool_names()
    pipelines = {p.stem for p in (REPO / "pipeline_defs").glob("*.yaml")}
    for name, cap in data["capabilities"].items():
        route = cap.get("route", {}) or {}
        for tool in (route.get("free", []) or []) + (route.get("upgrade", []) or []):
            assert tool in tools, f"{name}: unknown tool {tool}"
        if route.get("pipeline"):
            assert route["pipeline"] in pipelines, f"{name}: unknown pipeline {route['pipeline']}"
        if route.get("integration"):
            assert route["integration"] in data["integrations"], f"{name}: unknown integration"


def test_public_catalog_hides_internal_names(data):
    # Tool, provider and integration (vendor) names must never reach users.
    # Pipeline names are plain words ("cinematic") and are not secret.
    internal = _static_tool_names() | _provider_names() | set(data["integrations"])
    words = {w.lower() for w in internal}
    for entry in public_catalog(data):
        text = f"{entry['label']} {entry['summary']}".lower()
        leaked = [w for w in words if re.search(rf"(?<![a-z0-9]){re.escape(w)}(?![a-z0-9])", text)]
        assert not leaked, f"{entry['name']} leaks internal names: {leaked}"


def test_free_route_by_default_and_upgrade_adds_paid_tools(data):
    free = resolve("ad", data=data)
    paid = resolve("ad", upgrade=True, data=data)
    assert free.tier == "free" and paid.tier == "upgrade"
    assert "video_selector" not in free.tools
    assert paid.tools[0] == "video_selector"
    assert set(free.tools) <= set(paid.tools)
    assert free.pipeline == "social-creative"


def test_premium_only_capability_requires_upgrade(data):
    with pytest.raises(CapabilityError, match="premium-only"):
        resolve("motion", data=data)
    assert resolve("motion", upgrade=True, data=data).integration == "minimax"


def test_planned_and_unknown(data):
    assert resolve("carousel", data=data).status == "planned"
    with pytest.raises(CapabilityError, match="Unknown capability"):
        resolve("teleport", data=data)


def test_ugc_carries_testimonial_guard(data):
    assert resolve("ugc", data=data).guard == "no_synthetic_testimonials"
