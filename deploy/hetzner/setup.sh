#!/usr/bin/env bash
# LUXOR9 Video Pipeline — Hetzner Cloud Setup
# Run on a fresh Hetzner Ubuntu 22.04 VPS
# Usage: curl -fsSL https://raw.githubusercontent.com/rajkhemani/luxor9-video-pipeline/main/deploy/hetzner/setup.sh | bash

set -e

echo "========================================="
echo "  LUXOR9 — Hetzner Cloud Deployment"
echo "========================================="

# ── System Packages ─────────────────────────
echo "[1/6] Installing system packages..."
apt-get update -qq
apt-get install -y -qq curl git docker.io docker-compose-v2 ffmpeg python3 python3-pip nodejs npm 2>&1 | tail -3

# ── Clone Repo ──────────────────────────────
echo "[2/6] Cloning video pipeline..."
cd /opt
git clone https://github.com/rajkhemani/luxor9-video-pipeline.git luxor9-video
cd luxor9-video

# ── Node.js Dependencies ────────────────────
echo "[3/6] Installing Node.js dependencies..."
cd packages/video-engine && npm install --silent && cd ../..
cd packages/video-orchestrator && npm install --silent && cd ../..

# ── Python TTS ──────────────────────────────
echo "[4/6] Installing Python TTS..."
pip3 install -q gtts edge-tts 2>/dev/null || true

# ── Environment ─────────────────────────────
echo "[5/6] Configuring environment..."
mkdir -p /opt/luxor9-video/output/{videos,audio,images}

cat > /etc/systemd/system/luxor9-video-api.service << 'EOF'
[Unit]
Description=LUXOR9 Video Pipeline API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/luxor9-video/packages/video-orchestrator
ExecStart=/usr/bin/npx tsx src/server.ts
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=4000
Environment=REMOTION_PROJECT_DIR=/opt/luxor9-video/packages/video-engine
Environment=REMOTION_OUTPUT_DIR=/opt/luxor9-video/output/videos
Environment=AUDIO_OUTPUT_DIR=/opt/luxor9-video/output/audio
Environment=TTS_ENGINE=gtts

[Install]
WantedBy=multi-user.target
EOF

# ── Start ───────────────────────────────────
echo "[6/6] Starting service..."
systemctl daemon-reload
systemctl enable luxor9-video-api
systemctl start luxor9-video-api

# ── Nginx Reverse Proxy ─────────────────────
if command -v nginx &>/dev/null; then
  cat > /etc/nginx/sites-available/luxor9 << 'NGINX'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        client_max_body_size 500M;
    }

    location /videos/ {
        alias /opt/luxor9-video/output/videos/;
        add_header Cache-Control "public, max-age=3600";
    }
}
NGINX
  ln -sf /etc/nginx/sites-available/luxor9 /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
fi

# ── Done ────────────────────────────────────
IP=$(curl -s ifconfig.me)
echo ""
echo "========================================="
echo "  ✅ LUXOR9 Deployed to Hetzner!"
echo "========================================="
echo ""
echo "  URL:      http://$IP"
echo "  API:      http://$IP/health"
echo "  Docs:     https://github.com/rajkhemani/luxor9-video-pipeline"
echo ""
echo "  Commands:"
echo "    systemctl status luxor9-video-api"
echo "    journalctl -u luxor9-video-api -f"
echo ""
echo "  Optional (for AI image gen):"
echo "    # Install ComfyUI + CUDA drivers for GPU"
echo "    # See: https://github.com/comfyanonymous/ComfyUI"
echo "========================================="
