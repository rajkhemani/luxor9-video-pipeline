<h1 align="center">LUXOR9</h1>

<p align="center"><strong>The LUXOR9 Video Pipeline — agentic video production, brand-grade output.</strong></p>

<p align="center">
  <a href="#what-is-luxor9">What Is LUXOR9</a> &nbsp;·&nbsp;
  <a href="#installation">Installation</a> &nbsp;·&nbsp;
  <a href="#quick-start">Quick Start</a> &nbsp;·&nbsp;
  <a href="#pipelines">Pipelines</a> &nbsp;·&nbsp;
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
├── packages/               # video-orchestrator API + video-engine (see stub note below)
├── apps/
│   ├── luxor9-final/       # Next.js 15 frontend + LUXOR9 design system
│   │   └── docs/campaign/  # Phase 1 master campaign orchestration
│   └── LUXOR9-Unified/     # FastAPI backend
├── deploy/                 # Fly.io / Railway / Render / Oracle / Hetzner configs
├── lib/                    # Checkpoints, config, pipeline loader
└── tests/                  # Contract tests, QA integration tests
```

> **Stub note:** `packages/*/src` currently contains clearly-labeled stubs — the original orchestrator/engine sources were not carried over in the fork merge. Docker builds succeed and the API boots (`/health` and `/videos/free-check` work; production endpoints return 501). The Python pipeline in the repo root is fully functional and is the primary way to produce videos.

---

## Installation

> **The exact pathway** — from a clean machine to a rendered video, in ordered stages.
> Stages 0–4 are required (≈10 minutes). Stages 5–8 are optional add-ons.
> Every stage ends with a **checkpoint**; do not continue until it passes.

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

`make setup` performs exactly these five steps (see `Makefile`) — run them manually if you have no `make` (typical on Windows):

| # | What it does | Manual equivalent |
|---|--------------|-------------------|
| 1 | Python core deps (`pyyaml`, `pydantic`, `jsonschema`, `python-dotenv`, `Pillow`, `requests`, `numpy`) | `pip install -r requirements.txt` |
| 2 | Remotion composer Node deps | `cd remotion-composer && npm install && cd ..` |
| 3 | Free offline TTS (Piper) — skipped gracefully if it fails | `pip install piper-tts` |
| 4 | HyperFrames CLI cache-warm (≈20 MB, avoids a 30–60 s cold fetch on first render) | `npx --yes hyperframes --version` |
| 5 | Create `.env` from the template (never overwrites an existing one) | `cp .env.example .env` |

**Windows note:** if step 2 fails with `ERR_INVALID_ARG_TYPE`, run `npx --yes npm install` inside `remotion-composer/` instead.

**✅ Checkpoint 2:**
```bash
ls .env                                    # exists
ls remotion-composer/node_modules > /dev/null && echo "remotion deps OK"
python3 -c "import yaml, pydantic, jsonschema, dotenv, PIL, requests, numpy; print('python deps OK')"
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

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| `npm install` fails with `ERR_INVALID_ARG_TYPE` (Windows) | run `npx --yes npm install` in the same directory |
| `piper-tts` install fails | safe to ignore — TTS falls back to cloud providers from `.env` |
| HyperFrames cache-warm fails / offline | first render fetches on demand; or run `make hyperframes-warm` later |
| `ffmpeg: command not found` after install (Windows) | re-open the terminal (PATH refresh), or add the FFmpeg `bin/` folder to PATH |
| Node < 22 and you need HyperFrames | upgrade Node (Stage 0 commands); Remotion + FFmpeg still work on Node 18 |
| Rendering dies on a 512 MB cloud instance | Remotion needs 2 GB+ RAM — render locally against the cloud API (`export RENDER_API_URL=...`) or use a bigger VM (see [Deployment](#deployment)) |

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
| **social-creative** | Short-form brand ad — 7 platform variants from one text brief | alpha |
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
| **Claude Code** | `CLAUDE.md` |
| **Cursor** | `CURSOR.md` + `.cursor/rules/` |
| **GitHub Copilot** | `COPILOT.md` + `.github/copilot-instructions.md` |
| **Codex** | `CODEX.md` |
| **Windsurf** | `.windsurfrules` |

All platform files point to the shared [`AGENT_GUIDE.md`](AGENT_GUIDE.md) (operating guide and agent contract) and [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) (architecture reference).

---

## Testing

```bash
make test-contracts   # contract tests, no API keys needed
make test             # full test suite
make lint             # linting
```

---

## Credits & License

LUXOR9 is built on [OpenMontage](https://github.com/calesthio/OpenMontage) by calesthio — the agentic production engine, pipeline system, and tool registry originate there.

Licensed under the [GNU AGPLv3](LICENSE).

---

**LUXOR9** — production-grade video with real quality enforcement, orchestrated by your AI assistant.
