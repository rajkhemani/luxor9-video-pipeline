"""Tests for the OpenAI-compatible LLM client (lib/llm_client.py).

Uses a local throwaway HTTP server, so no network or real model is needed.
"""
from __future__ import annotations

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

from lib.config_model import LLMConfig, LLMEndpoint, OpenMontageConfig
from lib.llm_client import LLMEndpointError, chat, list_endpoints


class _Handler(BaseHTTPRequestHandler):
    status = 200
    body: dict = {"choices": [{"message": {"content": "hello from the model"}}]}
    seen: list = []

    def do_POST(self):  # noqa: N802 - http.server API
        length = int(self.headers.get("Content-Length", 0))
        type(self).seen.append({
            "path": self.path,
            "auth": self.headers.get("Authorization"),
            "json": json.loads(self.rfile.read(length)),
        })
        payload = json.dumps(type(self).body).encode()
        self.send_response(type(self).status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, *args):
        pass


@pytest.fixture
def server():
    _Handler.status = 200
    _Handler.body = {"choices": [{"message": {"content": "hello from the model"}}]}
    _Handler.seen = []
    httpd = HTTPServer(("127.0.0.1", 0), _Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{httpd.server_port}/v1"
    httpd.shutdown()


def _config(base_url: str, api_key_env: str | None = None) -> OpenMontageConfig:
    return OpenMontageConfig(llm=LLMConfig(endpoints={
        "fast": LLMEndpoint(base_url=base_url, model="secret-model-7b", api_key_env=api_key_env, timeout_seconds=5),
    }))


def test_chat_posts_openai_shape_and_returns_text(server):
    reply = chat([{"role": "user", "content": "hi"}], endpoint="fast", config=_config(server), max_tokens=32)
    assert reply == "hello from the model"
    sent = _Handler.seen[0]
    assert sent["path"] == "/v1/chat/completions"
    assert sent["json"]["model"] == "secret-model-7b"
    assert sent["json"]["max_tokens"] == 32
    assert sent["auth"] is None


def test_api_key_comes_from_env(server, monkeypatch):
    monkeypatch.setenv("TEST_LLM_KEY", "sk-test")
    chat([{"role": "user", "content": "hi"}], endpoint="fast", config=_config(server, "TEST_LLM_KEY"))
    assert _Handler.seen[0]["auth"] == "Bearer sk-test"


def test_missing_key_fails_before_request(server, monkeypatch):
    monkeypatch.delenv("TEST_LLM_KEY", raising=False)
    with pytest.raises(LLMEndpointError, match="TEST_LLM_KEY"):
        chat([{"role": "user", "content": "hi"}], endpoint="fast", config=_config(server, "TEST_LLM_KEY"))
    assert _Handler.seen == []


def test_http_error_and_bad_body(server):
    _Handler.status = 500
    with pytest.raises(LLMEndpointError, match="HTTP 500"):
        chat([{"role": "user", "content": "hi"}], endpoint="fast", config=_config(server))
    _Handler.status = 200
    _Handler.body = {"unexpected": True}
    with pytest.raises(LLMEndpointError, match="unexpected response"):
        chat([{"role": "user", "content": "hi"}], endpoint="fast", config=_config(server))


def test_unknown_alias_and_unreachable():
    with pytest.raises(LLMEndpointError, match="No LLM endpoint"):
        chat([], endpoint="nope", config=_config("http://127.0.0.1:9"))
    with pytest.raises(LLMEndpointError, match="unreachable"):
        chat([], endpoint="fast", config=_config("http://127.0.0.1:9"))


def test_list_endpoints_returns_aliases_only(server):
    assert list_endpoints(_config(server)) == ["fast"]
    assert "local" in list_endpoints()  # from config.yaml
