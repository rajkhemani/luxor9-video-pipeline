# Scene Director — Social Creative Pipeline

## When to Use

You have a master script and a brand brief. Your job is to plan the visual treatment for each script section — what the viewer sees at each moment, with platform-specific framing considerations.

Unlike documentary scenes (which search for existing footage), social-creative scenes describe AI-generated visuals. Every scene must be specific enough for the Asset Director to generate via FLUX / image_selector / video_selector.

## Prerequisites

| Layer | Resource | Purpose |
|-------|----------|---------|
| Schema | `schemas/artifacts/scene_plan.schema.json` | Artifact validation |
| Prior artifact | `script` | Section text, enhancement cues, timings |
| Prior artifact | `brief` | Brand identity, palette, typography, platform specs |
| Pipeline | `pipeline_defs/social-creative.yaml` | Platform canvas sizes, safe zones |

## Process

### 1. Map Script Sections to Scenes

Each script section becomes at least one scene. Enhancement cues from the script guide visual direction.

### 2. Per-Scene Visual Treatment

For each scene, produce:

```json
{
  "id": "scene_1",
  "script_section": "s1",
  "label": "Hook — Tool Chaos",
  "duration_seconds": 4,
  "visual_description": "Fast montage of 12 different app icons (Canva, Hootsuite, ChatGPT, etc.) spinning and overlapping chaotically, then snapping into one clean Luxor9 logo on white background. Deep purple glow effect.",
  "asset_requirements": {
    "type": "animation",
    "necessary": true,
    "description": "12 app icons → collapse → Luxor9 logo, 4 seconds",
    "generation_approach": "image_selector: generate 12 app icon candidates + hero logo image, then animate in Remotion"
  },
  "brand_treatment": {
    "logo_visible": true,
    "logo_position": "center final frame",
    "palette": "brand palette",
    "typography": "none (visual only)"
  },
  "platform_framing": {
    "safe_zone_note": "Logo must stay within 85% center for 9:16 platforms",
    "text_overlay_candidates": ["Your AI marketing team is here"]
  }
}
```

**Scene types for social creative:**

| Type | When | Visual Style |
|------|------|-------------|
| hero_shot | Product showcase, first impression | Clean product mockup, brand palette |
| problem_illustration | Pain point setup | Split screen / before-after |
| solution_demo | How it works | Animated flow, screenshots |
| testimonial | Social proof | Quote card, avatar + text |
| stat_card | Data/reveal | Bold number + brief text |
| lifestyle | Brand feel | Styled scene with person using product |
| cta_card | Final action | Logo + CTA text + button visual |

### 3. Platform-Specific Framing Notes

Add per-platform framing guidance for each scene:

```json
{
  "platform_notes": {
    "tiktok": "Center-framed, text in upper-third safe zone",
    "linkedin": "Square crop from center, subtitle-safe",
    "x": "Vertical tight crop, avoid left/right edges",
    "reddit": "Full landscape, wider establishing shot",
    "meta": "Square, logo in top-right safe zone",
    "threads": "Vertical, text-heavy overlay OK",
    "youtube-shorts": "Vertical, full bleed, CTA at bottom fifth"
  }
}
```

### 4. Required Assets Summary

End with a consolidated `required_assets` list:

```json
{
  "required_assets": [
    {"scene_id": "scene_1", "type": "image", "count": 13, "description": "12 app icons + 1 hero logo image"},
    {"scene_id": "scene_2", "type": "image", "count": 1, "description": "Luxor9 dashboard screenshot mockup"},
    {"scene_id": "scene_3", "type": "image", "count": 1, "description": "Split screen: chaotic vs organized workspace"},
    {"scene_id": "scene_4", "type": "image", "count": 1, "description": "Customer testimonial card mockup"},
    {"scene_id": "scene_5", "type": "image", "count": 1, "description": "CTA end card with logo + URL"}
  ],
  "narration_required": true,
  "music_required": true
}
```

### 5. Quality Gate

- Every script section maps to ≥1 scene
- Every scene has a specific `visual_description` (good enough for T2I generation)
- At least 3 scene types used (no 5 consecutive hero_shots)
- `brand_treatment` specified per scene
- Required assets list complete with counts and descriptions
- Platform framing notes present for all selected platforms

## Common Pitfalls

- **Vague visual descriptions.** "Show a person working" is useless for T2I generation. "Woman in her 30s, business casual, working at laptop in bright modern office, warm lighting, depth of field" is actionable.
- **Ignoring safe zones.** A CTA placed at bottom edge of a TikTok video will be hidden by the caption area. Respect per-platform safe_zone ratios from pipeline manifest.
- **Too many assets.** One hero image per scene type is enough. Don't request 42 unique images for a 30s video.
- **No brand treatment.** Every scene should specify where logo/colors appear. The scene plan is the style bible.
- **Same visual approach for every scene.** Vary: hero shot → closeup → wide → animated overlay. Visual monotony kills retention.
