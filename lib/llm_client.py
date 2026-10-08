"""Minimal client for OpenAI-compatible chat endpoints.

Endpoints are configured by alias under `llm.endpoints` in config.yaml, so
callers say `chat(messages, endpoint="local")` and never handle model names.
Any server that implements POST {base_url}/chat/completions works: Ollama,
vLLM, LM Studio, OpenRouter, and most hosted model APIs.
"""

from __future__ import annotations

import os
from typing import Any, Optional

import requests

from lib.config_model import LLMEndpoint, OpenMontageConfig


class LLMEndpointError(RuntimeError):
    """Unknown alias, missing API key, or a failed or malformed response."""


def list_endpoints(config: Optional[OpenMontageConfig] = None) -> list[str]:
    """Configured endpoint aliases (never model names)."""
    config = config or OpenMontageConfig.load()
    return sorted(config.llm.endpoints)


def get_endpoint(alias: str, config: Optional[OpenMontageConfig] = None) -> LLMEndpoint:
    config = config or OpenMontageConfig.load()
    endpoint = config.llm.endpoints.get(alias)
    if endpoint is None:
        raise LLMEndpointError(f"No LLM endpoint named {alias!r}. Configured: {sorted(config.llm.endpoints)}")
    return endpoint


def chat(
    messages: list[dict[str, str]],
    endpoint: str = "local",
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    config: Optional[OpenMontageConfig] = None,
) -> str:
    """Send a chat request to an aliased endpoint and return the reply text."""
    config = config or OpenMontageConfig.load()
    ep = get_endpoint(endpoint, config)
    headers = {"Content-Type": "application/json"}
    if ep.api_key_env:
        key = os.environ.get(ep.api_key_env)
        if not key:
            raise LLMEndpointError(f"Endpoint {endpoint!r} needs the {ep.api_key_env} environment variable")
        headers["Authorization"] = f"Bearer {key}"
    payload: dict[str, Any] = {
        "model": ep.model,
        "messages": messages,
        "temperature": config.llm.temperature if temperature is None else temperature,
        "max_tokens": config.llm.max_tokens if max_tokens is None else max_tokens,
    }
    try:
        response = requests.post(
            f"{ep.base_url.rstrip('/')}/chat/completions",
            json=payload,
            headers=headers,
            timeout=ep.timeout_seconds,
        )
    except requests.RequestException as exc:
        raise LLMEndpointError(f"Endpoint {endpoint!r} is unreachable: {exc}") from exc
    if response.status_code >= 400:
        raise LLMEndpointError(f"Endpoint {endpoint!r} returned HTTP {response.status_code}")
    try:
        return response.json()["choices"][0]["message"]["content"]
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        raise LLMEndpointError(f"Endpoint {endpoint!r} returned an unexpected response") from exc
