<h1 align="center">LUXOR9</h1>

<p align="center"><strong>The LUXOR9 Video Pipeline — agentic video production, brand-grade output.</strong></p>

<p align="center">
  <a href="#what-is-luxor9">What Is LUXOR9</a> &nbsp;·&nbsp;
  <a href="#installation">Installation</a> &nbsp;·&nbsp;
  <a href="#end-to-end-install">End-to-End Install</a> &nbsp;·&nbsp;
  <a href="#path-h--the-agent-install-copy-paste-llm-prompts">LLM Install Prompts</a> &nbsp;·&nbsp;
  <a href="#pick-your-path">Pick Your Path</a> &nbsp;·&nbsp;
  <a href="#quick-start">Quick Start</a> &nbsp;·&nbsp;
  <a href="#pipelines">Pipelines</a> &nbsp;·&nbsp;
  <a href="#node-api-packages">Node API</a> &nbsp;·&nbsp;
  <a href="#deployment">Deployment</a> &nbsp;·&nbsp;
  <a href="#brand--campaign">Brand &amp; Campaign</a> &nbsp;·&nbsp;
  <a href="AGENT_GUIDE.md">Agent Guide</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/LUXOR9-Video%20Pipeline-C8A96A?style=for-the-badge&labelColor=030303" alt="LUXOR9 Video Pipeline">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-blue.svg?style=for-the-badge" alt="License"></a>
</p>

---

## What Is LUXOR9

