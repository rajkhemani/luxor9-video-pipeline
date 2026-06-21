"""
LUXOR9 - LLM Engine

Central LangChain wrapper for all 179 agents. Handles:
- Tiered model routing (T0/T1 → GPT-4o, T2-T4 → GPT-4o-mini)
- Fallback chains (OpenAI → Anthropic → Groq)
- Token budget enforcement
- Tool binding per agent tier
- Structured JSON output parsing
- Graceful degradation when no API keys are set
"""
import json
import logging
import asyncio
from typing import Dict, List, Optional, Any, AsyncIterator
from functools import lru_cache

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.tools import BaseTool

logger = logging.getLogger("luxor9.llm")

PROVIDERS = ["openai", "anthropic", "groq"]


# ─── Token budgets per tier ────────────────────────────────
TIER_TOKEN_BUDGETS = {
    0: 4096,   # PRIME — large context for strategic decisions
    1: 3072,   # C-Suite — substantial for domain reasoning
    2: 2048,   # VPs — operational decisions
    3: 1024,   # Managers — task routing
    4: 512,    # Workers — simple execution
}

# ─── Model mapping per tier ────────────────────────────────
TIER_MODELS = {
    0: "gpt-4o",
    1: "gpt-4o",
    2: "gpt-4o-mini",
    3: "gpt-4o-mini",
    4: "gpt-4o-mini",
}


