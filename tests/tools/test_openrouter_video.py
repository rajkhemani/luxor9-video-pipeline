"""Tests for tools/video/openrouter_video.py against a local stub of the OpenRouter video API."""
from __future__ import annotations

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

from tools.video.openrouter_video import OpenRouterVideo

FAKE_MP4 = b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 64


class _Stub(BaseHTTPRequestHandler):
    base = ""
    polls_before_done = 1
    final_state = "completed"
    polling_host = None  # override to simulate a foreign polling URL
    seen: list = []

    def _send(self, code, body, ctype="application/json"):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):  # noqa: N802
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))
        type(self).seen.append(("POST", self.path, self.headers.get("Authorization"), body))
        host = type(self).polling_host or type(self).base
        self._send(202, {"id": "job1", "polling_url": f"{host}/videos/job1", "status": "pending"})

    def do_GET(self):  # noqa: N802
        cls = type(self)
        cls.seen.append(("GET", self.path, self.headers.get("Authorization"), None))
        if self.path == "/api/v1/videos/models":
            return self._send(200, {"data": [{"id": "test/video-model", "supported_durations": [4, 8]}]})
        if self.path == "/api/v1/videos/job1":
            if cls.polls_before_done > 0:
                cls.polls_before_done -= 1
                return self._send(200, {"id": "job1", "status": "in_progress"})
            if cls.final_state == "failed":
                return self._send(200, {"id": "job1", "status": "failed", "error": "moderation"})
            if cls.final_state == "stuck":
                return self._send(200, {"id": "job1", "status": "in_progress"})
            return self._send(200, {
                "id": "job1", "status": "completed",
                "unsigned_urls": [f"{cls.base}/videos/job1/content?index=0"],
                "usage": {"cost": 0.42, "is_byok": True},
            })
        if self.path.startswith("/api/v1/videos/job1/content"):
            return self._send(200, FAKE_MP4, "video/mp4")
        self._send(404, {"error": "not found"})

    def log_message(self, *args):
        pass


@pytest.fixture
def stub(monkeypatch):
    httpd = HTTPServer(("127.0.0.1", 0), _Stub)
    base = f"http://127.0.0.1:{httpd.server_port}/api/v1"
    _Stub.base, _Stub.polls_before_done, _Stub.final_state, _Stub.polling_host, _Stub.seen = base, 1, "completed", None, []
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    monkeypatch.setenv("OPENROUTER_BASE_URL", base)
    monkeypatch.setenv("OPENROUTER_API_KEY", "sk-or-test")
    monkeypatch.delenv("OPENROUTER_VIDEO_MODEL", raising=False)
    yield base
    httpd.shutdown()


def _run(tmp_path, **inputs):
    params = {"prompt": "a watch on wet slate", "model": "test/video-model",
              "output_path": str(tmp_path / "out.mp4"), "poll_interval_seconds": 0.01}
    params.update(inputs)
    return OpenRouterVideo().execute(params)


def test_generate_submits_polls_and_downloads_with_auth(stub, tmp_path):
    result = _run(tmp_path, duration=4, aspect_ratio="9:16", image_url="https://example.com/first.png")
    assert result.success, result.error
    assert (tmp_path / "out.mp4").read_bytes() == FAKE_MP4
    assert result.cost_usd == pytest.approx(0.42)
    assert result.data["is_byok"] is True
    method, path, auth, body = _Stub.seen[0]
    assert (method, path, auth) == ("POST", "/api/v1/videos", "Bearer sk-or-test")
    assert body["model"] == "test/video-model" and body["duration"] == 4 and body["aspect_ratio"] == "9:16"
    assert body["frame_images"][0]["frame_type"] == "first_frame"
    content_calls = [s for s in _Stub.seen if s[1].startswith("/api/v1/videos/job1/content")]
    assert content_calls and content_calls[0][2] == "Bearer sk-or-test"


def test_failed_job_and_timeout(stub, tmp_path):
    _Stub.final_state = "failed"
    assert "moderation" in _run(tmp_path).error
    _Stub.final_state, _Stub.polls_before_done = "stuck", 0
    result = _run(tmp_path, timeout_seconds=0.05)
    assert not result.success and "timed out" in result.error


def test_refuses_foreign_polling_url(stub, tmp_path):
    _Stub.polling_host = "http://169.254.169.254/api/v1"
    result = _run(tmp_path)
    assert not result.success and "outside the OpenRouter host" in result.error


def test_needs_key_and_model(stub, tmp_path, monkeypatch):
    assert "No video model" in _run(tmp_path, model=None).error
    monkeypatch.setenv("OPENROUTER_VIDEO_MODEL", "test/video-model")
    assert _run(tmp_path, model=None).success
    monkeypatch.delenv("OPENROUTER_API_KEY")
    tool = OpenRouterVideo()
    assert tool.get_status().value == "unavailable"
    assert "OPENROUTER_API_KEY" in tool.execute({"prompt": "x"}).error


def test_list_models(stub):
    result = OpenRouterVideo().execute({"operation": "list_models"})
    assert result.success and result.data["models"][0]["id"] == "test/video-model"
