# LUXOR9 Video Pipeline — Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## One-Click Deploy

1. Fork this repo to your GitHub
2. Click the Deploy to Render button above
3. Or create a new Web Service on Render:
   - Connect your GitHub repo
   - Set **Runtime** to `Node`
   - Set **Build Command**:
     ```
     cd packages/video-orchestrator && npm install && cd ../video-engine && npm install
     ```
   - Set **Start Command**:
     ```
     cd packages/video-orchestrator && npx tsx src/server.ts
     ```
   - Add a **Disk** mount at `/opt/render/project/src/output` (1GB)

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 4000 | Server port |
| `TTS_ENGINE` | No | gtts | gtts / edge / bark |
| `NODE_VERSION` | No | 22 | Node.js version |

**Optional (paid APIs):**
| `HEYGEN_API_KEY` | For HeyGen avatar videos |
| `MUAPI_API_KEY` | For Muapi.ai models |

## Local Rendering (Recommended)

The Render API handles orchestration. For actual video rendering (requires Chrome/GPU):

```bash
# On your local machine, connect to the Render API:
export RENDER_API_URL=https://your-app.onrender.com

# Render videos locally, upload to the API:
npx tsx packages/video-orchestrator/src/cli.ts free-sales '{...}'
```

## Pricing

| Service | Cost | Limits |
|---------|------|--------|
| Render Web Service | Free | 512MB RAM, sleeps after 15min |
| Render Disk | Free | 1GB included |
| gTTS | Free | No limits |
| ComfyUI (local) | Free | Your GPU |
| **Total** | **$0/mo** | — |

## Health Check

```bash
curl https://your-app.onrender.com/health
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service status |
| POST | `/videos/free-sales` | Create a free sales video |
| POST | `/videos/free-check` | Check available services |
| POST | `/muapi/*` | Muapi.ai proxy (requires key) |
| POST | `/heygen/*` | HeyGen proxy (requires key) |
