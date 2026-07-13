# Compose Director — Social Creative Pipeline

## When to Use

Edit decisions are locked, assets are on disk. You now render per-platform output videos using `video_compose` and `audio_mixer`. Each platform variant gets its own MP4 with correct canvas, duration, and audio mix.

## Prerequisites

| Layer | Resource | Purpose |
|-------|----------|---------|
| Schema | `schemas/artifacts/render_report.schema.json` | Artifact validation |
| Prior artifact | `edit_decisions` | Per-platform timelines |
| Prior artifact | `asset_manifest` | File paths for all assets |
| Prior artifact | `brief` | Platform canvas specs, brand identity |
| Tools | `video_compose`, `audio_mixer`, `video_stitch` | Render and mix |

## Process

### 0. Route by render_runtime

`video_compose` dispatches on `edit_decisions.render_runtime`, which was
locked at the brief stage (`remotion`, `hyperframes`, or `ffmpeg`) and carried
through edit unchanged. Do NOT let the tool fall back to a default: if the
locked runtime is unavailable at compose time, that is a blocker — surface it
per the AGENT_GUIDE escalation structure and wait for an approved
`render_runtime_selection` decision before swapping. Silent runtime swaps are
forbidden.

### 1. Render Per-Platform Outputs

For each platform timeline in `edit_decisions`:

```python
video_compose.execute({
    "platform": "tiktok",
    "canvas": "1080x1920",
    "fps": 30,
    "scenes": [
        {
            "image_path": "projects/<name>/assets/images/scene_1_bg.png",
            "start_frame": 0,
            "end_frame": 120,  # 4s at 30fps
            "animation": "slide_in_right",
            "text_overlay": None
        },
        ...
    ],
    "audio": {
        "narration_path": "projects/<name>/assets/narration_master.mp3",
        "narration_trim": {"start": 0, "end": 30},
        "music_path": "projects/<name>/assets/music_bed.mp3",
        "music_trim": {"start": 0, "end": 30},
        "ducking": {"speech_level": 0, "music_level": -8}
    },
    "subtitles": {
        "enabled": True,
        "text_source": "script_sections",
        "style": "white_text_with_shadow",
        "position": "lower_third"
    },
    "branding": {
        "logo_path": "projects/<name>/assets/logo.png",
        "logo_position": "top_left",
        "logo_size_percent": 8,
        "cta_overlay": "luxor9app.com"
    }
})
```

**Render order:** Render the longest platform first (YouTube Shorts at 45s). If it works, shorter variants are faster to render.

### 2. Validate Each Output

After each render:

```bash
ffprobe -v error -show_entries format=duration,size \
  -of default=noprint_wrappers=1 output/<platform>.mp4

# Check resolution:
ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
  -of default=noprint_wrappers=1 output/<platform>.mp4
```

Expected values:
- Resolution matches platform canvas
- Duration ≤ platform max_duration_seconds (within 5% tolerance)
- File size reasonable (typically 2-8 MB for 30s 1080p social clip)
- Audio present (2 channels, narration audible)

### 3. Record the Render Report

```json
{
  "version": "1.0",
  "pipeline": "social-creative",
  "outputs": [
    {
      "platform": "tiktok",
      "path": "renders/tiktok.mp4",
      "resolution": "1080x1920",
      "duration_seconds": 30.1,
      "file_size_mb": 4.2,
      "audio": "stereo, narration+music",
      "ffprobe_valid": true
    },
    {
      "platform": "linkedin",
      "path": "renders/linkedin.mp4",
      "resolution": "1080x1080",
      "duration_seconds": 45.0,
      "file_size_mb": 5.8,
      "audio": "stereo, narration+music",
      "ffprobe_valid": true
    }
  ],
  "metadata": {
    "render_tool": "video_compose",
    "cost_usd": 0.40,
    "total_platforms_rendered": 7,
    "failed_platforms": []
  }
}
```

### 4. Quality Gate

- One output per platform (matches brief.platforms)
- Each output resolution matches platform canvas spec
- Each output duration ≤ platform max_duration_seconds (within 5%)
- All outputs pass ffprobe validation
- Audio present in all outputs
- Subtitles rendered into output
- Brand logo visible in all outputs
- render_report.platforms list matches brief.platforms

## Common Pitfalls

- **Wrong resolution.** A 1920x1080 render for a 9:16 platform is a mistake. Double-check canvas mapping.
- **No audio.** If audio_mixer fails silently, outputs have 0 audio streams. ffprobe check catches this.
- **Subtitle overflow.** Long subtitles exceed frame width on narrow platforms. Keep text short.
- **Rendering all platforms serially when parallel is possible.** Fire off independent renders concurrently to reduce wall time.
- **Skipping ffprobe validation.** Never trust "looks right" — measure resolution and duration.
