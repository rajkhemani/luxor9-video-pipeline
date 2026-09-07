"""Project-name / project-id validation.

Project names are user-controlled and end up on disk
(``projects/<name>/``, checkpoint JSON, decision logs). Without validation,
names containing ``..``, path separators, or absolute paths could escape the
projects directory (path traversal) and overwrite arbitrary files.

Policy (deliberately permissive but safe):
  * 1–128 characters
  * letters, digits, ``-``, ``_``, ``.`` only
  * must not start with ``.`` or ``-`` (hidden files / option-like names)
  * no path separators, no ``..`` traversal segments, no absolute paths

New code should prefer kebab-case names (README convention); this validator
blocks the dangerous cases while remaining backwards-compatible with existing
project ids used across tests and demos (e.g. ``proj``, ``demo_video_1``).
"""

from __future__ import annotations

import re

# Single-pass whitelist check; combined with the explicit bans below.
_SAFE_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")

MAX_PROJECT_NAME_LENGTH = 128


class ProjectNameError(ValueError):
    """Raised when a project name/id is unsafe to use on disk."""


def validate_project_name(name: str) -> str:
    """Return ``name`` unchanged if safe; raise ProjectNameError otherwise.

    Use at every boundary where a project name/id is accepted from a caller
    before it is joined into a filesystem path.
    """
    if not isinstance(name, str) or not name:
        raise ProjectNameError("Project name must be a non-empty string")

    if not _SAFE_NAME.match(name):
        raise ProjectNameError(
            f"Invalid project name {name!r}. Use 1-{MAX_PROJECT_NAME_LENGTH} chars: "
            "letters, digits, '-', '_', '.'; must start with a letter or digit. "
            "Recommended: kebab-case (e.g. 'my-product-launch')."
        )

    # Belt-and-braces: whitelist regex already excludes '/', '\', and leading
    # '.', but keep the traversal check explicit and independent.
    if ".." in name or "/" in name or "\\" in name or name.startswith((".", "-")):
        raise ProjectNameError(
            f"Invalid project name {name!r}: path separators, '..', and "
            "leading '.'/'-' are not allowed."
        )

    return name
