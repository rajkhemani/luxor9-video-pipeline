"""Video generation through OpenRouter's video API (bring your own key).

One OPENROUTER_API_KEY reaches every video model OpenRouter lists (for
example Veo, Sora, Kling, Seedance, Wan and MiniMax Hailuo, depending on the
current catalog). Flow, per OpenRouter's docs: POST /videos → poll the job's
polling_url → download unsigned_urls[0] with the same Authorization header.
OpenRouter marks this API as subject to change, so stability is experimental.

Unlike older provider tools, polling has a hard timeout, downloads are
streamed with a size cap, and only URLs on the OpenRouter host are fetched.
"""

from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Any, Optional
from urllib.parse import urlparse

from tools.base_tool import (
    BaseTool,
    Determinism,
    ExecutionMode,
    ResourceProfile,
    RetryPolicy,
    ToolResult,
    ToolRuntime,
    ToolStability,
    ToolStatus,
    ToolTier,
)

DEFAULT_BASE_URL = "https://openrouter.ai/api/v1"
MAX_DOWNLOAD_BYTES = 500 * 1024 * 1024


class OpenRouterVideo(BaseTool):
    name = "openrouter_video"
    version = "0.1.0"
    tier = ToolTier.GENERATE
    capability = "video_generation"
    provider = "openrouter"
    stability = ToolStability.EXPERIMENTAL
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.STOCHASTIC
    runtime = ToolRuntime.API

    dependencies = []
    install_instructions = (
        "Set OPENROUTER_API_KEY to your OpenRouter key (https://openrouter.ai/keys).\n"
        "  Optionally set OPENROUTER_VIDEO_MODEL to a default video model id; list ids with\n"
        "  operation=list_models."
    )
    agent_skills = ["ai-video-gen"]

    capabilities = ["text_to_video", "image_to_video", "list_models"]
    supports = {
        "text_to_video": True,
        "image_to_video": True,
        "first_last_frame": True,
        "native_audio": True,  # model-dependent (generate_audio)
        "byok": True,
    }
    best_for = [
        "one key for many video models (bring your own OpenRouter key)",
        "switching video models without new integrations",
    ]
    not_good_for = ["offline generation", "guaranteed fixed pricing (varies by model)"]
    fallback_tools = ["kling_video", "veo_video", "minimax_video"]

    input_schema = {
        "type": "object",
        "properties": {
            "operation": {"type": "string", "enum": ["generate", "list_models"], "default": "generate"},
            "prompt": {"type": "string"},
            "model": {
                "type": "string",
                "description": "OpenRouter video model id; defaults to $OPENROUTER_VIDEO_MODEL",
            },
            "duration": {"type": "integer", "description": "Seconds; must be a value the model supports"},
            "resolution": {"type": "string", "enum": ["480p", "720p", "768p", "1080p", "1K", "2K", "4K"]},
            "aspect_ratio": {
                "type": "string",
                "enum": ["16:9", "9:16", "1:1", "4:3", "3:4", "3:2", "2:3", "21:9", "9:21"],
            },
            "image_url": {"type": "string", "description": "First frame for image-to-video"},
            "last_frame_url": {"type": "string", "description": "Optional last frame"},
            "generate_audio": {"type": "boolean"},
            "seed": {"type": "integer"},
            "output_path": {"type": "string"},
            "timeout_seconds": {"type": "number", "default": 900},
            "poll_interval_seconds": {"type": "number", "default": 5},
        },
    }

    resource_profile = ResourceProfile(cpu_cores=1, ram_mb=256, vram_mb=0, disk_mb=500, network_required=True)
    retry_policy = RetryPolicy(max_retries=1, retryable_errors=["rate_limit", "timeout"])
    idempotency_key_fields = ["prompt", "model", "duration", "resolution", "aspect_ratio"]
    side_effects = ["writes video file to output_path", "calls OpenRouter API (billed to the key owner)"]
    user_visible_verification = ["Watch generated clip for motion coherence and prompt adherence"]

    # ---- helpers -------------------------------------------------------

    @staticmethod
    def _api_key() -> Optional[str]:
        return os.environ.get("OPENROUTER_API_KEY")

    @staticmethod
    def _base_url() -> str:
        return os.environ.get("OPENROUTER_BASE_URL", DEFAULT_BASE_URL).rstrip("/")

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self._api_key()}", "Content-Type": "application/json"}

    def _same_host(self, url: str) -> bool:
        base = urlparse(self._base_url())
        target = urlparse(url)
        return (target.scheme, target.netloc) == (base.scheme, base.netloc)

    def get_status(self) -> ToolStatus:
        return ToolStatus.AVAILABLE if self._api_key() else ToolStatus.UNAVAILABLE

    # ---- execute -------------------------------------------------------

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        if not self._api_key():
            return ToolResult(success=False, error="OPENROUTER_API_KEY not set. " + self.install_instructions)
        import requests

        if inputs.get("operation", "generate") == "list_models":
            try:
                resp = requests.get(f"{self._base_url()}/videos/models", headers=self._headers(), timeout=30)
                resp.raise_for_status()
                return ToolResult(success=True, data={"models": resp.json().get("data", resp.json())})
            except requests.RequestException as exc:
                return ToolResult(success=False, error=f"Could not list OpenRouter video models: {exc}")

        prompt = inputs.get("prompt")
        model = inputs.get("model") or os.environ.get("OPENROUTER_VIDEO_MODEL")
        if not prompt:
            return ToolResult(success=False, error="prompt is required")
        if not model:
            return ToolResult(
                success=False,
                error="No video model chosen: pass model or set OPENROUTER_VIDEO_MODEL (see operation=list_models)",
            )

        payload: dict[str, Any] = {"model": model, "prompt": prompt}
        for key in ("duration", "resolution", "aspect_ratio", "generate_audio", "seed"):
            if inputs.get(key) is not None:
                payload[key] = inputs[key]
        frames = []
        if inputs.get("image_url"):
            frames.append({"type": "image_url", "image_url": {"url": inputs["image_url"]}, "frame_type": "first_frame"})
        if inputs.get("last_frame_url"):
            frames.append({"type": "image_url", "image_url": {"url": inputs["last_frame_url"]}, "frame_type": "last_frame"})
        if frames:
            payload["frame_images"] = frames

        start = time.time()
        timeout = float(inputs.get("timeout_seconds", 900))
        interval = float(inputs.get("poll_interval_seconds", 5))
        try:
            submit = requests.post(f"{self._base_url()}/videos", headers=self._headers(), json=payload, timeout=30)
            if submit.status_code >= 400:
                return ToolResult(success=False, error=f"OpenRouter rejected the request (HTTP {submit.status_code}): {submit.text[:300]}")
            job = submit.json()
            job_id = job["id"]
            polling_url = job.get("polling_url") or f"{self._base_url()}/videos/{job_id}"
            if not self._same_host(polling_url):
                return ToolResult(success=False, error="Refusing to poll a URL outside the OpenRouter host")

            while True:
                status_resp = requests.get(polling_url, headers=self._headers(), timeout=30)
                status_resp.raise_for_status()
                status = status_resp.json()
                state = status.get("status")
                if state == "completed":
                    break
                if state == "failed":
                    return ToolResult(success=False, error=f"OpenRouter video job failed: {status.get('error')}")
                if time.time() - start > timeout:
                    return ToolResult(success=False, error=f"OpenRouter video job {job_id} timed out after {int(timeout)}s")
                time.sleep(interval)

            urls = status.get("unsigned_urls") or [f"{self._base_url()}/videos/{job_id}/content?index=0"]
            content_url = urls[0]
            if not self._same_host(content_url):
                return ToolResult(success=False, error="Refusing to download from outside the OpenRouter host")

            output_path = Path(inputs.get("output_path", "openrouter_output.mp4"))
            output_path.parent.mkdir(parents=True, exist_ok=True)
            written = 0
            with requests.get(content_url, headers=self._headers(), timeout=120, stream=True) as dl:
                dl.raise_for_status()
                with open(output_path, "wb") as f:
                    for chunk in dl.iter_content(chunk_size=1024 * 1024):
                        written += len(chunk)
                        if written > MAX_DOWNLOAD_BYTES:
                            f.close()
                            output_path.unlink(missing_ok=True)
                            return ToolResult(success=False, error="Downloaded video exceeds the size cap")
                        f.write(chunk)
        except (requests.RequestException, KeyError, ValueError) as exc:
            return ToolResult(success=False, error=f"OpenRouter video generation failed: {exc}")

        from tools.video._shared import probe_output

        usage = status.get("usage") or {}
        cost = float(usage.get("cost") or 0.0)
        return ToolResult(
            success=True,
            data={
                "provider": "openrouter",
                "model": model,
                "job_id": job_id,
                "prompt": prompt,
                "output": str(output_path),
                "output_path": str(output_path),
                "is_byok": usage.get("is_byok"),
                **probe_output(output_path),
            },
            artifacts=[str(output_path)],
            cost_usd=cost,
            duration_seconds=round(time.time() - start, 2),
            model=model,
        )
