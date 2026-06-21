#!/usr/bin/env bash
# LUXOR9 Video Pipeline — Oracle Cloud Always Free Setup
# Run on a fresh Oracle Cloud Ubuntu 22.04 ARM instance
# (4 OCPU, 24GB RAM, 200GB disk — forever free)

set -e

echo "========================================="
echo "  LUXOR9 — Oracle Cloud Free Tier"
echo "========================================="

# ── System ──────────────────────────────────
echo "[1/5] Installing system packages..."
apt-get update -qq && apt-get install -y -qq \
  curl git docker.io docker-compose-v2 ffmpeg python3 python3-pip \
  nodejs npm nginx 2>&1 | tail -2

# ── Clone ───────────────────────────────────
echo "[2/5] Cloning video pipeline..."
cd /opt
git clone https://github.com/rajkhemani/luxor9-video-pipeline.git
cd luxor9-video-pipeline

# ── Node.js ─────────────────────────────────
echo "[3/5] Installing Node.js deps..."
cd packages/video-engine && npm install --silent && cd ../..
cd packages/video-orchestrator && npm install --silent && cd ../..

# ── Python TTS ──────────────────────────────
echo "[4/5] Installing TTS..."
pip3 install -q gtts edge-tts 2>/dev/null || true

# ── Services ────────────────────────────────
echo "[5/5] Starting services..."
docker compose -f deploy/hetzner/docker-compose.yml up -d

IP=$(curl -s ifconfig.me)
echo ""
echo "========================================="
echo "  ✅ Deployed to Oracle Cloud!"
echo "========================================="
echo "  URL:  http://$IP"
echo "  API:  http://$IP/health"
echo ""
echo "  To test:"
echo "    curl http://$IP/health"
echo "    curl -X POST http://$IP/videos/free-check"
echo ""
echo "  For ComfyUI (AI image gen):"
echo "    # Oracle ARM instances can run CPU models"
echo "    # Install ComfyUI for unlimited AI generation"
echo "========================================="
