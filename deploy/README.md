# Free Cloud Deployment — LUXOR9 Video Pipeline

Deploy the video pipeline API (`packages/video-orchestrator`, port 4000) to a
free or near-free cloud, with a free domain. One command:

```bash
./deploy/deploy-free.sh fly       # Fly.io — scale-to-zero
./deploy/deploy-free.sh railway   # Railway — $5 free credit/month
./deploy/deploy-free.sh render    # Render — free web service tier
./deploy/deploy-free.sh oracle    # Oracle Cloud — Always Free ARM VM
./deploy/deploy-free.sh local     # Local docker compose
```

All cloud targets build the same image: `deploy/video-pipeline/Dockerfile`
(node:22-alpine + Chromium + FFmpeg).

> **Prerequisite:** the Docker build copies `packages/video-engine/src` and
> `packages/video-orchestrator/src`. Both packages must have their source
> present in your checkout before any image builds.

## Provider comparison

| Provider | Config | Free allowance | Best for |
|----------|--------|----------------|----------|
| **Fly.io** | `deploy/fly/fly.toml` | Scale-to-zero machines — near-$0 when idle (Fly bills usage; new orgs have no flat free tier) | API that sleeps between requests |
| **Railway** | `railway.toml` (repo root) | $5 credit/month on the free plan | Easiest CLI deploy |
| **Render** | `render.yaml` (repo root) + `deploy/render/` | Free web service (512MB, sleeps after 15 min) + 1GB disk | GitHub-connected auto-deploy |
| **Oracle Cloud** | `deploy/oracle/setup.sh` | Always Free: 4 ARM OCPU, 24GB RAM, 200GB disk | Self-hosted, enough RAM to render in-cloud |
| **Hetzner** | `deploy/hetzner/` | Not free (~€4/mo) | Cheap always-on alternative |

### The rendering caveat

Remotion rendering (Chromium) needs **2GB+ RAM**. The 512MB free tiers
(Render free, Fly's smallest VM) comfortably run **orchestration + gTTS**, but
not in-container rendering. Two working patterns:

1. **Hybrid (recommended on free tiers):** host the API in the cloud, render
   locally against it — `export RENDER_API_URL=https://your-app...` and run
   the CLI from your machine. See `deploy/render/README.md`.
2. **Render in-cloud:** use Oracle's Always Free ARM VM (24GB RAM) or scale
   the Fly VM (`fly scale memory 2048`, leaves the free-ish range).

## Free domains

Every provider gives you a free subdomain automatically:

| Provider | Free domain |
|----------|-------------|
| Fly.io | `<app>.fly.dev` |
| Railway | `<app>.up.railway.app` |
| Render | `<app>.onrender.com` |

For a custom domain, add your domain (bought anywhere, ~$10/yr — or a free
`eu.org` / DuckDNS name for the Oracle VM) to **Cloudflare's free tier** and
point a CNAME at the provider URL:

```
CNAME  api  ->  luxor9-video-api.fly.dev     (proxy ON = free SSL + WAF)
```

For the Oracle/Hetzner VMs use an A record to the VM's IP; the bundled
nginx config (`deploy/video-pipeline/nginx.conf`) handles TLS termination.

## Environment variables

Copy `deploy/video-pipeline/.env.example` for the full list. Everything is
optional — the pipeline runs $0 with gTTS. Paid upgrades:

- `HEYGEN_API_KEY` — avatar videos
- `MUAPI_API_KEY` — Muapi.ai models
- `RESEND_API_KEY` / `TWILIO_*` — delivery

Set them via `fly secrets set KEY=...`, the Railway dashboard, or Render's
environment settings — never commit them.

## Verify a deployment

```bash
curl https://<your-app-url>/health
curl -X POST https://<your-app-url>/videos/free-check
```

## Directory map

```
deploy/
├── README.md            # this guide
├── deploy-free.sh       # one-command deploy dispatcher
├── fly/fly.toml         # Fly.io app config
├── render/              # Render blueprint + walkthrough
├── oracle/setup.sh      # Oracle Always Free VM bootstrap
├── hetzner/             # Hetzner VM compose + setup
└── video-pipeline/      # Dockerfile, compose, nginx, .env.example
railway.toml             # Railway config (repo root, auto-detected)
render.yaml              # Render blueprint (repo root, auto-detected)
```
