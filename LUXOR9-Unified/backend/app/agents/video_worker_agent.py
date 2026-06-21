"""LUXOR9 - Video Worker Agent — Tier 4"""
import json
import logging
import os
import subprocess
from typing import Dict, Optional
from app.agents.base_agent import BaseAgent, AgentClass, AgentStatus

logger = logging.getLogger("luxor9.video_worker")

ORCHESTRATOR_CLI = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "..",
    "packages", "video-orchestrator", "src", "cli.ts"
)

VIDEO_WORKER_CAPABILITIES = {
    "avatar": {
        "name": "AvatarBot",
        "focus": "HeyGen AI avatar video generation",
        "tools": ["heygen_generate"],
    },
    "video-edit": {
        "name": "EditBot",
        "focus": "Remotion video composition and rendering",
        "tools": ["remotion_render"],
    },
    "lip-sync": {
        "name": "LipSyncBot",
        "focus": "Muapi.ai LipSync — make any image talk",
        "tools": ["muapi_lip_sync"],
    },
    "video-gen": {
        "name": "VideoGenBot",
        "focus": "Muapi.ai text-to-video and image-to-video generation",
        "tools": ["muapi_t2v", "muapi_t2i"],
    },
    "social-publish": {
        "name": "SocialPubBot",
        "focus": "Batch social media video rendering and posting",
        "tools": ["social_batch_render"],
    },
    "pipeline": {
        "name": "PipelineBot",
        "focus": "Multi-step video production pipeline orchestration",
        "tools": ["sales_video", "product_demo", "custom_pipeline"],
    },
}


class VideoWorkerAgent(BaseAgent):
    def __init__(
        self,
        agent_id: str,
        name: str,
        worker_type: str,
        category_id: int,
        parent_agent_id: str,
        orchestrator_path: str = ORCHESTRATOR_CLI,
    ):
        capability = VIDEO_WORKER_CAPABILITIES.get(worker_type, {})
        super().__init__(
            agent_id=agent_id,
            name=name,
            tier=4,
            role=f"worker_video_{worker_type}",
            model="gpt-4o-mini",
            think_cycle_seconds=30,
            authority_level=3,
            parent_agent_id=parent_agent_id,
            personality=self._default_personality(worker_type, capability),
            agent_class=AgentClass.WORKER,
        )
        self.worker_type = worker_type
        self.category_id = category_id
        self.capability = capability
        self.orchestrator_path = orchestrator_path
        self.current_task: Optional[Dict] = None

    def _default_personality(self, worker_type: str, capability: Dict) -> str:
        return f"""
You are a {capability.get('name', 'VideoWorker')} for the Luxor9 Empire.

FOCUS: {capability.get('focus', 'Video production')}
TOOLS: {', '.join(capability.get('tools', []))}

RESPONSIBILITIES:
- Execute video production tasks using the orchestrator CLI
- Generate AI avatars, lip-sync videos, and composited video content
- Report completion with video URLs and metadata
- Escalate issues after 3 failed attempts

AUTHORITY: Limited — can only execute assigned video tasks.

OUTPUT FORMAT: Respond as JSON with:
- action: what you did
- result: outcome (including video URL if applicable)
- status: success/failed/needs_escalation
- revenue: any revenue generated (number or 0)
"""

    async def think(self):
        if not self.current_task:
            await self._check_for_task()
        if not self.current_task:
            return
        result = await self._execute_task(self.current_task)
        await self.send_report_up({
            "task_id": self.current_task.get("id", "unknown"),
            "worker_type": self.worker_type,
            "status": result.get("status", "completed"),
            "result": result,
        })
        self.current_task = None

    async def _check_for_task(self):
        for entry in self.memory:
            if entry.get("type") == "directive_received":
                msg = entry.get("msg", {})
                payload = msg.get("payload", {})
                if payload.get("action") == "execute_task":
                    self.current_task = payload.get("task", {})
                    break
        for msg in self.inbox:
            payload = msg.get("payload", {})
            if payload.get("action") == "execute_task":
                self.current_task = payload.get("task", {})
                break

    async def _execute_task(self, task: Dict) -> Dict:
        try:
            action = task.get("action", "")
            params = task.get("params", {})

            if action in VIDEO_WORKER_CAPABILITIES.get(self.worker_type, {}).get("tools", []):
                result = await self._run_orchestrator(action, params)
                self.metrics.tasks_completed += 1
                return {"status": "success", "action": action, "result": result}

            prompt = f"""
TASK ASSIGNED: {json.dumps(task)}
YOUR TYPE: {self.worker_type} ({self.capability.get('focus', '')})
Execute this video production task.
Respond as JSON with: action, result, status (success/failed), revenue (number).
"""
            result = await self.reason(prompt)
            status = result.get("status", "success")
            if status == "success":
                self.metrics.tasks_completed += 1
            else:
                self.metrics.tasks_failed += 1
                if self.metrics.tasks_failed >= 3:
                    await self.escalate({
                        "issue": "repeated_task_failure",
                        "task": task,
                        "failures": self.metrics.tasks_failed,
                    })
            return result

        except Exception as e:
            self.metrics.tasks_failed += 1
            logger.error(f"[{self.agent_id}] Task execution error: {e}")
            if self.metrics.tasks_failed >= 3:
                await self.escalate({
                    "issue": "repeated_task_failure",
                    "task": task,
                    "error": str(e),
                })
            return {"status": "failed", "error": str(e)}

    async def _run_orchestrator(self, command: str, params: Dict) -> Dict:
        cmd_map = {
            "heygen_generate": "heygen-generate",
            "muapi_lip_sync": "muapi-lip-sync",
            "muapi_t2v": "muapi-t2v",
            "muapi_t2i": "muapi-t2i",
            "remotion_render": "sales-video",
            "sales_video": "sales-video",
            "product_demo": "product-demo",
            "social_batch_render": "social-batch",
            "custom_pipeline": "custom-pipeline",
        }

        orchestrator_cmd = cmd_map.get(command)
        if not orchestrator_cmd:
            raise ValueError(f"Unknown orchestrator command: {command}")

        env = os.environ.copy()
        env["HEYGEN_API_KEY"] = env.get("HEYGEN_API_KEY", "")
        env["MUAPI_API_KEY"] = env.get("MUAPI_API_KEY", "")
        env["REMOTION_PROJECT_DIR"] = env.get(
            "REMOTION_PROJECT_DIR",
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "packages", "video-engine")
        )
        env["REMOTION_OUTPUT_DIR"] = env.get(
            "REMOTION_OUTPUT_DIR",
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "output", "videos")
        )

        try:
            result = subprocess.run(
                ["npx", "tsx", self.orchestrator_path, orchestrator_cmd, json.dumps(params)],
                capture_output=True, text=True, timeout=600, env=env,
            )

            if result.returncode != 0:
                error_msg = result.stderr.strip() or result.stdout.strip() or "Unknown error"
                raise RuntimeError(f"Orchestrator failed: {error_msg}")

            return json.loads(result.stdout.strip())

        except subprocess.TimeoutExpired:
            raise RuntimeError(f"Orchestrator command timed out: {orchestrator_cmd}")
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Orchestrator output parse error: {e}")
