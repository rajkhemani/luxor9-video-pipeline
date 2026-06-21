#!/usr/bin/env bash
# LUXOR9 Video Pipeline — Complete Showcase
# This demo exercises every major capability.

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "╔══════════════════════════════════════════════════╗"
echo "║   LUXOR9 Video Pipeline — Complete Showcase     ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── 1. Check Services ──────────────────────────────────
echo "── Step 1: Service Check ──"
npx tsx "$ROOT/packages/video-orchestrator/src/cli.ts" free-check 2>&1

echo ""
echo "── Step 2: Generate Voiceover ──"
npx tsx "$ROOT/packages/video-orchestrator/src/cli.ts" free-tts '{"text":"Welcome to LUXOR9 Pro. The most advanced AI agent platform. Deploy your team in minutes.","outputPath":"'"$ROOT"'/output/showcase/voiceover.mp3"}'

echo ""
echo "── Step 3: Free Sales Video ──"
cd "$ROOT/packages/video-orchestrator"
npx tsx src/free-demo.ts 2>&1 | tail -10

echo ""
echo "── Step 4: Check API Server ──"
if curl -sf http://localhost:4000/health > /dev/null 2>&1; then
  echo "  API: Running ✅"
else
  echo "  API: Not running (start with: npm run server)"
fi

echo ""
echo "── Step 5: Check ComfyUI Models ──"
MODEL_DIR="$ROOT/tools/ComfyUI/models/checkpoints"
if ls "$MODEL_DIR"/*.safetensors "$MODEL_DIR"/*.pth 2>/dev/null; then
  echo "  Models: $(ls "$MODEL_DIR"/*.safetensors "$MODEL_DIR"/*.pth 2>/dev/null | wc -l) found ✅"
  echo "  Next: Start ComfyUI, then run workflows from workflows/comfyui/"
else
  echo "  Models: None yet (run: python scripts/download_models.py --model all)"
fi

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   SHOWCASE COMPLETE                              ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Outputs:                                       ║"
echo "║    $ROOT/output/showcase/           ║"
echo "║  API:     http://localhost:4000/health           ║"
echo "║  Studio:  http://localhost:3000                  ║"
echo "║  ComfyUI: http://localhost:8188                  ║"
echo "╚══════════════════════════════════════════════════╝"
