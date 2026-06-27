#!/usr/bin/env bash
# LUXOR9 Video Pipeline — Free Cloudflare Tunnel Setup
# Exposes your local WSL2 pipeline to the internet. $0 cost.

set -e

DOMAIN="${1:-luxor9-video.trycloudflare.com}"
echo "========================================="
echo "  LUXOR9 — Free Cloud via Cloudflare"
echo "========================================="
echo ""
echo "  This exposes your LOCAL pipeline to the"
echo "  internet using Cloudflare Tunnel (free)."
echo ""

# ── Check if cloudflared is installed ───────
if ! command -v cloudflared &>/dev/null; then
  echo "[1/3] Installing cloudflared..."
  curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
  chmod +x /tmp/cloudflared
  sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
else
  echo "[1/3] cloudflared already installed ✅"
fi

# ── Check if API server is running ──────────
echo "[2/3] Checking API server..."
if curl -sf http://localhost:4000/health > /dev/null 2>&1; then
  echo "  API server running on :4000 ✅"
else
  echo "  Starting API server..."
  cd /e/projects/LUXOR9/packages/video-orchestrator
  npx tsx src/server.ts > /tmp/luxor9-api.log 2>&1 &
  sleep 3
  echo "  API server started ✅"
fi

# ── Start Tunnel ────────────────────────────
echo "[3/3] Starting Cloudflare Tunnel..."
echo ""
echo "========================================="
echo "  YOUR PUBLIC URL (copy this):"
echo ""
echo "  https://luxor9-video.trycloudflare.com"
echo ""
echo "  Or use the URL shown below ↓"
echo "========================================="
echo ""

cloudflared tunnel --url http://localhost:4000
