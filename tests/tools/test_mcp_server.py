"""Tests for the LUXOR9 Studio MCP server (lib/mcp_server.py)."""
from __future__ import annotations

import asyncio
import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

pytest.importorskip("mcp")

from lib import mcp_server  # noqa: E402

REPO = Path(__file__).resolve().parents[2]


def test_registers_expected_tools():
    names = {t.name for t in asyncio.run(mcp_server.mcp.list_tools())}
    assert names == {"list_capabilities", "capability_route", "brand_check", "list_models", "ask_model"}


def test_tools_return_studio_data():
    catalog = mcp_server.list_capabilities()
    assert {"name": "ad", "label": "Ad creation"}.items() <= next(c for c in catalog if c["name"] == "ad").items()
    assert mcp_server.capability_route("ad")["tier"] == "free"
    assert "premium-only" in mcp_server.capability_route("motion")["error"]
    report = mcp_server.brand_check(texts={"cta": "Guaranteed returns"}, colors=["#79C6BF"])
    assert report["passed"] is False
    assert mcp_server.brand_check(brand="../x")["error"]
    assert "local" in mcp_server.list_models()
    assert mcp_server.ask_model("hi", endpoint="nope").startswith("error:")


def test_stdio_server_answers_initialize_and_tools_list():
    """Start the real server process the way .mcp.json does and speak MCP to it."""
    proc = subprocess.Popen(
        [sys.executable, "lib/mcp_server.py"],
        cwd=REPO, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        text=True, env={**os.environ, "PYTHONPATH": ""},
    )
    try:
        def send(msg):
            proc.stdin.write(json.dumps(msg) + "\n")
            proc.stdin.flush()

        send({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {
            "protocolVersion": "2024-11-05", "capabilities": {},
            "clientInfo": {"name": "test", "version": "0"}}})
        init = json.loads(proc.stdout.readline())
        assert init["result"]["serverInfo"]["name"] == "luxor9-studio"
        send({"jsonrpc": "2.0", "method": "notifications/initialized"})
        send({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
        tools = json.loads(proc.stdout.readline())["result"]["tools"]
        assert "list_capabilities" in {t["name"] for t in tools}
    finally:
        proc.kill()
        proc.wait(timeout=10)
