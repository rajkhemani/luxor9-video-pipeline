#!/usr/bin/env python3
"""
LUXOR9 Model Downloader — downloads free open-source models for ComfyUI.
Usage:
  python download_models.py                    # Downloads all models
  python download_models.py --model flux       # Download only Flux
  python download_models.py --model all        # All models
  python download_models.py --list             # List available models
"""
import argparse
import json
import os
import sys
from pathlib import Path

COMFY_DIR = Path(__file__).parent.parent / "tools" / "ComfyUI"

MODELS = {
    "flux_fp8": {
        "repo": "Comfy-Org/flux_dev_fp8",
        "file": "flux_dev_fp8.safetensors",
        "dest": "models/checkpoints/",
        "size_gb": 8.5,
        "desc": "Flux.1 Dev FP8 — Best quality open image model",
    },
    "sdxl": {
        "repo": "stabilityai/stable-diffusion-xl-base-1.0",
        "file": "sd_xl_base_1.0.safetensors",
        "dest": "models/checkpoints/",
        "size_gb": 6.9,
        "desc": "SDXL 1.0 — Great quality, huge ecosystem",
    },
    "ltx_video": {
        "repo": "Lightricks/LTX-Video",
        "file": "ltx-video-2b-v0.9.1.safetensors",
        "dest": "models/checkpoints/",
        "size_gb": 2.1,
        "desc": "LTX Video — Fast text-to-video generation",
    },
    "wav2lip": {
        "repo": "animatingames/wav2lip_models",
        "file": "wav2lip_gan.pth",
        "dest": "models/checkpoints/",
        "size_gb": 0.4,
        "desc": "Wav2Lip GAN — Lip-sync any face to audio",
    },
    "live_portrait": {
        "repo": "liveportrait/liveportrait",
        "file": "liveportrait_base.pth",
        "dest": "models/checkpoints/",
        "size_gb": 0.8,
        "desc": "LivePortrait — Animate portrait photos",
    },
    "vae": {
        "repo": "stabilityai/sdxl-vae",
        "file": "sdxl_vae.safetensors",
        "dest": "models/vae/",
        "size_gb": 0.3,
        "desc": "SDXL VAE — Required for SDXL image decoding",
    },
}

def list_models():
    print(f"\n{'Model':<20} {'Size':<8}  Description")
    print("-" * 60)
    for key, m in MODELS.items():
        print(f"{key:<20} {m['size_gb']:<5.1f}GB  {m['desc']}")
    print(f"\nTotal: {sum(m['size_gb'] for m in MODELS.values()):.1f} GB")

def download_model(model_key: str):
    if model_key not in MODELS:
        print(f"❌ Unknown model: {model_key}. Use --list to see available models.")
        return False

    info = MODELS[model_key]
    dest_dir = COMFY_DIR / info["dest"]
    dest_path = dest_dir / info["file"]

    if dest_path.exists():
        size_mb = dest_path.stat().st_size / 1024 / 1024
        print(f"  ✅ {model_key} already exists ({size_mb:.0f} MB)")
        return True

    dest_dir.mkdir(parents=True, exist_ok=True)
    print(f"  📥 Downloading {model_key} ({info['size_gb']:.1f} GB)...")
    print(f"     From: huggingface.co/{info['repo']}")
    print(f"     To:   {dest_path}")

    try:
        from huggingface_hub import hf_hub_download
        hf_hub_download(
            repo_id=info["repo"],
            filename=info["file"],
            local_dir=dest_dir,
            local_dir_use_symlinks=False,
            resume_download=True,
        )
        print(f"  ✅ {model_key} downloaded successfully!")
        return True
    except ImportError:
        print("  ⚠️  huggingface_hub not installed. Run: pip install huggingface_hub")
        return False
    except Exception as e:
        print(f"  ❌ Download failed: {e}")
        print(f"     Try manual download: https://huggingface.co/{info['repo']}")
        return False


def main():
    parser = argparse.ArgumentParser(description="LUXOR9 ComfyUI Model Downloader")
    parser.add_argument("--model", default="all", help="Model key or 'all'")
    parser.add_argument("--list", action="store_true", help="List available models")
    parser.add_argument("--comfy-dir", default=str(COMFY_DIR), help="ComfyUI installation directory")
    args = parser.parse_args()

    comfy_dir = Path(args.comfy_dir)

    if args.list:
        list_models()
        return

    if not comfy_dir.exists():
        print(f"ComfyUI not found at {comfy_dir}")
        print("   Clone it first: git clone https://github.com/comfyanonymous/ComfyUI")
        sys.exit(1)

    if args.model == "all":
        total = sum(m['size_gb'] for m in MODELS.values())
        print(f"\nDownloading ALL models to {comfy_dir}")
        print(f"   Total size: {total:.1f} GB")
        print(f"   This will take a while on slow connections.\n")
        success = 0
        for key in MODELS:
            if download_model(key):
                success += 1
        print(f"\nDownloaded {success}/{len(MODELS)} models")
    else:
        download_model(args.model)

    print("\nNext: Start ComfyUI and load a workflow from workflows/comfyui/")


if __name__ == "__main__":
    main()