class LLMEngine:
    """
    Central LLM engine that all LUXOR9 agents call for reasoning.
    
    Supports fallback: OpenAI → Anthropic → Groq → stub response.
    """

    def __init__(self, settings):
        self.settings = settings
        self._models = {}
        self._initialized = False

    def _ensure_init(self):
        """Lazy-init models only when first needed."""
        if self._initialized:
            return
        self._initialized = True

        # Try OpenAI
        if self.settings.openai_api_key:
            try:
                from langchain_openai import ChatOpenAI
                self._models["gpt-4o"] = ChatOpenAI(
                    model="gpt-4o",
                    api_key=self.settings.openai_api_key,
                    temperature=0.7,
                    max_tokens=4096,
                )
                self._models["gpt-4o-mini"] = ChatOpenAI(
                    model="gpt-4o-mini",
                    api_key=self.settings.openai_api_key,
                    temperature=0.7,
                    max_tokens=2048,
                )
                self._primary_provider = "openai"
                logger.info("✓ OpenAI models initialized")
            except Exception as e:
                logger.warning(f"OpenAI init failed: {e}")

        # Try Anthropic as fallback
        if self.settings.anthropic_api_key and "gpt-4o" not in self._models:
            try:
                from langchain_anthropic import ChatAnthropic
                self._models["gpt-4o"] = ChatAnthropic(
                    model="claude-3-5-sonnet-20241022",
                    anthropic_api_key=self.settings.anthropic_api_key,
                    temperature=0.7,
                    max_tokens=4096,
                )
                self._models["gpt-4o-mini"] = ChatAnthropic(
                    model="claude-3-haiku-20240307",
                    anthropic_api_key=self.settings.anthropic_api_key,
                    temperature=0.7,
                    max_tokens=2048,
                )
                self._primary_provider = "anthropic"
                logger.info("✓ Anthropic models initialized (fallback)")
            except Exception as e:
                logger.warning(f"Anthropic init failed: {e}")

        # Try Groq as final fallback
        if self.settings.groq_api_key and "gpt-4o" not in self._models:
            try:
                from langchain_groq import ChatGroq
                self._models["gpt-4o"] = ChatGroq(
                    model="llama-3.1-70b-versatile",
                    groq_api_key=self.settings.groq_api_key,
                    temperature=0.7,
                    max_tokens=4096,
                )
                self._models["gpt-4o-mini"] = ChatGroq(
                    model="llama-3.1-8b-instant",
                    groq_api_key=self.settings.groq_api_key,
                    temperature=0.7,
                    max_tokens=2048,
                )
                self._primary_provider = "groq"
                logger.info("✓ Groq models initialized (fallback)")
            except Exception as e:
                logger.warning(f"Groq init failed: {e}")

        if not self._models:
            self._primary_provider = None
            logger.warning(
                "⚠ No LLM API keys configured — agents will use stub responses. "
                "Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GROQ_API_KEY in .env"
            )

    def get_model_for_tier(self, tier: int):
        """Get the appropriate LLM model for an agent's tier."""
        self._ensure_init()
        model_name = TIER_MODELS.get(tier, "gpt-4o-mini")
        return self._models.get(model_name)

    def get_token_budget(self, tier: int) -> int:
        """Get max tokens for a tier."""
        return TIER_TOKEN_BUDGETS.get(tier, 512)

    def get_provider(self) -> Optional[str]:
        """Get the active LLM provider."""
        return getattr(self, "_primary_provider", None)

    async def stream_reason(
        self,
        agent,
        prompt: str,
        tools: Optional[List[BaseTool]] = None,
    ) -> AsyncIterator[str]:
        """Streaming version of reason() for real-time output."""
        self._ensure_init()
        model = self.get_model_for_tier(agent.tier)

        if model is None:
            yield "⚠ No LLM configured - simulation mode"
            return

        try:
            messages = [
                SystemMessage(content=agent.personality),
                HumanMessage(content=self._build_context(agent, prompt)),
            ]

            if tools:
                model_with_tools = model.bind_tools(tools)
                async for chunk in model_with_tools.astream(messages):
                    if hasattr(chunk, "content") and chunk.content:
                        yield chunk.content
            else:
                async for chunk in model.astream(messages):
                    if hasattr(chunk, "content") and chunk.content:
                        yield chunk.content
        except Exception as e:
            logger.error(f"[{agent.agent_id}] Streaming error: {e}")
            yield f"Error: {e}"

    async def reason(
        self,
        agent,
        prompt: str,
        tools: Optional[List[BaseTool]] = None,
    ) -> Dict[str, Any]:
        """
        Main reasoning method called by every agent's think() cycle.

        Args:
            agent: The BaseAgent instance calling this
            prompt: The reasoning prompt with context
            tools: Optional list of LangChain tools to bind

        Returns:
            Parsed dict with agent's decisions, or stub response
        """
        self._ensure_init()

        model = self.get_model_for_tier(agent.tier)

        # Graceful degradation — no model available
        if model is None:
            return self._stub_response(agent, prompt)

        try:
            # Build messages
            messages = [
                SystemMessage(content=agent.personality),
                HumanMessage(content=self._build_context(agent, prompt)),
            ]

            # Bind tools if provided
            if tools:
                model_with_tools = model.bind_tools(tools)
                response = await model_with_tools.ainvoke(messages)

                # If the model wants to call tools, execute them
                if response.tool_calls:
                    return await self._execute_tool_calls(
                        agent, model_with_tools, messages, response, tools
                    )
            else:
                response = await model.ainvoke(messages)

            # Track token usage
            token_count = 0
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                token_count = response.usage_metadata.get("total_tokens", 0)
            elif hasattr(response, "response_metadata") and response.response_metadata:
                token_count = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)
            if token_count and hasattr(agent, "metrics"):
                agent.metrics.tokens_used += token_count

            # Parse response
            return self._parse_response(response.content, agent)

        except Exception as e:
            logger.error(f"[{agent.agent_id}] LLM error: {e}")
            await agent._log_event("llm_error", {"error": str(e)})
            return self._stub_response(agent, prompt)

    async def _execute_tool_calls(
        self, agent, model, messages, ai_response, tools
    ) -> Dict:
        """Execute tool calls from the LLM and return final response."""
        from langchain_core.messages import ToolMessage

        # Build tool lookup
        tool_map = {t.name: t for t in tools}
        results = []

        for tool_call in ai_response.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]

            tool = tool_map.get(tool_name)
            if tool:
                try:
                    result = tool.invoke(tool_args)
                    results.append({
                        "tool": tool_name,
                        "args": tool_args,
                        "result": result,
                    })
                    logger.info(f"[{agent.agent_id}] Tool: {tool_name}({tool_args}) → OK")
                except Exception as e:
                    results.append({
                        "tool": tool_name,
                        "error": str(e),
                    })
                    logger.warning(f"[{agent.agent_id}] Tool error: {tool_name}: {e}")

        # Add tool results to messages and get final response
        messages.append(ai_response)
        for i, tool_call in enumerate(ai_response.tool_calls):
            result_str = json.dumps(results[i]) if i < len(results) else "{}"
            messages.append(ToolMessage(
                content=result_str,
                tool_call_id=tool_call["id"],
            ))

        final_response = await model.ainvoke(messages)

        # Track tokens
        token_count = 0
        if hasattr(final_response, "usage_metadata") and final_response.usage_metadata:
            token_count = final_response.usage_metadata.get("total_tokens", 0)
        elif hasattr(final_response, "response_metadata") and final_response.response_metadata:
            token_count = final_response.response_metadata.get("token_usage", {}).get("total_tokens", 0)
        if token_count and hasattr(agent, "metrics"):
            agent.metrics.tokens_used += token_count

        parsed = self._parse_response(final_response.content, agent)
        parsed["tool_results"] = results
        return parsed

    def _build_context(self, agent, prompt: str) -> str:
        """Build context string with recent memory."""
        # Include recent memory (last N based on tier)
        memory_window = min(len(agent.memory), 5 + (4 - agent.tier) * 3)
        recent_memory = agent.memory[-memory_window:] if agent.memory else []

        context_parts = [prompt]

        if recent_memory:
            context_parts.append("\n--- RECENT MEMORY ---")
            for entry in recent_memory:
                entry_type = entry.get("type", "unknown")
                if entry_type == "sent":
                    msg = entry.get("msg", {})
                    context_parts.append(
                        f"[SENT to {msg.get('to_agent_id', '?')}] "
                        f"{msg.get('type', '?')}: {json.dumps(msg.get('payload', {}))[:200]}"
                    )
                elif "msg" in entry:
                    msg = entry.get("msg", {})
                    context_parts.append(
                        f"[{entry_type.upper()}] {json.dumps(msg)[:200]}"
                    )

        context_parts.append(
            f"\n--- AGENT STATE ---\n"
            f"Tasks completed: {agent.metrics.tasks_completed} | "
            f"Failed: {agent.metrics.tasks_failed} | "
            f"Success rate: {agent.success_rate:.1f}% | "
            f"Revenue: ${agent.metrics.revenue_generated:.2f} | "
            f"Children: {len(agent.children)}"
        )

        return "\n".join(context_parts)

    def _parse_response(self, content: str, agent) -> Dict:
        """Parse LLM response, attempting JSON extraction."""
        # Try to parse as JSON
        try:
            # Handle markdown-wrapped JSON
            cleaned = content.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                cleaned = "\n".join(lines[1:-1])
            return json.loads(cleaned)
        except (json.JSONDecodeError, ValueError):
            pass

        # Try to extract JSON from within the text
        try:
            start = content.index("{")
            end = content.rindex("}") + 1
            return json.loads(content[start:end])
        except (ValueError, json.JSONDecodeError):
            pass

        # Return as unstructured text
        return {
            "raw_response": content,
            "decisions": [],
            "directives": [],
            "alerts": [],
        }

    def _stub_response(self, agent, prompt: str) -> Dict:
        """Fallback stub response when no LLM is available."""
        logger.debug(f"[{agent.agent_id}] Using stub response (no LLM configured)")
        return {
            "decisions": [],
            "directives": [],
            "alerts": [],
            "status": "stub",
            "note": f"No LLM configured. {agent.name} is in simulation mode.",
        }


# ─── Singleton ──────────────────────────────────────────────

_engine: Optional[LLMEngine] = None


def get_engine() -> LLMEngine:
    """Get or create the global LLM engine singleton."""
    global _engine
    if _engine is None:
        from app.config import get_settings
        _engine = get_engine_for_settings(get_settings())
    return _engine


@lru_cache()
def get_engine_for_settings(settings) -> LLMEngine:
    """Create an engine for specific settings (cached)."""
    return LLMEngine(settings)