LUXOR9 is a fork of [OpenMontage](https://github.com/calesthio/OpenMontage) — the open-source, agentic video production system — extended into a full brand production stack. Describe a video in plain language and your AI coding assistant (Claude Code, Cursor, Copilot, Windsurf, Codex) drives the entire production: research, scripting, asset generation, editing, and final composition.

On top of the upstream engine, this repository adds:

- **`social-creative` pipeline** — short-form brand ads from a single text brief, with platform-optimized variants for LinkedIn, Instagram/Facebook, X, Reddit, Threads, and YouTube Shorts.
- **LUXOR9 apps** — a Next.js design-system frontend (`apps/luxor9-final`) and a FastAPI backend (`apps/LUXOR9-Unified`).
- **One-command free-cloud deployment** — Fly.io, Railway, Render, Oracle Cloud, or local Docker via `deploy/deploy-free.sh`.
- **Brand & campaign framework** — the LUXOR9 visual identity ("Obsidian & Gold"), design tokens, and the Phase 1 master campaign orchestration docs.
- **LUXOR9 Studio + bring your own keys** — short capability names (`/ad`, `/carousel`, …) over hidden model routes, a `luxor9-studio` MCP server, a brand quality gate, and BYOK support for OpenRouter (video), NVIDIA NIM (planning) and MiniMax, usable from Claude Code, OpenCode, Hermes Agent or DeepSeek Harness. See [`harnesses/README.md`](harnesses/README.md).

The core loop is unchanged from upstream: pipelines are declarative YAML manifests, stage director skills teach the agent how to execute each stage, tools are auto-discovered through a registry, and every creative decision is checkpointed, reviewed, and logged.

```
research -> proposal -> script -> scene_plan -> assets -> edit -> compose
```

---

## Repository Layout

```
luxor9-video-pipeline/
├── tools/                  # Python production tools (video gen, TTS, music, compose, ...)
├── pipeline_defs/          # YAML pipeline manifests (incl. social-creative)
├── skills/                 # Stage director + meta skills (the agent's knowledge)
├── schemas/                # JSON Schema contracts for artifacts and checkpoints
├── styles/                 # Visual style playbooks
├── remotion-composer/      # React/Remotion composition engine
├── packages/               # video-orchestrator API + video-engine (Node) — see below
├── apps/
│   ├── luxor9-final/       # Next.js 15 frontend + LUXOR9 design system
│   │   └── docs/campaign/  # Phase 1 master campaign orchestration
│   └── LUXOR9-Unified/     # FastAPI backend
├── deploy/                 # Fly.io / Railway / Render / Oracle / Hetzner configs
├── lib/                    # Checkpoints, config, pipeline loader, Studio MCP server
├── capabilities.yaml       # Studio short names → hidden routes ("mix" cost policy)
├── brand/                  # Brand rules for the brand quality gate
├── .claude/skills/         # Studio short-name skills (/studio, /ad, /ugc, ...)
├── .mcp.json               # Registers the luxor9-studio MCP server (Claude Code)
├── plugins/                # Opt-in Claude Code plugins: Blender, ComfyUI, MiniMax
├── opencode.json           # OpenCode: Studio MCP server + NIM/OpenRouter providers
├── harnesses/              # Hermes + DeepSeek Harness config snippets, BYOK guide
└── tests/                  # Contract tests, QA integration tests
```

> **Two engines, one repo.** The **Python pipeline** at the repo root (`tools/`, `pipeline_defs/`, `skills/`) is the agent-driven production system and the primary way to make videos. The **Node service** in `packages/` is a separate HTTP/CLI surface for programmatic video generation — it was stubbed out during the fork merge and was [restored in full](docs/RECOVERY_STEP_1.md); all endpoints and CLI commands are live again. See [Node API](#node-api-packages) for what it exposes and its one known gap.

---

## Installation

There is no single "right" install. Pick the path that matches your situation —
every one is exact, tested, and ends in a working render.

> **New here?** Follow the [End-to-End Install](#end-to-end-install): zero to a finished ad, then onto
> your own keys, in one page. Or paste [one prompt](#path-h--the-agent-install-copy-paste-llm-prompts)
> into your AI assistant and let it install and verify for you.

### Pick your path

| # | Path | You want… | Time | Local deps |
|---|------|-----------|------|-----------|
| **A** | [The Speedrun](#path-a--the-speedrun-3-commands) | a rendered video, now, no keys | ~5 min | Python, Node, FFmpeg |
| **B** | [The Full Install](#path-b--the-full-install-staged--checkpointed) | the complete pipeline, staged & checkpointed | ~10 min | Python, Node, FFmpeg |
| **C** | [The Manual Install](#path-c--the-manual-install-no-make) | no `make` (typical on Windows), or you want to see every step | ~10 min | Python, Node, FFmpeg |
| **D** | [The Container](#path-d--the-container-zero-local-deps) | nothing installed on your machine | ~3 min | Docker only |
| **E** | [The Cloud](#path-e--the-cloud-one-command-deploy) | a hosted API, free tier | ~5 min | a CLI + account |
| **F** | [The Colab GPU](#path-f--the-colab-gpu-free-t4) | free GPU image/video generation | ~5 min | a browser |
| **G** | [The Codespace](#path-g--the-codespace--dev-container) | browser-only, nothing local | ~2 min | a browser |
| **H** | [The Agent Install](#path-h--the-agent-install-copy-paste-llm-prompts) | to paste one prompt and let your AI assistant install, verify and connect everything | ~15 min | Python, Node, FFmpeg + an agent |

All paths share **Stage 0** below. Do that first.

```
Stage 0 ─┬─> A  Speedrun ────────> render
         ├─> B  make setup ──────> render        ← recommended
         ├─> C  manual steps ────> render
         ├─> D  docker ──────────> API + render
         ├─> E  deploy-free.sh ──> hosted API
         ├─> F  Colab ───────────> GPU backend
         ├─> G  Codespace ───────> full env in browser
         └─> H  LLM prompts ─────> agent installs, verifies, connects Studio
```

---

### Stage 0 — System prerequisites

| Requirement | Minimum version | Required for |
|-------------|----------------|--------------|
| **Git** | any recent | cloning the repo |
| **Python** | 3.10+ (3.11 recommended) | the entire pipeline |
| **pip** | ships with Python | dependency install |
| **FFmpeg** | any recent | all composition and audio work |
| **Node.js + npm** | 18+ (**22+** if you want HyperFrames) | Remotion & HyperFrames rendering |
| **An AI coding assistant** | — | Claude Code, Cursor, Copilot, Windsurf, or Codex |

Install per OS:

**macOS** (with [Homebrew](https://brew.sh)):
```bash
brew install git python@3.11 ffmpeg node
```

**Ubuntu / Debian:**
```bash
sudo apt update
sudo apt install -y git python3 python3-pip python3-venv ffmpeg
# Node 22 via NodeSource (apt's default node is often too old):
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

**Windows** (PowerShell, with [winget](https://learn.microsoft.com/windows/package-manager/)):
```powershell
winget install Git.Git Python.Python.3.11 Gyan.FFmpeg OpenJS.NodeJS.LTS
# Re-open the terminal afterwards so PATH updates apply.
```

**✅ Checkpoint 0** — all four must succeed before continuing:
```bash
git --version
python3 --version   # >= 3.10   (Windows: python --version)
ffmpeg -version
node --version      # >= 18 (>= 22 for HyperFrames)
```

One-liner that checks all four and tells you what's missing:

```bash
for c in "git --version" "python3 --version" "ffmpeg -version" "node --version"; do
  printf '%-18s ' "${c%% *}"
  $c >/dev/null 2>&1 && echo "OK  $($c 2>&1 | head -1)" || echo "MISSING"
done
```

---

## Path A — The Speedrun (3 commands)

Clean machine to a rendered MP4, **no API keys**. Everything here is free and local.

```bash
git clone https://github.com/rajkhemani/luxor9-video-pipeline.git && cd luxor9-video-pipeline
make setup
make demo
```

Renders land in `projects/demos/renders/`. `make demo-list` shows the demos without rendering.

What you just got, with zero keys: Remotion composition (charts, text cards, KPI grids, terminal scenes), FFmpeg cuts and subtitle burn, Piper offline narration, free stock and public-domain archival footage (NASA, ESA, Wikimedia, Library of Congress, +12 more), and auto-generated subtitles.

> No `make`? Jump to [Path C](#path-c--the-manual-install-no-make).

---

## Path B — The Full Install (staged & checkpointed)

> Stages 1–4 are required (≈10 min). Stages 5–8 are optional add-ons.
> Every stage ends with a **checkpoint**; do not continue until it passes.

### Stage 1 — Clone the repository

```bash
git clone https://github.com/rajkhemani/luxor9-video-pipeline.git
cd luxor9-video-pipeline
```

All commands from here on run from the **repo root** (`luxor9-video-pipeline/`) unless a `cd` is shown.

*(Optional but recommended)* isolate Python deps in a virtualenv first:
```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
```

**✅ Checkpoint 1** — `ls pipeline_defs/ tools/ skills/` lists the pipeline manifests, tools, and skills directories.

### Stage 2 — Core pipeline install (one command)

```bash
make setup
```

`make setup` performs exactly five steps (see `Makefile`). If you have no `make`, run them
by hand — that's [Path C](#path-c--the-manual-install-no-make).

| # | What it does |
|---|--------------|
| 1 | Python core deps (`requirements.txt`) — `pyyaml`, `pydantic`, `jsonschema`, `python-dotenv`, `Pillow`, `requests`, `numpy`, `mcp` (Studio MCP server) |
| 2 | Remotion composer Node deps |
| 3 | Free offline TTS (Piper) — skipped gracefully if it fails |
| 4 | HyperFrames CLI cache-warm (≈20 MB, avoids a 30–60 s cold fetch on first render) |
| 5 | Create `.env` from the template (never overwrites an existing one) |

**Windows note:** if step 2 fails with `ERR_INVALID_ARG_TYPE`, run `npx --yes npm install` inside `remotion-composer/` instead.

**✅ Checkpoint 2:**
```bash
ls .env                                    # exists
ls remotion-composer/node_modules > /dev/null && echo "remotion deps OK"
python3 -c "import yaml, pydantic, jsonschema, dotenv, PIL, requests, numpy, mcp; print('python deps OK')"
```

### Stage 3 — Configure API keys in `.env`

Open `.env` (created at the repo root in Stage 2) and fill in what you have. **Every key is optional** — with zero keys you still get Piper narration, free stock/archival footage, Remotion + HyperFrames + FFmpeg composition, and auto-generated subtitles.

| Variable | Unlocks | Where to get it |
|----------|---------|-----------------|
| `FAL_KEY` | FLUX + Recraft images; Veo, Kling, MiniMax video (biggest single unlock) | [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) |
| `GOOGLE_API_KEY` | Google Imagen images + Google TTS (700+ voices) | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `ELEVENLABS_API_KEY` | Premium TTS, AI music, sound effects | elevenlabs.io |
| `OPENAI_API_KEY` | OpenAI TTS, DALL·E images | platform.openai.com |
| `XAI_API_KEY` | Grok image generation/editing + Grok video | x.ai |
| `SUNO_API_KEY` | Full songs / instrumentals | suno.com |
| `HEYGEN_API_KEY` | VEO, Sora, Runway, Kling, Seedance via one gateway | heygen.com |
| `RUNWAY_API_KEY` | Runway Gen-4 direct | runwayml.com |
| `PEXELS_API_KEY` / `PIXABAY_API_KEY` / `UNSPLASH_ACCESS_KEY` | Free stock footage & images | free developer keys on each site |
| `HF_TOKEN` | Speaker diarization in the transcriber | huggingface.co |
| `OPENROUTER_API_KEY` | Video generation through every model OpenRouter lists (`tools/video/openrouter_video.py`) + the `openrouter` planning-model alias | [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys) |
| `NVIDIA_API_KEY` | Planning and scripting on NVIDIA NIM text models (`nim` alias). **Not video** | [build.nvidia.com](https://build.nvidia.com) |
| `MINIMAX_API_KEY` + `MINIMAX_API_HOST` | "Motion" via the `luxor9-minimax` plugin. **Export in your shell too** — plugins don't read `.env` | MiniMax platform |

The full annotated list (incl. Doubao TTS, Modal LTX-2 endpoint, Wav2Lip/SadTalker paths) is in [`.env.example`](.env.example).

**✅ Checkpoint 3** — `.env` saved at the repo root; never commit it.

### Stage 4 — Verify the capability envelope + smoke test

```bash
make preflight
# or directly:
python -c "from tools.tool_registry import registry; import json; registry.discover(); print(json.dumps(registry.provider_menu_summary(), indent=2))"
```

This prints which capability families (video generation, images, TTS, music, composition) are configured, and which are one env var away from working.

Then render something with zero keys:

```bash
make demo             # zero-key demo videos (Remotion-only: charts, text, data viz)
make demo-list        # list available demos without rendering
make test-contracts   # contract test suite — no API keys needed
```

**✅ Checkpoint 4** — `make preflight` shows Composition configured (FFmpeg at minimum), `make demo` produces MP4 files, and `make test-contracts` passes. **The core install is complete.** Open the repo in your AI assistant and start producing (see [Quick Start](#quick-start)).

---

### Stage 5 (optional) — Local GPU video generation (free, needs NVIDIA GPU)

```bash
make install-gpu      # torch, torchaudio, torchvision + diffusers, transformers, accelerate
```

Then enable it in `.env`:
```bash
VIDEO_GEN_LOCAL_ENABLED=true
VIDEO_GEN_LOCAL_MODEL=wan2.1-1.3b   # or: wan2.1-14b, hunyuan-1.5, ltx2-local, cogvideo-5b
```

**✅ Checkpoint 5** — `make preflight` now lists the local video model under video generation.

### Stage 6 (optional) — LUXOR9 frontend (Next.js 15 design system)

```bash
cd apps/luxor9-final
npm install
npm run dev           # dev server at http://localhost:3000
npm run build         # production build
cd ../..
```

### Stage 7 (optional) — LUXOR9 backend (FastAPI)

```bash
cd apps/LUXOR9-Unified/backend
pip install -r requirements.txt
python main.py
# — or containerized —
docker build -t luxor9-backend .
docker run -p 8000:8000 luxor9-backend
cd ../../..
```

### Stage 8 (optional) — HyperFrames deep-check & the Remix stack

HyperFrames (HTML/CSS/GSAP composition) needs **Node ≥ 22**:

```bash
make hyperframes-doctor   # full runtime probe: node/ffmpeg/npx + `hyperframes doctor`
make hyperframes-warm     # refresh the npx cache to the latest release
```

Combined Remotion + HyperFrames validation ("Remix" stack):

```bash
make remix-setup      # guided 6-step setup with per-step OK/FAIL output
make remix-check      # validate both runtimes
make remix-demo       # render a combined Remotion + HyperFrames demo
```

---

## Path C — The Manual Install (no `make`)

Every `make setup` step, spelled out. Use this on Windows, in restricted
environments, or when you want to see exactly what touches your machine.

```bash
# 1. Clone
git clone https://github.com/rajkhemani/luxor9-video-pipeline.git
cd luxor9-video-pipeline

# 2. Isolate Python (recommended)
python3 -m venv .venv
source .venv/bin/activate              # Windows: .venv\Scripts\Activate.ps1

# 3. Python core deps
pip install -r requirements.txt        # add -r requirements-dev.txt for pytest

# 4. Remotion composer
cd remotion-composer && npm install && cd ..
#    Windows, if ERR_INVALID_ARG_TYPE:  npx --yes npm install

# 5. Free offline TTS (optional — cloud TTS works without it)
pip install piper-tts

# 6. HyperFrames cache-warm (optional, Node >= 22)
npx --yes hyperframes --version

# 7. Environment file
cp .env.example .env                   # Windows: copy .env.example .env
```

**Verify:**
```bash
python3 -c "import yaml, pydantic, jsonschema, dotenv, PIL, requests, numpy, mcp; print('python deps OK')"
ls remotion-composer/node_modules >/dev/null && echo "remotion deps OK"
ls .env && echo ".env OK"
```

**Windows shortcut** — `start.bat` wraps the common runtime tasks once installed:

```powershell
start.bat demo       # run the free pipeline demo
start.bat server     # Express API on :4000
start.bat studio     # Remotion Studio on :3000
start.bat comfyui    # local ComfyUI on :8188
start.bat all        # everything at once
```

---

## Path D — The Container (zero local deps)

Nothing on your machine but Docker. Builds `node:22-alpine` + Chromium + FFmpeg
and boots the Node video API.

```bash
git clone https://github.com/rajkhemani/luxor9-video-pipeline.git
cd luxor9-video-pipeline

# Build from the repo root — the Dockerfile expects that context
docker build -f deploy/video-pipeline/Dockerfile -t luxor9-video .
docker run -p 4000:4000 --env-file .env luxor9-video
```

**Verify:**
```bash
curl localhost:4000/health
# {"status":"ok","services":{"hasHeyGen":false,"hasMuapi":false}}
```

Or with compose (adds volumes and nginx):

```bash
docker compose -f deploy/video-pipeline/docker-compose.yml up
```

> The container ships the **Node API**, not the Python agent pipeline. For agent-driven
> production use Path A/B/C on the host.

---

## Path E — The Cloud (one-command deploy)

```bash
./deploy/deploy-free.sh fly       # Fly.io — scale-to-zero
./deploy/deploy-free.sh railway   # Railway — $5 free credit/month
./deploy/deploy-free.sh render    # Render — free web service tier
./deploy/deploy-free.sh oracle    # Oracle Cloud — Always Free ARM VM (24 GB RAM)
./deploy/deploy-free.sh local     # local docker compose
```

Each target builds the same image and gives you a free subdomain. Full provider
comparison, RAM caveats, and custom-domain setup: [`deploy/README.md`](deploy/README.md).

> **2 GB RAM floor.** Remotion rendering needs it. 512 MB free tiers run orchestration
> fine but not in-container rendering — render locally against the cloud API
> (`export RENDER_API_URL=...`) or use Oracle's Always Free ARM VM.

---

## Path F — The Colab GPU (free T4)

Run ComfyUI on a free Colab T4 and point your local pipeline at it — free
GPU image/video generation with no local NVIDIA card.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/rajkhemani/luxor9-video-pipeline/blob/main/colab/LUXOR9_AI_Engine.ipynb)

1. Open [`colab/LUXOR9_AI_Engine.ipynb`](colab/LUXOR9_AI_Engine.ipynb) in Colab
2. Runtime → Change runtime type → **T4 GPU**
3. Run all cells — it installs ComfyUI and exposes it via Cloudflare Tunnel
4. Copy the printed tunnel URL into your local `.env`:

```bash
COMFYUI_HOST=<your-tunnel-host>
COMFYUI_PORT=443
```

**Verify:** `cd packages/video-orchestrator && npx tsx src/cli.ts comfyui-check`
→ `{"running":true}`

---

## Path G — The Codespace / Dev Container

The repo ships a [`.devcontainer`](.devcontainer/devcontainer.json) on the
universal image (Python + Node + Git preinstalled).

- **GitHub Codespaces:** green **Code** button → **Codespaces** → **Create codespace on main**
- **VS Code locally:** install *Dev Containers*, then **Reopen in Container**

Then, in the container terminal:

```bash
make setup && make demo
```

> The universal image does not include FFmpeg. Add it once:
> `sudo apt update && sudo apt install -y ffmpeg`

---

## End-to-End Install

Zero to a finished ad, then onto your own keys and your own agent, on one page. Every step ends
with a **check**; don't move on until it passes. About 15 minutes plus downloads. Prefer to have
your agent do it? Each step has a matching [copy-paste prompt](#path-h--the-agent-install-copy-paste-llm-prompts).

```
1 prerequisites → 2 install → 3 verify core → 4 keys → 5 connect agent → 6 verify agent
→ 7 first ad (free) → 8 first paid clip (optional) → 9 extra engines (optional)
```

### Step 1 — Prerequisites

Do [Stage 0](#stage-0--system-prerequisites) (Git, Python 3.10+, FFmpeg, Node 18+/22+). Then install
the agent you'll drive LUXOR9 with:

| Agent | Install | Start |
|---|---|---|
| **Claude Code** | `curl -fsSL https://claude.ai/install.sh \| bash` | `claude` |
| **OpenCode** | `curl -fsSL https://opencode.ai/install \| bash` or `npm install -g opencode-ai` | `opencode` |
| **Hermes Agent** | `curl -fsSL https://hermes-agent.nousresearch.com/install.sh \| bash` | `hermes chat` |
| **DeepSeek Harness** | nothing to install (runs through `npx`); developer preview | `npx @deepseek-ai/dsh web` → `http://127.0.0.1:3080` |
| Cursor / Copilot / Codex / Windsurf | your editor | runs the pipelines; Studio MCP server optional (Step 5) |

**Check:** the agent starts and answers a message.

### Step 2 — Install LUXOR9

```bash
git clone https://github.com/rajkhemani/luxor9-video-pipeline.git
cd luxor9-video-pipeline
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\Activate.ps1
make setup                         # no make? run Path C step by step
```

The virtualenv is **not optional** on this path. Debian 12+ and Ubuntu 23.04+ refuse system-wide
`pip install` (`externally-managed-environment`), `make setup` calls `python` and `pip`, which many
systems only provide under those names inside a venv, and the Studio MCP server needs the venv's
interpreter (Step 5).

**Check:**
```bash
python -c "import yaml, pydantic, jsonschema, dotenv, PIL, requests, numpy, mcp; print('python deps OK')"
ls .env && echo ".env OK"
```

### Step 3 — Verify the core (no keys, no cost)

```bash
make preflight        # capability menu (JSON)
make test-contracts   # contract tests
make demo             # zero-key MP4s → projects/demos/renders/
```

**Check:** contract tests pass, `make demo` writes MP4s, and preflight shows FFmpeg composition with
**no keyed provider** (fal, Google, ElevenLabs, OpenRouter, …) available yet. Paid providers showing
as available before you've added any key means your checkout predates the `.env` placeholder fix
(empty keys were read as their comment text): `git pull`.

### Step 4 — Add your keys

Keys live in two places, because two kinds of process read them:

| Key | Put it in | Read by | Unlocks |
|---|---|---|---|
| `OPENROUTER_API_KEY` | `.env` | video tool, `openrouter` model alias, Studio server | **Video** through every model OpenRouter lists; planning via the `openrouter` alias |
| `OPENROUTER_VIDEO_MODEL` (optional) | `.env` | video tool | default video model id (pick one in Step 8) |
| `NVIDIA_API_KEY` | `.env` | `nim` model alias | planning/scripting on NIM text models. **No video:** hosted NIM video is unconfirmed; Cosmos NIM is self-hosted on GPUs |
| `FAL_KEY` | `.env` | fal tools | FLUX/Recraft images; Veo, Kling, MiniMax, Seedance video |
| `MINIMAX_API_KEY` + `MINIMAX_API_HOST` | your **shell** (`export`), before starting the agent | `luxor9-minimax` plugin | "Motion". Host must match the key's platform: `https://api.minimax.io` or `https://api.minimaxi.com` |
| `NVIDIA_API_KEY` / `OPENROUTER_API_KEY` as the **agent's model** | your shell (OpenCode), `~/.hermes/.env` (Hermes), dsh Settings → Models | the harness itself | your keys as the agent's brain |

`.env` is gitignored and loaded automatically by every Python tool and by the Studio server. Plugins
and harnesses are separate processes started by your agent; they see only what is exported in the
shell that launched the agent. **Never paste a key into a chat** — it goes to the model provider. Edit
`.env` yourself.

**Check** (prints presence only, never values):
```bash
python -c "import tools.base_tool, os; [print(f'{k:24}', 'set' if os.environ.get(k) else '-') for k in ('OPENROUTER_API_KEY','OPENROUTER_VIDEO_MODEL','NVIDIA_API_KEY','FAL_KEY','MINIMAX_API_KEY','MINIMAX_API_HOST')]"
```

### Step 5 — Connect your agent

Start every agent **from the repo root with `.venv` active**. The Studio server is launched as
`python3 lib/mcp_server.py`; outside the venv, `python3` is your system Python without the `mcp`
package and the server fails to start.

**Claude Code** — zero config:
```bash
source .venv/bin/activate && claude
```
- Approve the `luxor9-studio` server from `.mcp.json` when asked; `/mcp` shows it connected.
- The Studio skills in `.claude/skills/` load automatically: `/studio`, `/ad`, `/ugc`, `/commercial`,
  `/image`, `/carousel`, `/banner`, `/design-system`, `/templates`, `/research`, `/schedule`.

**OpenCode** — `opencode.json` at the repo root registers the Studio server and two providers on your
keys, `nim` and `openrouter-byok`:
```bash
export NVIDIA_API_KEY=...          # and/or OPENROUTER_API_KEY=...
source .venv/bin/activate && opencode
```
Pick a `nim` or `openrouter-byok` model in OpenCode's model picker.

**Hermes Agent** — global config, so point it at your clone:
1. Merge [`harnesses/hermes.config.snippet.yaml`](harnesses/hermes.config.snippet.yaml) into
   `~/.hermes/config.yaml`. Set `cwd` to your clone and `command` to `<clone>/.venv/bin/python`
   (Hermes doesn't start inside your venv).
2. Keep the `model:` block for NIM, or switch to the commented OpenRouter one. Keys go in
   `~/.hermes/.env` (`chmod 600`), never in the YAML.
3. Run `hermes chat` **from the repo root** (Hermes loads `AGENTS.md` from its working directory), and
   `/reload-mcp` after any config edit.

**DeepSeek Harness (dsh)** — developer preview with breaking changes; config keys can differ by version:
1. `npx @deepseek-ai/dsh web`.
2. Add the Studio server through the `@deepseek-ai/dsh-mcp-client` plugin with
   [`harnesses/dsh.mcp.snippet.yml`](harnesses/dsh.mcp.snippet.yml): absolute path to
   `lib/mcp_server.py`, and `<clone>/.venv/bin/python` as `command`.
3. Add NIM/OpenRouter under Settings → Models, or with
   [`harnesses/dsh.providers.snippet.yaml`](harnesses/dsh.providers.snippet.yaml).
4. dsh drops credential-style env vars from MCP children, so `key_status` inside dsh can read `false`
   even when your keys work. Generation runs from the repo shell, where `.env` is loaded.

**Cursor / Copilot / Codex / Windsurf** read their own config files ([Agent Compatibility](#agent-compatibility))
and run the pipelines from the shell. To add the Studio server, register the stdio command
`<clone>/.venv/bin/python lib/mcp_server.py` in your editor's MCP settings.

### Step 6 — Verify the agent connection

Ask the agent to call `key_status` and `list_capabilities` (prompt [H7](#h7--health-check-any-time)).

**Check:** `key_status` returns `nvidia`, `openrouter`, `fal`, `minimax` as `true`/`false` matching
Step 4 (values are never returned); `list_capabilities` returns 13 labels, from `Ad creation` to
`Custom workflows`. Same check without an agent:
```bash
python -c "from lib.mcp_server import key_status, list_capabilities as c; print(key_status()); print([x['label'] for x in c()])"
```

### Step 7 — First ad (free route)

In Claude Code type `/ad` plus a one-line brief; in any other agent paste prompt [H8](#h8--first-ad-free-route).
The free route uses offline narration (Piper), free stock footage (Pexels/Pixabay need free keys) and
local composition. The agent stops for approval at script and storyboard, asks before any paid
upgrade, and runs the brand check before delivery.

**Check:** a final MP4 in `projects/<project-name>/renders/`.

### Step 8 — First paid clip on your OpenRouter key (optional, costs money)

List the video models your key can use:
```bash
python -c "from tools.video.openrouter_video import OpenRouterVideo as V; r=V().execute({'operation':'list_models'}); print(r.error or [m.get('id') for m in r.data['models']])"
```
Then one short test clip. Use a duration and resolution that model supports (the API rejects anything
else) and check its price on [openrouter.ai/models](https://openrouter.ai/models) first:
```bash
python -c "from tools.video.openrouter_video import OpenRouterVideo as V; r=V().execute({'model':'<id from the list>','prompt':'slow push-in on a matte black water bottle, studio light','duration':4,'resolution':'720p','aspect_ratio':'9:16','output_path':'projects/byok-test/clip.mp4'}); print(r.error or r.data)"
```

**Check:** `projects/byok-test/clip.mp4` plays; the charge shows on your OpenRouter dashboard.
Optionally set `OPENROUTER_VIDEO_MODEL` in `.env` to make that model the default.

### Step 9 — Extra engines (optional, Claude Code plugins)

```text
/plugin marketplace add rajkhemani/luxor9-video-pipeline
/plugin install luxor9-blender@luxor9      # "3D scene": uv + Blender with the BlenderMCP add-on running
/plugin install luxor9-comfyui@luxor9      # "Custom workflows": comfy-mcp + a running ComfyUI
/plugin install luxor9-minimax@luxor9      # "Motion" (paid): uv + MINIMAX_API_KEY/HOST exported
```
Install only what you'll use, then restart Claude Code. One-time setup for each is in its skill:
[3D scene](plugins/luxor9-blender/skills/scene-3d/SKILL.md) ·
[Custom workflows](plugins/luxor9-comfyui/skills/workflows/SKILL.md) ·
[Motion](plugins/luxor9-minimax/skills/motion/SKILL.md).

**Check:** `/mcp` lists `blender`, `comfy` or `minimax` as connected.

---

## Path H — The Agent Install (copy-paste LLM prompts)

Paste these into your AI assistant. Each one is self-contained and carries the same guardrails: show
the output of every step, stop at the first failure, ask before `sudo`/global installs, never print or
commit keys, never spend money without an explicit yes. Fill in the `<angle brackets>`.

#### H1 — Install and verify (start here, any agent with a shell)

```text
Install LUXOR9 (https://github.com/rajkhemani/luxor9-video-pipeline) on this machine and prove it works.
Rules: show me the output of every step; stop at the first failure and diagnose it before continuing;
ask before any sudo/admin command or global install; never print, log or commit API keys; spend no money.

1. Check prerequisites: git, python3 >= 3.10, ffmpeg, node >= 18 (>= 22 for HyperFrames). For anything
   missing, give me the install command for my OS from the README "Stage 0" section and wait for my OK.
2. git clone https://github.com/rajkhemani/luxor9-video-pipeline.git && cd luxor9-video-pipeline
3. python3 -m venv .venv, activate it, then run `make setup`. No make: follow README "Path C" exactly.
4. Verify: python -c "import yaml, pydantic, jsonschema, dotenv, PIL, requests, numpy, mcp" and ls .env
5. Run `make preflight`, `make test-contracts`, `make demo`.
6. Report a table (step | command | pass/fail) and list the MP4s in projects/demos/renders/.
7. Read AGENT_GUIDE.md and tell me in 5 bullets what I can produce with zero API keys.
```

#### H2 — Add keys without exposing them

```text
Help me add my API keys to LUXOR9 without exposing them. Do NOT ask me to paste keys into this chat
and never print key values.
1. Show which keys are set (presence only) with:
   python -c "import tools.base_tool, os; [print(k, bool(os.environ.get(k))) for k in ('OPENROUTER_API_KEY','OPENROUTER_VIDEO_MODEL','NVIDIA_API_KEY','FAL_KEY','MINIMAX_API_KEY','MINIMAX_API_HOST')]"
2. Tell me which lines of .env to fill for: video on OpenRouter, planning on NVIDIA NIM, images/video on
   fal. Wait while I edit .env myself.
3. Remind me that MINIMAX_API_KEY/MINIMAX_API_HOST must also be exported in the shell that starts my
   agent, and that harness model keys (OpenCode, Hermes, dsh) live in that harness's own environment.
4. Re-run step 1, then `make preflight`, and tell me which capabilities each new key unlocked.
```

#### H3 — Connect Claude Code

```text
Set up LUXOR9 Studio in this Claude Code session (repo root).
1. Check that the luxor9-studio MCP server from .mcp.json is connected. If it failed, check
   `python3 -c "import mcp"` and tell me to restart you from a shell with .venv activated.
2. Call key_status and list_capabilities; show a table of capability labels and their status.
   Labels only: no model, vendor or tool names.
3. List the short-name skills in .claude/skills/ that I can type (/studio, /ad, ...), one line each.
4. Ask which optional engines I want (3D scene, Custom workflows, Motion). For the ones I pick, give me
   the exact /plugin commands from the README "Step 9" and the setup steps from each plugin's SKILL.md.
   Install nothing I didn't pick.
```

#### H4 — Connect OpenCode

```text
Connect LUXOR9 to this OpenCode session (repo root).
1. Read opencode.json and confirm the luxor9-studio MCP server is running; if not, check
   `python3 -c "import mcp"` and tell me to restart OpenCode from a shell with .venv activated.
2. Tell me which provider I'm on (nim or openrouter-byok) and whether its key variable is set in your
   environment (yes/no only).
3. Call key_status and list_capabilities and show the capability labels.
4. Read AGENTS.md and AGENT_GUIDE.md, then tell me how to start my first ad.
```

#### H5 — Connect Hermes Agent

```text
Connect my LUXOR9 clone at <absolute path to luxor9-video-pipeline> to Hermes.
1. Back up ~/.hermes/config.yaml, then merge the mcp_servers.luxor9-studio block from
   <clone>/harnesses/hermes.config.snippet.yaml into it, with cwd = <clone> and
   command = <clone>/.venv/bin/python. Show me the diff before saving.
2. Ask whether my model should run on NVIDIA NIM or OpenRouter, and set the matching model block from
   the snippet. The key goes in ~/.hermes/.env (chmod 600), which I will edit myself.
3. Tell me to restart with `hermes chat` from <clone> (so AGENTS.md loads) or run /reload-mcp, then call
   key_status and list_capabilities to confirm.
```

#### H6 — Connect DeepSeek Harness (dsh)

```text
Connect my LUXOR9 clone at <absolute path to luxor9-video-pipeline> to DeepSeek Harness.
dsh is a developer preview: check the docs for my installed version before writing any config, and tell
me if a field in the repo snippets no longer matches.
1. Using <clone>/harnesses/dsh.mcp.snippet.yml, register the Studio server through the
   @deepseek-ai/dsh-mcp-client plugin, with command = <clone>/.venv/bin/python and the absolute path to
   lib/mcp_server.py. Show me the config before saving.
2. Help me add NVIDIA NIM and/or OpenRouter as model providers (Settings → Models, or
   <clone>/harnesses/dsh.providers.snippet.yaml). I will enter keys myself.
3. Restart dsh and call list_capabilities. If key_status reads false but my keys are in .env, explain
   that dsh strips credential env vars from MCP children and that generation from the repo shell still
   sees them.
```

#### H7 — Health check (any time)

```text
Run a LUXOR9 health check from the repo root and give me a pass/fail table. Don't fix anything until
I approve.
- python version and whether .venv is active
- `make preflight`: summarize configured capabilities and the ones one key away
- `make test-contracts`
- Studio MCP server: key_status (booleans only) and list_capabilities (labels only)
- `make hyperframes-doctor`
- `git ls-files .env` must print nothing (warn loudly if .env is tracked)
End with the top 3 fixes, ranked by impact.
```

#### H8 — First ad (free route)

```text
Make an Ad creation for <brand/product>: <one-sentence brief>. Audience: <who>.
Platforms: Instagram Reels and YouTube Shorts (plus LinkedIn if it fits).
Use the free route only. Show me the script and storyboard for approval before rendering. Run the brand
check before delivery. Speak in capability labels only: no model or vendor names. Tell me where the
final files are.
```
(In Claude Code you can start this with `/ad` or `/studio`.)

#### H9 — First paid clip on my OpenRouter key

```text
Generate one test video clip on my own OpenRouter key with tools/video/openrouter_video.py.
1. Run operation=list_models and show what the response includes for each model. Don't guess model ids,
   prices or supported durations that aren't in the response; point me to openrouter.ai/models for prices.
2. Propose one run: the shortest duration and lowest resolution that model supports, aspect ratio 9:16.
   State the expected cost and WAIT for my explicit "yes".
3. Run it with output_path projects/byok-test/clip.mp4, then report file size, duration (ffprobe) and
   the model used.
```

#### H10 — Troubleshoot an install

```text
LUXOR9 install problem. Symptom: <paste the exact error>.
Read the README "Troubleshooting" table and the relevant Makefile target first. Reproduce the failure
with the smallest command, explain the root cause, propose the fix, and wait for my OK before changing
anything outside .venv/ and .env.
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `npm install` fails with `ERR_INVALID_ARG_TYPE` (Windows) | run `npx --yes npm install` in the same directory |
| `piper-tts` install fails | safe to ignore — TTS falls back to cloud providers from `.env` |
| HyperFrames cache-warm fails / offline | first render fetches on demand; or run `make hyperframes-warm` later |
| `ffmpeg: command not found` after install (Windows) | re-open the terminal (PATH refresh), or add the FFmpeg `bin/` folder to PATH |
| Node < 22 and you need HyperFrames | upgrade Node (Stage 0 commands); Remotion + FFmpeg still work on Node 18 |
| Rendering dies on a 512 MB cloud instance | Remotion needs 2 GB+ RAM — render locally against the cloud API (`export RENDER_API_URL=...`) or use a bigger VM (see [Deployment](#deployment)) |
| `pip install` fails with `externally-managed-environment` | system Python is locked (PEP 668, Debian 12+/Ubuntu 23.04+). Create and activate `.venv` ([Step 2](#step-2--install-luxor9)) |
| `make: python: No such file or directory` | activate `.venv` (it provides `python`/`pip`), or install your distro's `python-is-python3` |
| Studio server shows failed in `/mcp` / `ModuleNotFoundError: No module named 'mcp'` | the agent was started outside the venv. Restart it from a shell with `.venv` active, or run `pip install -r requirements.txt` in the interpreter your config names |
| `make preflight` lists paid providers before you added any key | old loader read `.env.example` placeholders (`FAL_KEY=   # comment`) as key values. `git pull`; the fix treats them as empty |
| `key_status` says `false` inside DeepSeek Harness, but generation works | dsh strips credential env vars from MCP children; the repo-shell tools still load `.env` |
| Motion plugin: `invalid api key` | `MINIMAX_API_HOST` doesn't match the key's platform (`https://api.minimax.io` vs `https://api.minimaxi.com`) |
| A plugin or harness can't see a key that is in `.env` | plugins and harnesses read only their own environment: `export` the key in the shell that starts the agent (or the harness's secret store) |
| `npx tsc --noEmit` fails in `packages/` | **Known** — 15 pre-existing type errors in the restored Node runtime. It runs correctly via `tsx` (which strips types without checking). See [`docs/RECOVERY_STEP_1.md`](docs/RECOVERY_STEP_1.md) |
| `free-sales` renders video with **no audio** | **Known gap** — `packages/video-orchestrator/scripts/` (the Python TTS helper) has not been restored yet. Use the Python pipeline for narrated video |

## Did it work? — verification matrix

Run these after any path. Each row is independent.

| Check | Command | Expected |
|---|---|---|
| Python deps | `python3 -c "import yaml,pydantic,jsonschema,dotenv,PIL,requests,numpy,mcp;print('ok')"` | `ok` |
| Tool registry | `make preflight` | JSON capability menu; no keyed provider available until you add its key |
| Studio server | `python -c "from lib.mcp_server import key_status, list_capabilities as c; print(key_status()); print([x['label'] for x in c()])"` | key presence booleans + 13 labels, `Ad creation` … `Custom workflows` |
| Agent ↔ Studio | ask your agent to call `key_status` (prompt [H7](#h7--health-check-any-time)) | same booleans, from inside the agent |
| Contract tests | `make test-contracts` | all pass |
| Zero-key render | `make demo` | MP4s in `projects/demos/renders/` |
| Remotion composer deps | `ls remotion-composer/node_modules >/dev/null && echo ok` | `ok` |
| HyperFrames runtime | `make hyperframes-doctor` | `runtime_available: true` |
| Node API boots | `cd packages/video-orchestrator && npx tsx src/server.ts` | `🎬 LUXOR9 Video Pipeline Server running on port 4000` |
| Node compositions | `cd packages/video-engine && npx remotion compositions src/entry.ts` | 10 compositions listed |

---

## Node API (`packages/`)

A standalone HTTP + CLI surface for programmatic generation, separate from the
agent pipeline. [Restored in full](docs/RECOVERY_STEP_1.md) after the fork merge.

```bash
cd packages/video-orchestrator && npm ci
npx tsx src/server.ts            # API on :4000
```

**Endpoints**

| Method | Path | Needs keys |
|---|---|---|
| `GET` | `/health` | no |
| `GET` | `/videos/free-check` | no |
| `POST` | `/videos/free-sales` | no |
| `POST` | `/videos/sales` · `/videos/sales/deliver` · `/videos/demo` · `/videos/social-batch` · `/videos/custom` | HeyGen / Muapi |
| `POST` | `/muapi/lip-sync` · `/muapi/t2v` · `/muapi/t2i` — `GET /muapi/balance` | `MUAPI_API_KEY` |
| `POST` | `/heygen/generate` — `GET /heygen/templates` · `/heygen/avatars` | `HEYGEN_API_KEY` |

**CLI** — `npx tsx src/cli.ts <command>`

```
free-check   free-sales   free-tts   comfyui-check   comfyui-run      ← no keys
sales-video  product-demo social-batch custom-pipeline
heygen-generate  muapi-lip-sync  muapi-t2v  muapi-t2i  muapi-balance  ← keys
```

**Remotion Studio** for the 10 Node compositions:

```bash
cd packages/video-engine && npm ci && npx remotion studio src/entry.ts
```

> **Known gaps:** `free-sales` renders silent (missing `scripts/` TTS helper), and
> `npx tsc --noEmit` reports 15 pre-existing type errors. Both are documented with
> fixes in [`docs/RECOVERY_STEP_1.md`](docs/RECOVERY_STEP_1.md).

---

## Quick Start

Open the repo in your AI coding assistant and describe what you want:

```
"Make a 60-second animated explainer about how neural networks learn"
```

Or start from a reference video:

```
"Here's a YouTube Short I love. Make me something like this, but about quantum computing."
```

Or run the brand-ad pipeline:

```
"Run the social-creative pipeline: launch teaser for a premium smart water bottle,
obsidian-and-gold visual identity, variants for LinkedIn, Instagram, and YouTube Shorts."
```

The agent researches the topic with live web search, generates assets, writes and narrates the script, finds music, burns in word-level subtitles, renders the final video — and asks for your approval at every creative decision point. Outputs land in `projects/<project-name>/renders/final.mp4`.

---

## Pipelines

| Pipeline | What It Produces | Stability |
|----------|-----------------|-----------|
| **animated-explainer** | AI-generated explainer with research, narration, visuals, music | production |
| **animation** | Motion graphics and animation-first videos | production |
| **avatar-spokesperson** | Presenter-led avatar / lip-sync videos | production |
| **cinematic** | Trailer, teaser, and mood-led edits | production |
| **screen-demo** | Screen recordings and walkthroughs | production |
| **hybrid** | Source footage + AI-generated support visuals | production |
| **social-creative** | Short-form brand ad — 7 platform variants from one text brief | beta |
| **talking-head** | Footage-led speaker videos | beta |
| **clip-factory** | Many ranked clips from one long source | beta |
| **podcast-repurpose** | Podcast highlights and derivatives | beta |
| **character-animation** | Rigged SVG cartoon characters and reusable acting | beta |
| **localization-dub** | Subtitle, dub, and translated variants | beta |

Composition runs through three engines — **Remotion** (React scenes, spring animation, word-level captions), **HyperFrames** (HTML/CSS/GSAP kinetic typography and product promos), and **FFmpeg** (cuts, concat, subtitle burn). The runtime is chosen at proposal time and locked; silent swaps are a governance violation. See [`AGENT_GUIDE.md`](AGENT_GUIDE.md) for the full contract.

---

## Deployment

Deploy the video pipeline API to a free or near-free cloud with one command:

```bash
./deploy/deploy-free.sh fly       # Fly.io — scale-to-zero
./deploy/deploy-free.sh railway   # Railway — $5 free credit/month
./deploy/deploy-free.sh render    # Render — free web service tier
./deploy/deploy-free.sh oracle    # Oracle Cloud — Always Free ARM VM (24GB RAM)
./deploy/deploy-free.sh local     # Local docker compose
```

All cloud targets build the same image (`deploy/video-pipeline/Dockerfile`: node:22-alpine + Chromium + FFmpeg). Every provider gives you a free subdomain; point a Cloudflare CNAME at it for a custom domain.

> **Rendering caveat:** Remotion rendering needs 2GB+ RAM. 512MB free tiers run orchestration fine but not in-container rendering — either render locally against the cloud API (`export RENDER_API_URL=...`) or use Oracle's Always Free ARM VM. Full details, provider comparison, and domain setup: [`deploy/README.md`](deploy/README.md).

---

## Brand & Campaign

LUXOR9 ships with a complete brand system alongside the pipeline:

- **[Phase 1 Master Campaign Orchestration](apps/luxor9-final/docs/campaign/PHASE1_AGENT_FRAMEWORKS.md)** — the four-agent campaign framework: brand manifesto and go-to-market gates, "Obsidian & Gold" visual identity, Genesis Interface / Atelier UX specs, and the Three Acts launch architecture with KPI framework.
- **[Phase 2 Campaign Series — THE NINE](apps/luxor9-final/docs/campaign/PHASE2_CAMPAIGN_SERIES.md)** — the serialized nine-chapter campaign design with canonical SVG key visuals ([`assets/`](apps/luxor9-final/docs/campaign/assets/)) and a self-contained [design board](apps/luxor9-final/docs/campaign/index.html).
- **[Phase 3 — 30-Day Asset Engine](apps/luxor9-final/docs/campaign/PHASE3_30DAY_ASSET_ENGINE.md)** — five content tracks (UGC / CGI / awareness / brand story / founder journey), a ComfyUI-ready prompt book, the 30-day production calendar, and QA/integrity gates.
- **[Design System](apps/luxor9-final/docs/DESIGN_SYSTEM.md)** — component and token documentation for the frontend.
- **Design tokens** — `apps/luxor9-final/design-system/tokens.css` (Obsidian `#030303`, Champagne Gold `#C8A96A`, Pearl `#F5F0E8`).

Use these as the visual grammar for `social-creative` and `cinematic` productions when brand consistency matters.

---

## Agent Compatibility

LUXOR9 works with any AI coding assistant that can read files and execute Python:

| Platform | Config File |
|----------|------------|
| **Claude Code** | `CLAUDE.md` + `.mcp.json` + `.claude/skills/` (+ optional plugins via `.claude-plugin/marketplace.json`) |
| **OpenCode** | `AGENTS.md` + `opencode.json` |
| **Hermes Agent** | `AGENTS.md` + [`harnesses/hermes.config.snippet.yaml`](harnesses/hermes.config.snippet.yaml) → `~/.hermes/config.yaml` |
| **DeepSeek Harness** | `AGENTS.md` + [`harnesses/dsh.*`](harnesses/README.md) snippets (version-dependent) |
| **Cursor** | `CURSOR.md` + `.cursor/rules/` |
| **GitHub Copilot** | `COPILOT.md` + `.github/copilot-instructions.md` |
| **Codex** | `CODEX.md` |
| **Windsurf** | `.windsurfrules` |

Setup for each, with copy-paste prompts: [End-to-End Install → Step 5](#step-5--connect-your-agent).

All platform files point to the shared [`AGENT_GUIDE.md`](AGENT_GUIDE.md) (operating guide and agent contract) and [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) (architecture reference).

---

## Testing

```bash
make test-contracts   # contract tests — no API keys needed
make test             # full Python suite (pytest tests/ -v)
```

Node packages (matches CI):

```bash
cd packages/video-orchestrator && npm ci && npx tsc --noEmit
cd packages/video-engine       && npm ci && npx tsc --noEmit
```

> **Currently expected to fail** with 15 pre-existing type errors in the restored
> Node runtime — see [`docs/RECOVERY_STEP_1.md`](docs/RECOVERY_STEP_1.md). The Python
> suite is green.
>
> `make lint` byte-compiles the core tool modules (`base_tool`, `tool_registry`, `cost_tracker`,
> `analysis/composition_validator`) and passes.

---

## Credits & License

LUXOR9 is built on [OpenMontage](https://github.com/calesthio/OpenMontage) by calesthio — the agentic production engine, pipeline system, and tool registry originate there.

Licensed under the [GNU AGPLv3](LICENSE).

---

**LUXOR9** — production-grade video with real quality enforcement, orchestrated by your AI assistant.
