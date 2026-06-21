"""LUXOR9 - Free Video Worker Agent — Tier 4

Free video workers use only free, open-source tools:
- gTTS / edge-tts for voiceover (no API key)
- Remotion for video composition (free, open-source)
- ComfyUI for AI image/video generation (optional, local)

No paid APIs required. Everything runs on your machine.
"""
import json
import logging
import os
import subprocess
from typing import Dict, Optional, List
from app.agents.base_agent import BaseAgent, AgentClass, AgentStatus

logger = logging.getLogger("luxor9.free_video_worker")

ORCHESTRATOR_CLI = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "..",
    "packages", "video-orchestrator", "src", "cli.ts"
)

FREE_VIDEO_CAPABILITIES = {
    "free-voiceover": {
        "name": "VoiceoverBot",
        "focus": "Generate voiceover audio from script text using gTTS/edge-tts",
        "tools": ["free_tts"],
    },
    "free-sales": {
        "name": "SalesVideoBot",
        "focus": "Create personalized sales videos with voiceover + animated text",
        "tools": ["free_sales"],
    },
    "free-check": {
        "name": "HealthBot",
        "focus": "Check availability of free services (TTS, ComfyUI)",
        "tools": ["free_check"],
    },
    "comfyui": {
        "name": "ComfyUIBot",
        "focus": "Run ComfyUI workflows for AI image/video generation",
        "tools": ["comfyui_run", "comfyui_check"],
    },
}


class FreeVideoWorkerAgent(BaseAgent):
    """Free Video Worker Agent — Executes video tasks using free tools only."""

    def __init__(
        self,
        agent_id: str,
        name: str,
        worker_type: str,
        category_id: int,
        parent_agent_id: str,
        orchestrator_path: str = ORCHESTRATOR_CLI,
    ):
        capability = FREE_VIDEO_CAPABILITIES.get(worker_type, {})
        super().__init__(
            agent_id=agent_id,
            name=name,
            tier=4,
            role=f"worker_free_video_{worker_type}",
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
You are a {capability.get('name', 'FreeVideoWorker')} for the Luxor9 Empire.

FOCUS: {capability.get('focus', 'Free video production')}
TOOLS: {', '.join(capability.get('tools', []))}

RESPONSIBILITIES:
- Create videos using only free, open-source tools
- Generate voiceover with gTTS (Google TTS, no API key needed)
- Compose videos with Remotion (open-source video engine)
- Run ComfyUI workflows for AI image/video generation when available
- Report completion with video URLs and metadata
- Escalate issues after 3 failed attempts

AUTHORITY: Limited — can only execute assigned video tasks.

COST: $0.00 — No paid APIs used.

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

            if action in FREE_VIDEO_CAPABILITIES.get(self.worker_type, {}).get("tools", []):
                result = await self._run_orchestrator(action, params)
                self.metrics.tasks_completed += 1
                return {"status": "success", "action": action, "result": result}

            prompt = f"""
TASK ASSIGNED: {json.dumps(task)}
YOUR TYPE: {self.worker_type} ({self.capability.get('focus', '')})
Execute this free video production task using only free tools.
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
            "free_tts": "free-tts",
            "free_sales": "free-sales",
            "free_check": "free-check",
            "comfyui_run": "comfyui-run",
            "comfyui_check": "comfyui-check",
        }

        orchestrator_cmd = cmd_map.get(command)
        if not orchestrator_cmd:
            raise ValueError(f"Unknown orchestrator command: {command}")

        env = os.environ.copy()

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
