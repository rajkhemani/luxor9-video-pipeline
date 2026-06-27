# OpenMontage

**MANDATORY: Read `AGENT_GUIDE.md` before responding to ANY user message.**
Do not act on the user's request until you have read AGENT_GUIDE.md — it contains routing rules that determine your first action based on what the user asked. Skipping it WILL cause you to take the wrong action.

This file is a quick-reference summary. `AGENT_GUIDE.md` is the canonical operating guide. `PROJECT_CONTEXT.md` covers architecture, key files, and conventions.

## Essentials

- **Tool convention:** PascalCase, no "Tool" suffix (e.g. `MusicGen`, not `MusicGenTool`). All calls via `.execute(params_dict)` returning `ToolResult` (`.success`, `.data`, `.error`), NOT `.run()`.
- **Preflight:** Run `provider_menu_summary()` first (human-readable). `support_envelope()` is a firehose — use only for debugging.
- **Composition runtimes:** Remotion (React/spring-animated) and HyperFrames (HTML/GSAP). **HARD RULE:** Present both to the user when both are available. Never silently swap.

## Commands

```bash
make setup                   # Full one-command install (pip + npm + piper-tts + hyperframes cache)
make test                    # pytest tests/ -v
make test-contracts          # pytest tests/contracts/ -v
make lint                    # py_compile on key tools
make preflight               # Show provider_menu()
make demo                    # Render zero-key Remotion demos
make hyperframes-doctor      # Validate HyperFrames runtime
make install-gpu             # Install GPU dependencies (Torch, diffusers)
```

- **Windows npm fix:** If `npm install` fails with `ERR_INVALID_ARG_TYPE`, use `npx --yes npm install` instead.
- **Agent platform configs:** `CLAUDE.md`, `CODEX.md`, `CURSOR.md`, `COPILOT.md`, `.windsurfrules` — all point to `AGENT_GUIDE.md`. No `.cursor/rules/` or `.github/copilot-instructions.md` exist yet.

## Key Config

| File | Purpose |
|------|---------|
| `AGENT_GUIDE.md` | Full operating guide & agent contract (read this first) |
| `PROJECT_CONTEXT.md` | Architecture reference, key files, conventions |
| `config.yaml` | Budget governance, checkpoint policy, output defaults |
| `.env` → `.env.example` | API keys (every key optional) |
| `pipeline_defs/*.yaml` | 12 pipeline manifests |
| `skills/INDEX.md` | Skill catalog (Layer 2 + Layer 3) |
| `schemas/` | Artifact, checkpoint, pipeline, style, tool schemas |

## Remix (Combined Runtime)

The `make remix-*` targets treat Remotion and HyperFrames as two tracks in a unified system:

- `make remix-setup` — Combined setup: Python deps + Remotion (npm install) + HyperFrames (npx cache) + Piper TTS + `.env` + runtime validation
- `make remix-check` — Validate both runtimes in one command (node_modules, npx, node >= 22, ffmpeg)
- `make remix-demo` — Render a Remotion demo, scaffold a HyperFrames composition, stitch them together

Use these instead of individual `make setup` / `make hyperframes-doctor` / `make demo` when you want the full runtime picture. The check script at `scripts/remix-check.py` can also be called directly. The `Makefile` is the canonical reference for all targets.
