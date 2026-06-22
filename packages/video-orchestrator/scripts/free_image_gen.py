#!/usr/bin/env python3
"""
LUXOR9 Free Image Generator — uses HuggingFace free inference API.
No GPU needed. No API key required (rate-limited).
"""
import json
import sys
import urllib.request
import urllib.error
import base64
import argparse
from pathlib import Path

# Models that work via free inference API (no auth needed)
FREE_MODELS = {
    "flux": {
        "url": "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
        "desc": "Flux.1 Dev (best quality)",
    },
    "sdxl": {
        "url": "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        "desc": "SDXL 1.0 (great quality)",
    },
    "sdxl-turbo": {
        "url": "https://api-inference.huggingface.co/models/stabilityai/sdxl-turbo",
        "desc": "SDXL Turbo (fast, decent)",
    },
    "ssd-1b": {
        "url": "https://api-inference.huggingface.co/models/segmind/SSD-1B",
        "desc": "SSD-1B (lightweight, fast)",
    },
}


def generate_image(prompt: str, model: str = "sdxl-turbo", output: str = "output.png", api_token: str = ""):
    if model not in FREE_MODELS:
        print(json.dumps({"success": False, "error": f"Unknown model: {model}. Options: {list(FREE_MODELS.keys())}"}))
        return False

    info = FREE_MODELS[model]
    headers = {"Content-Type": "application/json"}
    if api_token:
        headers["Authorization"] = f"Bearer {api_token}"

    payload = {"inputs": prompt}
    
    print(f"  [AI] Generating image with {model}...", file=sys.stderr)
    print(f"     Prompt: {prompt[:80]}{'...' if len(prompt) > 80 else ''}", file=sys.stderr)

    req = urllib.request.Request(
        info["url"],
        data=json.dumps(payload).encode(),
        headers=headers,
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            content_type = response.headers.get("Content-Type", "")
            
            if "application/json" in content_type:
                data = json.loads(response.read())
                if isinstance(data, dict) and "error" in data:
                    print(json.dumps({"success": False, "error": data["error"]}))
                    if "loading" in str(data.get("error", "")):
                        print("  [wait] Model is loading on HuggingFace servers. Retry in 30s.", file=sys.stderr)
                    return False
                print(json.dumps(data))
                return False

            output_path = Path(output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(response.read())
            
            size = output_path.stat().st_size / 1024
            result = {"success": True, "output": str(output_path), "model": model, "size_kb": round(size, 1)}
            print(json.dumps(result))
            print(f"  [OK] Image saved: {output_path} ({size:.0f} KB)", file=sys.stderr)
            return True

    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        result = {"success": False, "error": f"HTTP {e.code}: {error_body[:200]}"}
        print(json.dumps(result))
        return False
    except urllib.error.URLError as e:
        result = {"success": False, "error": f"Network error: {e.reason}"}
        print(json.dumps(result))
        return False


def main():
    parser = argparse.ArgumentParser(description="LUXOR9 Free Image Generator (HuggingFace)")
    parser.add_argument("--prompt", required=True, help="Text prompt for image generation")
    parser.add_argument("--model", default="sdxl-turbo", choices=list(FREE_MODELS.keys()), help="Model to use")
    parser.add_argument("--output", default="output.png", help="Output file path")
    parser.add_argument("--token", default="", help="HuggingFace API token (optional, for higher rate limits)")
    args = parser.parse_args()

    generate_image(args.prompt, args.model, args.output, args.token)


if __name__ == "__main__":
    main()
