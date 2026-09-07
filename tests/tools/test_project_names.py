"""Tests for project-name validation (lib/project_names.py).

Covers the traversal guards flagged in the merge audit: user-controlled
project ids become on-disk directories, so separators, ``..``, and leading
dots must be rejected at the write boundary (lib/checkpoint.write_checkpoint).
"""
from __future__ import annotations

import pytest

from lib.project_names import (
    MAX_PROJECT_NAME_LENGTH,
    ProjectNameError,
    validate_project_name,
)


class TestValidNames:
    @pytest.mark.parametrize("name", [
        "proj",                    # used throughout the existing test suite
        "demo_video_1",            # underscore style used by demos
        "my-product-launch",       # kebab-case (README convention)
        "Campaign2026",
        "v1.0-rewrite",
        "a",                       # single char is fine
        "0-anchor",                # may start with a digit
        "x" * MAX_PROJECT_NAME_LENGTH,
    ])
    def test_accepted(self, name):
        assert validate_project_name(name) == name


class TestTraversalRejected:
    @pytest.mark.parametrize("name", [
        "../outside",
        "..",
        "foo/../bar",
        "subdir/nested",           # forward slash
        "win\\backslash",
        "/absolute/path",
        "C:\\windows\\path",
        ".hidden",
        "-option-like",            # would confuse CLI tools
        "double..dot",
        "",
        "with space",
        "with:colon",
        "with*glob",
        "with\nnewline",
        "x" * (MAX_PROJECT_NAME_LENGTH + 1),
    ])
    def test_rejected(self, name):
        with pytest.raises(ProjectNameError):
            validate_project_name(name)

    def test_error_is_value_error(self):
        # ProjectNameError subclasses ValueError so existing
        # `except ValueError` call sites keep working.
        with pytest.raises(ValueError):
            validate_project_name("../etc")


class TestCheckpointIntegration:
    """write_checkpoint() must refuse unsafe project_ids before any disk IO."""

    def test_traversal_id_rejected(self, tmp_path):
        from lib.checkpoint import write_checkpoint

        with pytest.raises(ValueError):
            write_checkpoint(
                tmp_path, "../escape", "research", "completed", {}
            )
        # and nothing was written outside tmp_path
        assert not (tmp_path.parent / "escape").exists()

    def test_safe_id_still_writes(self, tmp_path):
        from lib.checkpoint import read_checkpoint, write_checkpoint

        # "in_progress" skips canonical-artifact requirements so this test
        # stays focused on the name-validation contract.
        write_checkpoint(tmp_path, "safe-proj", "research", "in_progress", {})
        cp = read_checkpoint(tmp_path, "safe-proj", "research")
        assert cp is not None
        assert cp["project_id"] == "safe-proj"
        # written strictly inside the given pipeline dir
        assert (tmp_path / "safe-proj" / "checkpoint_research.json").is_file()
