"""LUXOR9 Studio MCP server (stdio).

Exposes the Studio layer to any MCP client: the short-name capability map,
the brand quality gate, and aliased OpenAI-compatible models. It does not
expose raw generation tools: production still runs through the pipelines
and their director skills (AGENT_GUIDE.md, Rule Zero).

Run from the repo root:  python lib/mcp_server.py
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Optional

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:  # allow `python lib/mcp_server.py`
    sys.path.insert(0, str(REPO_ROOT))

from mcp.server.fastmcp import FastMCP  # noqa: E402

from lib import capabilities, llm_client  # noqa: E402
from tools.analysis import brand_quality_gate  # noqa: E402

mcp = FastMCP("luxor9-studio")


@mcp.tool()
def list_capabilities() -> list[dict[str, Any]]:
    """What LUXOR9 Studio can make, by short name. Safe to show users as-is."""
    return capabilities.public_catalog()


@mcp.tool()
def capability_route(name: str, upgrade: bool = False) -> dict[str, Any]:
    """INTERNAL route (pipeline, tools, integration) for a capability.

    Free route unless the user explicitly upgraded this asset. Never show
    tool, provider or model names from this result to the user.
    """
    try:
        return capabilities.resolve(name, upgrade=upgrade).to_dict()
    except capabilities.CapabilityError as exc:
        return {"error": str(exc)}


@mcp.tool()
def brand_check(
    texts: Optional[dict[str, str]] = None,
    colors: Optional[list[str]] = None,
    metadata: Optional[dict[str, Any]] = None,
    claims: Optional[list[dict[str, Any]]] = None,
    brand: str = "luxor9",
) -> dict[str, Any]:
    """Run the brand quality gate on a deliverable before it ships."""
    result = brand_quality_gate.BrandQualityGate().execute({
        "texts": texts, "colors": colors, "metadata": metadata, "claims": claims, "brand": brand,
    })
    return result.data if result.success else {"error": result.error}


@mcp.tool()
def list_models() -> list[str]:
    """Aliases of configured OpenAI-compatible model endpoints (no model names)."""
    return llm_client.list_endpoints()


@mcp.tool()
def ask_model(prompt: str, endpoint: str = "local", system: Optional[str] = None) -> str:
    """Send one prompt to an aliased OpenAI-compatible model and return its reply."""
    messages = ([{"role": "system", "content": system}] if system else []) + [{"role": "user", "content": prompt}]
    try:
        return llm_client.chat(messages, endpoint=endpoint)
    except llm_client.LLMEndpointError as exc:
        return f"error: {exc}"


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
