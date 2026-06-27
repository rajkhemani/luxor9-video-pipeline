# Edit Director — Social Creative Pipeline

## When to Use

Assets are generated, scene plan is locked. You now produce **per-platform edit decisions** — one timeline per platform variant. Each timeline references the same master assets but with different durations, cuts, and text overlay placement.

## Prerequisites

| Layer | Resource | Purpose |
|-------|----------|---------|
| Schema | `schemas/artifacts/edit_decisions.schema.json` | Artifact validation |
| Prior artifact | `scene_plan` | Scene timings, platform framing notes |
| Prior artifact | `asset_manifest` | File paths, durations |
| Prior artifact | `brief` | Platform canvas specs, safe zones, CTA style |
| Prior artifact | `script` (optional) | Section text for subtitle generation |

## Process

### 1. Lock Master Timeline

From scene_plan, build the master scene sequence (longest platform):

```
Master Timeline (45s for YouTube Shorts):
  0.0-4.0s   scene_1: Hook — Tool Chaos
  4.0-14.0s  scene_2: Problem — Current workflow pain
  14.0-26.0s scene_3: Solution — Luxor9 dashboard demo
  26.0-36.0s scene_4: Proof — Testimonial / stat
  36.0-45.0s scene_5: CTA — Logo + URL
```

This master timeline is the template for all platform variants.

### 2. Per-Platform Timeline Derivation

For each platform, derive a trimmed timeline:

| Platform | Max Duration | Strategy |
|----------|-------------|----------|
| TikTok (9:16) | 30s | Trim body sections: scene_2 shortened, scene_4 removed |
| LinkedIn (1:1) | 45s | Full master, adjust safe zone from 85% to 90% |
| Meta (1:1) | 30s | Same as TikTok trim, square canvas |
| X (9:16) | 20s | Only Hook + Solution + CTA |
| Reddit (16:9) | 45s | Full master, landscape reframe |
| Threads (9:16) | 25s | Hook + Solution + CTA |
| YouTube Shorts (9:16) | 45s | Full master |

For each platform timeline record:

```json
{
  "platform": "tiktok",
  "canvas": "1080x1920",
  "safe_zone": 0.85,
  "duration_seconds": 30,
  "scenes": [
    {"scene_id": "scene_1", "asset_id": "asset_scene_1_bg", "start": 0, "end": 4, "text_overlay": null},
    {"scene_id": "scene_2", "asset_id": "asset_scene_2_bg", "start": 4, "end": 10, "text_overlay": "12 tools → 1 platform"},
    {"scene_id": "scene_3", "asset_id": "asset_scene_3_bg", "start": 10, "end": 22, "text_overlay": "AI-powered. Always on."},
    {"scene_id": "scene_5", "asset_id": "asset_scene_5_cta", "start": 22, "end": 30, "text_overlay": "luxor9app.com"}
  ],
  "narration_trim": {"start_seconds": 0, "end_seconds": 30},
  "music_trim": {"start_seconds": 0, "end_seconds": 30},
  "subtitles": {
    "enabled": true,
    "style": "white_text_with_shadow",
    "position": "lower_third"
  }
}
```

### 3. Configure Audio

- **Narration**: Trim master narration to platform duration. Cross-fade in/out.
- **Music**: Duck narration segments (music volume -8dB during speech, -3dB between).
- **Sync**: Each scene's visual start aligns with narration section start (±0.5s).

### 4. Brand Elements

For each timeline, record placement of:

- **Logo**: Position (top-left/center/bottom-right), size (% of canvas)
- **CTA text**: Font (brand typography), color (brand palette), safe zone position
- **Subtitle style**: Per platform (some need burn-in, some can use platform captions)

### 5. Quality Gate

- One timeline per platform (matches brief.platforms)
- All timelines within platform max_duration_seconds
- All scene asset references point to existing files from asset_manifest
- Audio ducking configured for all speech segments
- No timeline gaps or overlaps (0 to duration fully covered)
- Brand CTA and logo placement specified per platform
- Subtitles enabled for all platforms

## Common Pitfalls

- **Timeline gaps.** Every second from 0 to duration must be filled with a scene.
- **Invalid asset references.** Cross-check all asset_ids against asset_manifest. A typo here produces a broken render.
- **Same timeline for all platforms.** Each platform has different duration and safe zones. LinkedIn 1:1 needs different logo placement than TikTok 9:16.
- **Forgetting narration trim.** If the platform is 20s and the master narration is 45s, you must specify trim points or the audio overflows.
- **No subtitle configuration.** Social content without subtitles fails on autoplay. Always enable them.
