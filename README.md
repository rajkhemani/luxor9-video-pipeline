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

### 1. Prerequisites

| Requirement | Version | Install |
|-------------|---------|---------|
| **Python** | 3.10+ | [python.org](https://www.python.org/downloads/) |
| **FFmpeg** | any recent | `brew install ffmpeg` (macOS) / `sudo apt install ffmpeg` (Debian/Ubuntu) / [ffmpeg.org](https://ffmpeg.org/download.html) (Windows) |
| **Node.js** | 18+ (22+ for HyperFrames) | [nodejs.org](https://nodejs.org/) |
| **An AI coding assistant** | — | Claude Code, Cursor, Copilot, Windsurf, or Codex |

Verify before continuing:

```bash
python3 --version   # >= 3.10
ffmpeg -version
node --version      # >= 18
```

### 2. Clone and set up the pipeline

```bash
git clone https://github.com/rajkhemani/luxor9-video-pipeline.git
cd luxor9-video-pipeline
make setup
```

`make setup` installs the Python requirements, installs the Remotion composer's Node dependencies, installs Piper TTS (free offline narration), and creates your `.env` from the template.

<details>
<summary><strong>No <code>make</code>? Manual setup</strong></summary>

```bash
pip install -r requirements.txt
cd remotion-composer && npm install && cd ..
pip install piper-tts
cp .env.example .env
```

**Windows:** if `npm install` fails with `ERR_INVALID_ARG_TYPE`, use `npx --yes npm install` instead.

</details>

### 3. Add API keys (optional — more keys = more tools)

Every key is optional. With zero keys you still get Piper narration, free stock/archival footage, Remotion + HyperFrames + FFmpeg composition, and auto-generated subtitles.

```bash
# .env

# Image + video gateway:
FAL_KEY=your-key               # FLUX images + Google Veo, Kling, MiniMax video + Recraft images

# Free stock media (free developer keys):
PEXELS_API_KEY=your-key
PIXABAY_API_KEY=your-key
UNSPLASH_ACCESS_KEY=your-key

# Music:
SUNO_API_KEY=your-key          # Full songs, instrumentals, any genre

# Voice & images:
ELEVENLABS_API_KEY=your-key    # Premium TTS, AI music, sound effects
OPENAI_API_KEY=your-key        # OpenAI TTS, DALL-E 3 images
XAI_API_KEY=your-key           # Grok image edits/generation + Grok video
GOOGLE_API_KEY=your-key        # Google Imagen images, Google TTS (700+ voices)

# More video providers:
HEYGEN_API_KEY=your-key        # VEO, Sora, Runway, Kling via single gateway
RUNWAY_API_KEY=your-key        # Runway Gen-4 direct
```

### 4. Verify your capability envelope

```bash
make preflight
# or directly:
python -c "from tools.tool_registry import registry; import json; registry.discover(); print(json.dumps(registry.provider_menu_summary(), indent=2))"
```

This prints which capabilities (video generation, images, TTS, music, composition) are configured, and which are one env var away from working.

### 5. Optional: local GPU video generation (free)

```bash
make install-gpu

# Then add to .env:
VIDEO_GEN_LOCAL_ENABLED=true
VIDEO_GEN_LOCAL_MODEL=wan2.1-1.3b   # or wan2.1-14b, hunyuan-1.5, ltx2-local, cogvideo-5b
```

### 6. Optional: LUXOR9 frontend app

```bash
cd apps/luxor9-final
npm install
npm run dev        # Next.js dev server
npm run build      # production build
```

### 7. Optional: LUXOR9 backend

```bash
cd apps/LUXOR9-Unified/backend
pip install -r requirements.txt
python main.py
# or build the container:
docker build -t luxor9-backend .
```

### 8. Smoke test

```bash
make demo          # renders zero-key demo videos
make test-contracts # contract tests, no API keys needed
```

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
