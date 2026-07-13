#!/usr/bin/env bash
# One-command deploy of the LUXOR9 video pipeline API to a free/hobby cloud.
#
#   ./deploy/deploy-free.sh fly       # Fly.io (scale-to-zero)
#   ./deploy/deploy-free.sh railway   # Railway ($5 free credit/month)
#   ./deploy/deploy-free.sh render    # Render (free web service tier)
#   ./deploy/deploy-free.sh oracle    # Oracle Cloud Always Free VM
#   ./deploy/deploy-free.sh local     # Local docker compose
#
# See deploy/README.md for provider comparison and free-domain setup.
set -euo pipefail

cd "$(dirname "$0")/.."  # always run from repo root
PROVIDER="${1:-fly}"

case "$PROVIDER" in
  fly)
    command -v flyctl >/dev/null 2>&1 || command -v fly >/dev/null 2>&1 || {
      echo "flyctl not found. Install: curl -L https://fly.io/install.sh | sh"; exit 1; }
    FLY="$(command -v flyctl || command -v fly)"
    echo "==> Deploying to Fly.io..."
    if ! "$FLY" status --config deploy/fly/fly.toml >/dev/null 2>&1; then
      "$FLY" launch --copy-config --config deploy/fly/fly.toml --no-deploy --yes
      "$FLY" volumes create video_output --size 1 --yes --config deploy/fly/fly.toml || true
    fi
    "$FLY" deploy --config deploy/fly/fly.toml
    echo "==> Done. Check: $FLY status --config deploy/fly/fly.toml"
    ;;

  railway)
    command -v railway >/dev/null 2>&1 || {
      echo "railway CLI not found. Install: npm i -g @railway/cli"; exit 1; }
    echo "==> Deploying to Railway (uses railway.toml at repo root)..."
    railway up
    echo "==> Done. Get your URL from the Railway dashboard or: railway domain"
    ;;

  render)
    echo "==> Render deploys from GitHub, not from the CLI."
    echo "    1. Push this repo to GitHub"
    echo "    2. Create a Blueprint on https://dashboard.render.com from render.yaml"
    echo "    See deploy/render/README.md for the full walkthrough."
    ;;

  oracle)
    : "${ORACLE_HOST:?Set ORACLE_HOST=ubuntu@<vm-ip> to your Oracle Cloud instance}"
    echo "==> Running setup on $ORACLE_HOST..."
    ssh "$ORACLE_HOST" 'bash -s' < deploy/oracle/setup.sh
    ;;

  local)
    echo "==> Deploying locally with docker compose..."
    make -f deploy/video-pipeline/Makefile deploy
    ;;

  *)
    echo "Unknown provider: $PROVIDER (expected fly|railway|render|oracle|local)"
    exit 1
    ;;
esac

echo ""
echo "Free domain options (see deploy/README.md):"
echo "  - Provider subdomain: *.fly.dev / *.up.railway.app / *.onrender.com (automatic)"
echo "  - Custom domain via Cloudflare free tier: CNAME api -> <your-app-url>"
