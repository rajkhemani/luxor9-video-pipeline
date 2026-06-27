# Asset Director — Social Creative Pipeline

## When to Use

The scene plan exists. You now generate all assets: narration (TTS), images (FLUX/image_selector), optional video clips, and music. Unlike documentary-montage (which retrieves footage), this pipeline **generates everything from scratch** using AI tools.

## Prerequisites

| Layer | Resource | Purpose |
|-------|----------|---------|
| Schema | `schemas/artifacts/asset_manifest.schema.json` | Artifact validation |
| Prior artifact | `scene_plan` | Scene descriptions, asset requirements |
| Prior artifact | `brief` | Brand identity, palette, music plan |
| Prior artifact | `script` | Narration text, speaker directions |
| Tools | `tts_selector`, `image_selector`, `video_selector`, `music_gen` | Generation tools |

## Process

### 1. Generate Narration Audio

Use `tts_selector` to generate one master narration track covering the entire script.

```python
# Master narration — longest duration needed (e.g. 45s for YouTube Shorts)
tts_selector.execute({
    "text": full_script_text,            # all sections concatenated
    "voice": "professional_female"        # match brief.tone
})
```

Save output path. Record duration from probe.

**Platform-specific trimming:** The edit director will trim narration per platform. Generate one full-length master. Do not generate 7 separate narration files.

### 2. Generate Images

For each scene's required assets, use `image_selector`:

```python
image_selector.execute({
    "description": scene["visual_description"],
    "style": {
        "palette": {
            "background": "#FFFFFF",
            "primary": "#6C5CE7",
            "text": "#1A1A2E"
        },
        "mood": brief["tone"]
    },
    "count": 1
})
```

**Style consistency rules:**
- Pass the same palette to every image generation call
- Use consistent lighting description ("bright, clean, professional")
- Reuse character descriptions if people appear in multiple scenes
- Generate hero images first, then composable elements (icons, badges)

**Minimal viable set:** 5-8 images for a 30-45s video. Do not generate 30+ images.

### 3. Generate Music

If `brief.music_plan.source == "generated"`:

```python
music_gen.execute({
    "prompt_seed": brief["music_plan"]["prompt_seed"],
    "duration": longest_platform_duration + 5  # pad for fade
})
```

If `brief.music_plan.source == "none"`: skip.

### 4. Optional: Video Clips

If scene plan requests short video clips (via `video_selector`), generate them. Priority over static images only when a scene genuinely needs motion (e.g., product demo animation).

### 5. Record the Asset Manifest

```json
{
  "version": "1.0",
  "assets": [
    {
      "id": "asset_narration_master",
      "type": "audio",
      "subtype": "tts",
      "path": "projects/<name>/assets/narration_master.mp3",
      "scene_id": "global",
      "duration_seconds": 42.3,
      "provider": "elevenlabs",
      "cost_usd": 0.08,
      "generation_summary": "Master narration, confident tone, 112 words at 150 WPM"
    },
    {
      "id": "asset_scene_1_bg",
      "type": "image",
      "subtype": "generated",
      "path": "projects/<name>/assets/images/scene_1_bg.png",
      "scene_id": "scene_1",
      "resolution": "1024x1024",
      "provider": "flux",
      "cost_usd": 0.04,
      "generation_summary": "12 app icons on white bg, centered composition"
    },
    {
      "id": "asset_music_bed",
      "type": "audio",
      "subtype": "generated",
      "path": "projects/<name>/assets/music_bed.mp3",
      "scene_id": "global",
      "duration_seconds": 50.0,
      "provider": "elevenlabs",
      "cost_usd": 0.12,
      "generation_summary": "Energetic upbeat electronic, 50s"
    }
  ],
  "metadata": {
    "pipeline": "social-creative",
    "total_cost_usd": 0.36,
    "style_anchors": {
      "palette": {"background": "#FFFFFF", "primary": "#6C5CE7"},
      "font_display": "Sora",
      "font_body": "Inter"
    }
  }
}
```

### 6. Quality Gate

- All asset files exist on disk (verify paths)
- One master narration file covering all script sections
- At least one image per scene from scene plan
- Music asset exists OR `music_plan.source == "none"`
- Style anchors logged for downstream (edit/compose reuse these)
- Total cost logged

## Common Pitfalls

- **Generating 7 narration tracks.** One master. Edit director trims per platform.
- **Inconsistent image style.** Same palette + same lighting description across all calls or the video will look disjointed.
- **Generating too many images.** 5-8 is enough for 30-45s. More = more cost without benefit.
- **Skipping cost tracking.** Budget is $3.00 total. Log every generation cost.
- **Forgetting the brand treatment.** Images must incorporate brand colors. If the brief says white+purple, every image should reflect that.
