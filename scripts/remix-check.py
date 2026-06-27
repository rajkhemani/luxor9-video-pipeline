"""Combined runtime validation for Remotion + HyperFrames stacks."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
COMPOSER_DIR = ROOT / "remotion-composer"


def _check(label: str, ok: bool, detail: str = "") -> None:
    icon = "OK" if ok else "FAIL"
    print(f"  [{icon}] {label}" + (f"  ({detail})" if detail else ""))


def check_python() -> bool:
    try:
        import jsonschema, pydantic, yaml
        return True
    except ImportError as e:
        print(f"  [FAIL] Missing dependency: {e}")
        return False


def check_remotion() -> dict:
    result = {"available": False, "reason": ""}
    if not shutil.which("npx"):
        result["reason"] = "npx not on PATH"
        return result
    if not COMPOSER_DIR.exists():
        result["reason"] = "remotion-composer/ missing"
        return result
    if not (COMPOSER_DIR / "package.json").exists():
        result["reason"] = "package.json missing in remotion-composer/"
        return result
    if not (COMPOSER_DIR / "node_modules").exists():
        result["reason"] = "node_modules not installed (run: cd remotion-composer && npm install)"
        return result
    result["available"] = True
    return result


def check_hyperframes() -> dict:
    result = {"available": False, "reason": ""}
    if not shutil.which("node"):
        result["reason"] = "node not on PATH"
        return result
    try:
        ver = subprocess.check_output(["node", "--version"], text=True).strip()
        major = int(ver.lstrip("v").split(".")[0])
        if major < 22:
            result["reason"] = f"node {ver} (< 22 required)"
            return result
    except Exception as e:
        result["reason"] = f"node check failed: {e}"
        return result
    if not shutil.which("npx"):
        result["reason"] = "npx not on PATH"
        return result
    if not shutil.which("ffmpeg"):
        result["reason"] = "ffmpeg not on PATH"
        return result
    try:
        subprocess.run(
            ["npx", "--yes", "hyperframes", "--version"],
            capture_output=True, text=True, timeout=30
        )
        result["available"] = True
    except subprocess.TimeoutExpired:
        result["reason"] = "npx hyperframes timed out (30s)"
    except Exception as e:
        result["reason"] = f"npx hyperframes failed: {e}"
    return result


def main() -> int:
    print("OpenMontage Remix — Runtime Validation")
    print()

    print("  Python:")
    py_ok = check_python()
    _check("core deps (yaml, pydantic, jsonschema)", py_ok)

    print()
    print("  Remotion:")
    rem = check_remotion()
    _check("npx available", bool(shutil.which("npx")))
    _check("composer project", COMPOSER_DIR.exists())
    _check("node_modules installed", rem["available"], rem["reason"])

    print()
    print("  HyperFrames:")
    hf = check_hyperframes()
    _check("node >= 22", bool(shutil.which("node")))
    if shutil.which("node"):
        try:
            ver = subprocess.check_output(["node", "--version"], text=True).strip()
            major = int(ver.lstrip("v").split(".")[0])
            _check(f"node version ({ver})", major >= 22)
        except Exception:
            pass
    _check("ffmpeg on PATH", bool(shutil.which("ffmpeg")))
    _check("npx package resolvable", hf["available"], hf["reason"])

    print()
    all_ok = py_ok and rem["available"]
    if all_ok:
        print("  Result: Both runtimes ready.")
    elif rem["available"]:
        print("  Result: Remotion OK. HyperFrames unavailable — will use Remotion for composition.")
    else:
        reason = rem.get("reason") or hf.get("reason") or "check output above"
        print(f"  Result: {reason}")

    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
