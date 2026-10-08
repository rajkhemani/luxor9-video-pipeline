"""Consistency checks for the Studio plugin marketplace, MCP config and skills."""
from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

from lib.capabilities import load_capabilities

REPO = Path(__file__).resolve().parents[2]


def _load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def test_marketplace_entries_match_plugin_manifests():
    market = _load(REPO / ".claude-plugin" / "marketplace.json")
    assert market["name"] and market["owner"]["name"]
    for entry in market["plugins"]:
        assert ".." not in entry["source"]
        plugin_dir = REPO / entry["source"]
        manifest = _load(plugin_dir / ".claude-plugin" / "plugin.json")
        assert manifest["name"] == entry["name"], "entry name must equal manifest name"
        servers = _load(plugin_dir / ".mcp.json")["mcpServers"]
        assert servers, f"{entry['name']} declares no MCP server"
        assert list((plugin_dir / "skills").glob("*/SKILL.md")), f"{entry['name']} has no skill"


def test_every_plugin_integration_is_in_the_marketplace():
    market = {e["name"] for e in _load(REPO / ".claude-plugin" / "marketplace.json")["plugins"]}
    integrations = load_capabilities()["integrations"]
    plugins = {i["plugin"] for i in integrations.values() if i["kind"] == "mcp_plugin"}
    assert plugins == market


def test_project_mcp_config_points_at_studio_server():
    server = _load(REPO / ".mcp.json")["mcpServers"]["luxor9-studio"]
    assert server["args"][-1].endswith("lib/mcp_server.py")
    assert (REPO / "lib" / "mcp_server.py").is_file()


def test_no_secrets_committed_in_mcp_configs():
    for path in [REPO / ".mcp.json", *REPO.glob("plugins/*/.mcp.json")]:
        for server in _load(path)["mcpServers"].values():
            for value in (server.get("env") or {}).values():
                assert value.startswith("${") or value in {"url", "local"}, f"{path}: literal env value {value!r}"


def test_short_name_skills_cover_every_non_plugin_capability():
    caps = load_capabilities()["capabilities"]
    plugin_caps = {"scene_3d", "motion", "workflows"}  # shipped as plugin skills
    for name in set(caps) - plugin_caps:
        skill = REPO / ".claude" / "skills" / name.replace("_", "-") / "SKILL.md"
        assert skill.is_file(), f"missing short-name skill for {name}"
        front = yaml.safe_load(skill.read_text(encoding="utf-8").split("---")[1])
        assert front["name"] == name.replace("_", "-")
        assert re.search(rf"capability `{name}`", skill.read_text(encoding="utf-8"))


def test_harness_configs_point_at_studio_server_without_secrets():
    opencode = _load(REPO / "opencode.json")
    server = opencode["mcp"]["luxor9-studio"]
    assert server["type"] == "local" and server["command"][-1] == "lib/mcp_server.py"
    for provider in opencode["provider"].values():
        assert provider["options"]["apiKey"].startswith("{env:"), "keys must come from the environment"
    hermes = yaml.safe_load((REPO / "harnesses" / "hermes.config.snippet.yaml").read_text(encoding="utf-8"))
    assert hermes["mcp_servers"]["luxor9-studio"]["args"] == ["lib/mcp_server.py"]
    assert hermes["model"]["api_key"].startswith("${")
    dsh = yaml.safe_load((REPO / "harnesses" / "dsh.mcp.snippet.yml").read_text(encoding="utf-8"))
    assert next(iter(dsh.values()))["args"][-1].endswith("lib/mcp_server.py")
