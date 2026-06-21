#!/usr/bin/env bash
# LUXOR9 Free Video Pipeline — Setup Script
# No paid APIs. No monthly fees. Runs entirely on your machine.

set -e

echo "========================================"
echo "  LUXOR9 Free Video Pipeline Setup"
echo "========================================"
echo ""

# ── Node.js + Remotion ──────────────────────────────
echo "📦 Step 1/4: Remotion (video engine)..."
cd "$(dirname "$0")/packages/video-engine"
npm install --silent 2>/dev/null
echo "  ✅ Remotion ready"

# ── Node.js Orchestrator ────────────────────────────
echo "📦 Step 2/4: Orchestrator..."
cd ../video-orchestrator
npm install --silent 2>/dev/null
echo "  ✅ Orchestrator ready"

# ── Python TTS ──────────────────────────────────────
echo "🐍 Step 3/4: Python TTS..."
PYTHON=""
for cmd in python3 python py; do
  if command -v $cmd &>/dev/null; then
    PYTHON=$cmd
    break
  fi
done

if [ -n "$PYTHON" ]; then
  $PYTHON -m pip install gtts --quiet 2>/dev/null && echo "  ✅ gTTS installed"
  $PYTHON -m pip install edge-tts --quiet 2>/dev/null && echo "  ✅ edge-tts installed" || echo "  ⚠️  edge-tts optional"
else
  echo "  ⚠️  Python not found. Install Python + run: pip install gtts"
fi

# ── ComfyUI (optional) ─────────────────────────────
echo "🎨 Step 4/4: ComfyUI (optional)..."
if [ ! -d "../ComfyUI" ]; then
  echo "  ℹ️  For AI image/video generation, install ComfyUI:"
  echo "     git clone https://github.com/comfyanonymous/ComfyUI"
  echo "     cd ComfyUI && pip install -r requirements.txt"
else
  echo "  ✅ ComfyUI found"
fi

# ── Done ────────────────────────────────────────────
echo ""
echo "========================================"
echo "  ✅ Setup Complete!"
echo "========================================"
echo ""
echo "  Quick start:"
echo "    npm run dev           # Remotion Studio at http://localhost:3000"
echo "    npm run demo          # Render a test video"
echo ""
echo "  Environment (optional):"
echo "    export HEYGEN_API_KEY=...   # For HeyGen (paid)"
echo "    export MUAPI_API_KEY=...    # For Muapi.ai (paid)"
echo ""
echo "  Free pipeline needs NO api keys."
echo "  gTTS works out of the box."
echo "========================================"
