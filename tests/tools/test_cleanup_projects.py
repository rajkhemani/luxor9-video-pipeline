"""Tests for scripts/cleanup_projects.py (projects/ TTL pruning)."""
from __future__ import annotations

import importlib.util
import os
import time
from pathlib import Path

import pytest

SPEC = importlib.util.spec_from_file_location(
    "cleanup_projects",
    Path(__file__).resolve().parents[2] / "scripts" / "cleanup_projects.py",
)
cleanup = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(cleanup)


def _make_project(root: Path, name: str, age_days: float, marker: bool = False) -> Path:
    proj = root / name
    proj.mkdir(parents=True)
    f = proj / "checkpoint_research.json"
    f.write_text("{}")
    if marker:
        (proj / ".keep").write_text("")
    old = time.time() - age_days * 86400
    # Age everything LAST: file creation above bumps the dir mtime.
    for entry in proj.rglob("*"):
        os.utime(entry, (old, old))
    os.utime(proj, (old, old))
    return proj


class TestDryRun:
    def test_default_is_dry_run(self, tmp_path, capsys):
        _make_project(tmp_path, "old-proj", age_days=60)
        assert cleanup.main(["--dir", str(tmp_path), "--days", "30"]) == 0
        assert (tmp_path / "old-proj").is_dir()  # still there
        assert "dry-run" in capsys.readouterr().out

    def test_apply_deletes_stale(self, tmp_path):
        old = _make_project(tmp_path, "old-proj", age_days=60)
        new = _make_project(tmp_path, "new-proj", age_days=1)
        assert cleanup.main(["--dir", str(tmp_path), "--days", "30", "--apply"]) == 0
        assert not old.exists()
        assert new.is_dir()

    def test_keep_marker_preserved(self, tmp_path):
        marked = _make_project(tmp_path, "keep-me", age_days=90, marker=True)
        # marker file mtime is old too, so it qualifies as stale-but-marked
        assert cleanup.main(["--dir", str(tmp_path), "--days", "30", "--apply"]) == 0
        assert marked.is_dir()

    def test_missing_root_is_clean_noop(self, tmp_path, capsys):
        assert cleanup.main(["--dir", str(tmp_path / "nope"), "--apply"]) == 0
