""".env parsing: template placeholders must never read as configured keys."""
from __future__ import annotations

from pathlib import Path

import pytest

from tools.base_tool import parse_env_line

REPO = Path(__file__).resolve().parents[2]


@pytest.mark.parametrize(
    "line, expected",
    [
        ("FAL_KEY=                     # FLUX images, Veo video", ("FAL_KEY", "")),
        ("FAL_KEY=\t# note", ("FAL_KEY", "")),
        ("FAL_KEY=", ("FAL_KEY", "")),
        ("FAL_KEY=abc123", ("FAL_KEY", "abc123")),
        ("FAL_KEY=abc123  # my key", ("FAL_KEY", "abc123")),
        ('FAL_KEY="abc123"', ("FAL_KEY", "abc123")),
        ("BRAND_COLOR=#C8A96A", ("BRAND_COLOR", "#C8A96A")),
        ('BRAND_COLOR="#C8A96A"', ("BRAND_COLOR", "#C8A96A")),
        ("# FAL_KEY=abc", None),
        ("", None),
        ("not an assignment", None),
    ],
)
def test_parse_env_line(line, expected):
    assert parse_env_line(line) == expected


def test_every_template_key_parses_empty():
    """A fresh `make setup` copies .env.example to .env; nothing may look set."""
    parsed = [parse_env_line(line) for line in (REPO / ".env.example").read_text(encoding="utf-8").splitlines()]
    keys = {key: value for key, value in (p for p in parsed if p)}
    assert "OPENROUTER_API_KEY" in keys and "NVIDIA_API_KEY" in keys
    assert {k: v for k, v in keys.items() if v} == {}
