# Luxor9 in any agent, on your own keys

**USP: bring your own agent, bring your own keys. Luxor9 brings the production layer.**

Run Luxor9 from Claude Code, OpenCode, Hermes Agent or DeepSeek Harness, powered by API keys you already pay for (NVIDIA NIM, OpenRouter, fal, MiniMax). The agent plans and writes. Luxor9 supplies:

- the video pipelines and their director skills (`AGENT_GUIDE.md`),
- the capability map with short names and the "mix" cost policy,
- the brand and compliance gate,
- model routing across whatever keys are present.

Generation is billed by each provider to the key owner. Luxor9 adds no markup.

## What each key unlocks

| Key | Unlocks | Status |
|---|---|---|
| `OPENROUTER_API_KEY` | **Video generation** through `tools/video/openrouter_video.py`: one key for every video model OpenRouter lists (`operation=list_models`). Also planning and scripting through the `openrouter` model alias. | Built and tested against OpenRouter's documented API. OpenRouter marks the API as subject to change. |
| `NVIDIA_API_KEY` | **Planning, scripting and prompt writing** through the `nim` model alias (OpenAI-compatible, `integrate.api.nvidia.com/v1`). | Endpoint shape from NVIDIA-compatible client docs. Check model ids in the NVIDIA catalog. |
| `NVIDIA_API_KEY` for **video** | Not today. Hosted NVIDIA video (Cosmos) access is unconfirmed; Cosmos NIM is documented as a container you run on your own GPUs. | Planned with GPU workers (`docs/architecture/luxor9-platform.md` §23). |
| `FAL_KEY` | Video through the existing fal tools (Kling, MiniMax, Veo, Seedance). | Existing integrations. |
| `MINIMAX_API_KEY` + `MINIMAX_API_HOST` | "Motion" through the `luxor9-minimax` plugin (MiniMax's own MCP server). | Plugin config validated. |

Ask any agent connected to the Studio server to call `key_status` to see which keys are set (it reports presence only, never values).

## Setup by harness

All harnesses read this repo's `AGENTS.md`, which routes them to `AGENT_GUIDE.md`. Generation runs from the repo shell. Export your keys there, or put them in `.env` (gitignored), which the tools load automatically.

| Harness | MCP server | Your keys as the model | Verification |
|---|---|---|---|
| **Claude Code** | `.mcp.json` (auto, project scope) | n/a (uses your Claude plan) | Tested in this repo |
| **OpenCode** | `opencode.json` at the repo root (auto when you open the repo) | `nim` and `openrouter-byok` providers in the same file, keys via `{env:...}` | Config shape from opencode.ai docs; run `opencode` in the repo to confirm |
| **Hermes Agent** | Merge `harnesses/hermes.config.snippet.yaml` into `~/.hermes/config.yaml`, set `cwd`, run `/reload-mcp` | `model:` block in the same snippet | MCP keys from Hermes docs; model-block keys from provider guides |
| **DeepSeek Harness (dsh)** | `harnesses/dsh.mcp.snippet.yml` via the official `@deepseek-ai/dsh-mcp-client` plugin | `harnesses/dsh.providers.snippet.yaml` or Settings → Models | **Version-dependent:** dsh is a developer preview with breaking changes; check its docs |

## Names stay hidden from end users, not from key owners

In the Studio surface, end users see capability labels ("Motion", "Ad creation"), never model names. A key owner still sees per-model charges on their own provider dashboard. That's expected: BYOK is for owners and developers, while the hosted Luxor9 product (credits, names hidden) is in `docs/architecture/luxor9-platform.md`.
