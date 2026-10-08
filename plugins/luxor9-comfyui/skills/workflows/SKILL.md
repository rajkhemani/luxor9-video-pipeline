---
name: workflows
description: LUXOR9 Studio "Custom workflows" capability. Use when the user wants to run their own ComfyUI image or video workflow (a saved graph, LoRA, ControlNet or open-weights model) through the local comfy MCP server.
---

# Custom workflows

Runs the owner's own image and video graphs on a local ComfyUI through the `comfy` MCP server (the `comfy-mcp` command).

## Setup (owner only, once)

```bash
pip install "comfy-cli>=1.14.0" comfy-mcp
comfy install    # skip if a ComfyUI workspace already exists
comfy launch     # keep it running; the MCP server does not start ComfyUI
```

If `comfy` is not on the PATH Claude Code uses, register the server yourself instead:
`claude mcp add comfy -e COMFY_BIN=/path/to/venv/bin/comfy -- comfy-mcp`.

Hosted alternative: a Comfy Cloud connector, when connected to the session, covers the same capability without a local GPU (paid credits).

## Rules

- **Short names only:** to the user this is "Custom workflows". Do not name ComfyUI, node packs or model checkpoints in user-facing replies.
- **Cost:** local runs are the free route under the Studio "mix" policy. Comfy Cloud or partner-API nodes are a premium upgrade: confirm with the user per asset first.
- **Licenses:** check each checkpoint's license before commercial use (some open weights are non-commercial). Record the checkpoint name and license in the project's decision log.
- **Brand:** run `brand_check` (luxor9-studio server) on every output before presenting it. Save outputs under `projects/<project-name>/assets/`.
