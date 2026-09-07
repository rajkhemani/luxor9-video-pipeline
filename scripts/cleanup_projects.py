#!/usr/bin/env python3
"""Prune old project working directories under projects/.

The audit trail (MERGE_AUDIT_REPORT.md) flagged that projects/ grows without
bound: every pipeline run leaves checkpoints, assets, and intermediate media.
This script removes project directories that have been idle (no files
modified inside) for longer than a TTL.

Usage:
    python scripts/cleanup_projects.py                 # dry-run (default): report only
    python scripts/cleanup_projects.py --days 30 --apply
    python scripts/cleanup_projects.py --dir projects --days 7 --apply

It never touches:
  * the projects root itself — only immediate child directories
  * directories containing a ``keep`` / ``.keep`` marker file
  * anything that cannot be proven older than the TTL

Dry-run is the default; deletions require --apply. Exit code is 0 unless an
actual filesystem error occurs, so it's safe to run on cron.
"""

from __future__ import annotations

import argparse
import shutil
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

KEEP_MARKERS = ("keep", ".keep")


def newest_mtime(path: Path) -> float:
    """Newest mtime anywhere inside the directory tree (falls back to dir's own)."""
    latest = path.stat().st_mtime
    for entry in path.rglob("*"):
        try:
            latest = max(latest, entry.stat().st_mtime)
        except OSError:
            continue
    return latest


def dir_size_bytes(path: Path) -> int:
    total = 0
    for entry in path.rglob("*"):
        try:
            if entry.is_file():
                total += entry.stat().st_size
        except OSError:
            continue
    return total


def human_bytes(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.1f}{unit}" if unit != "B" else f"{n}B"
        n /= 1024
    return f"{n:.1f}GB"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dir", default="projects", help="projects root (default: ./projects)")
    parser.add_argument("--days", type=float, default=30.0, help="idle TTL in days (default: 30)")
    parser.add_argument("--apply", action="store_true", help="actually delete (default is dry-run)")
    args = parser.parse_args(argv)

    root = Path(args.dir).resolve()
    if not root.is_dir():
        print(f"[cleanup] {root} does not exist — nothing to do.")
        return 0

    now = time.time()
    cutoff = now - args.days * 86400
    stale: list[tuple[Path, float, int]] = []
    kept = skipped = 0

    for child in sorted(root.iterdir()):
        if not child.is_dir():
            continue
        try:
            mtime = newest_mtime(child)
        except OSError as e:
            print(f"[cleanup] WARN: cannot stat {child.name}: {e}")
            continue
        if mtime > cutoff:
            skipped += 1  # recent — untouched by definition
            continue
        if any((child / marker).exists() for marker in KEEP_MARKERS):
            print(f"[cleanup] keep marker present, preserving: {child.name}")
            kept += 1
            continue
        stale.append((child, mtime, dir_size_bytes(child)))

    if not stale:
        print(f"[cleanup] {skipped} active project(s), nothing older than {args.days:g} days idle.")
        return 0

    print(f"[cleanup] {len(stale)} stale project(s) past {args.days:g}-day TTL "
          f"({'APPLYING' if args.apply else 'dry-run — pass --apply to delete'}):")
    freed = 0
    for path, mtime, size in stale:
        age_days = (now - mtime) / 86400
        stamp = datetime.fromtimestamp(mtime, tz=timezone.utc).date().isoformat()
        print(f"  - {path.name}: idle {age_days:.0f}d (last write {stamp}), {human_bytes(size)}")
        if args.apply:
            try:
                shutil.rmtree(path)
                freed += size
            except OSError as e:
                print(f"[cleanup] ERROR deleting {path}: {e}", file=sys.stderr)
                return 1

    if args.apply:
        print(f"[cleanup] done — removed {len(stale)} project(s), freed {human_bytes(freed)}.")
    else:
        print(f"[cleanup] dry-run complete — {human_bytes(sum(s for _, _, s in stale))} reclaimable.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
