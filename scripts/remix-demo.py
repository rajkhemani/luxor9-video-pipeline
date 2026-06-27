"""Remix demo — validates both runtimes and renders a combined output."""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
COMPOSER_DIR = ROOT / "remotion-composer"
PROPS_DIR = COMPOSER_DIR / "public" / "demo-props"
OUTPUT_DIR = ROOT / "projects" / "remix-demo" / "renders"
STITCH_OUT = OUTPUT_DIR / "remix-demo.mp4"


def find_command(*names: str) -> str | None:
    for name in names:
        resolved = shutil.which(name)
        if resolved:
            return resolved
    return None


def render_remotion(npx_cmd: str, output_dir: Path) -> Path | None:
    demos = sorted(PROPS_DIR.glob("*.json"))
    if not demos:
        print("  No demo props found in remotion-composer/public/demo-props/")
        return None
    props_path = demos[0]
    name = props_path.stem
    out_path = output_dir / f"remotion-{name}.mp4"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"  Demo: {name}")
    print(f"  Props: {props_path.name}")
    try:
        subprocess.run(
            [npx_cmd, "remotion", "render", "src/index.tsx", "Explainer",
             str(out_path), "--props", str(props_path), "--codec", "h264"],
            cwd=COMPOSER_DIR, check=True, capture_output=True, text=True, timeout=120,
        )
        if out_path.exists():
            size_mb = out_path.stat().st_size / (1024 * 1024)
            print(f"  OK ({size_mb:.1f} MB)")
            return out_path
    except subprocess.TimeoutExpired:
        print("  TIMEOUT (120s)")
    except subprocess.CalledProcessError as e:
        print(f"  FAILED: {e.stderr[-300:]}")
    return None


def doctor_hyperframes() -> tuple[bool, str]:
    """Run npx hyperframes doctor and return (ok, summary)."""
    from tools.video.hyperframes_compose import HyperFramesCompose
    result = HyperFramesCompose().execute({"operation": "doctor"})
    if result.success and result.data:
        return True, "ready"
    return False, result.error or "unavailable"


def scaffold_hyperframes_workspace(output_dir: Path) -> Path | None:
    """Scaffold a minimal HyperFrames composition and render it via the CLI."""
    hf_dir = output_dir / "hyperframes-workspace"
    hf_dir.mkdir(parents=True, exist_ok=True)

    index_html = hf_dir / "index.html"
    index_html.write_text(
        '<!DOCTYPE html><html><head><title>Remix</title>'
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">'
        '<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>'
        '</head><body>'
        '<div data-composition-id="remix-hero" data-width="1920" data-height="1080">'
        '<div class="scene" style="display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;height:100%;background:linear-gradient(135deg,#0f172a,#1e293b);font-family:Inter,sans-serif;gap:24px;">'
        '<h1 style="font-size:72px;color:#60a5fa;margin:0;">OpenMontage</h1>'
        '<p style="font-size:36px;color:#94a3b8;margin:0;">Remotion + HyperFrames</p>'
        '<p style="font-size:24px;color:#64748b;margin:0;">Two runtimes, one pipeline</p>'
        '</div>'
        '<script>window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});tl.from("h1",{y:-40,opacity:0,duration:.8,ease:"power3.out"},.2);tl.from("p",{y:30,opacity:0,duration:.6,ease:"power2.out"},.5);window.__timelines["remix-hero"]=tl;</script>'
        '</div></body></html>'
    )

    out_path = output_dir / "hyperframes-demo.mp4"
    try:
        subprocess.run(
            ["npx", "--yes", "hyperframes", "render", str(hf_dir), str(out_path)],
            check=True, capture_output=True, text=True, timeout=120,
        )
        if out_path.exists():
            return out_path
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
        pass
    return None


def stitch(video_a: Path, video_b: Path, output: Path) -> bool:
    ffmpeg = find_command("ffmpeg")
    if not ffmpeg:
        return False
    with tempfile.TemporaryDirectory() as td:
        concat_file = Path(td) / "concat.txt"
        with open(concat_file, "w") as f:
            for v in [video_a, video_b]:
                if v and v.exists():
                    f.write(f"file '{v.resolve()}'\n")
        result = subprocess.run(
            [ffmpeg, "-y", "-f", "concat", "-safe", "0",
             "-i", str(concat_file), "-c", "copy", str(output)],
            capture_output=True, text=True, timeout=120,
        )
        return result.returncode == 0


def main() -> int:
    print("OpenMontage Remix Demo")
    print("======================")
    print()

    has_npx = bool(find_command("npx"))
    has_remotion = has_npx and (COMPOSER_DIR / "node_modules").exists()
    has_hyperframes = has_npx and bool(find_command("ffmpeg"))
    if has_hyperframes:
        try:
            ver = subprocess.check_output(["node", "--version"], text=True).strip()
            has_hyperframes = int(ver.lstrip("v").split(".")[0]) >= 22
        except Exception:
            has_hyperframes = False

    if not has_remotion and not has_hyperframes:
        print("No runtimes available. Run 'make remix-setup' first.")
        return 1

    rendered = []

    if has_remotion:
        print("[1/2] Remotion:")
        npx_cmd = find_command("npx")
        path = render_remotion(npx_cmd, OUTPUT_DIR) if npx_cmd else None
        if path:
            rendered.append(path)
    else:
        print("[1/2] Remotion: unavailable (run: cd remotion-composer && npm install)")

    if has_hyperframes:
        print()
        print("[2/2] HyperFrames:")
        path = scaffold_hyperframes_workspace(OUTPUT_DIR)
        if path:
            rendered.append(path)
            size_mb = path.stat().st_size / (1024 * 1024)
            print(f"  OK ({size_mb:.1f} MB)")
        else:
            ok, summary = doctor_hyperframes()
            print(f"  {'OK' if ok else 'FAIL'}: {summary}")
    else:
        print()
        print("[2/2] HyperFrames: unavailable (node >= 22 + ffmpeg required)")

    print()
    if len(rendered) >= 2:
        print("Stitching combined demo...")
        if stitch(rendered[0], rendered[1], STITCH_OUT):
            print(f"Combined: {STITCH_OUT}")
        else:
            print(f"  Individual outputs: {rendered[0]}, {rendered[1]}")
    elif len(rendered) == 1:
        print(f"Output: {rendered[0]}")
    else:
        print("Nothing rendered.")
        return 1

    print()
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
