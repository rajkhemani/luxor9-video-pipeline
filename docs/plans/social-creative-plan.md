# Implementation Plan: social-creative Pipeline

## Overview

Build a new OpenMontage pipeline for short-form brand ads / social creative videos. Supports 7 platform variants (TikTok, LinkedIn, Meta, X, Reddit, Threads, YouTube Shorts) with fully AI-generated assets from a text brief.

## Architecture

```
brief → script → scene_plan → assets → edit → compose → publish
  │         │          │          │       │         │        │
  │         │          │          │       │         │        └── captions, hashtags, thumbnails
  │         │          │          │       │         └──────────── per-platform renders
  │         │          │          │       └────────────────────── per-platform edit decisions
  │         │          │          └────────────────────────────── TTS + images + video + music
  │         │          └───────────────────────────────────────── per-scene visual treatment + assets
  │         └──────────────────────────────────────────────────── micro-script: hook → body → CTA
  └────────────────────────────────────────────────────────────── brand brief + platform selection
```

## Components to Create

### 1. Pipeline Manifest ✅ (DONE)
`pipeline_defs/social-creative.yaml` — written, defines 8 stages + 7 platform specs.

### 2. Director Skills (8 files)
| Skill | File | Dependencies |
|-------|------|-------------|
| Executive Producer | `skills/pipelines/social-creative/executive-producer.md` | none |
| Brief Director | `skills/pipelines/social-creative/brief-director.md` | none |
| Script Director | `skills/pipelines/social-creative/script-director.md` | brief artifact |
| Scene Director | `skills/pipelines/social-creative/scene-director.md` | script, brief |
| Asset Director | `skills/pipelines/social-creative/asset-director.md` | scene_plan, brief |
| Edit Director | `skills/pipelines/social-creative/edit-director.md` | scene_plan, asset_manifest |
| Compose Director | `skills/pipelines/social-creative/compose-director.md` | edit_decisions, asset_manifest, brief |
| Publish Director | `skills/pipelines/social-creative/publish-director.md` | render_report, brief |

### 3. Remotion Composition Components
Extended from existing luxor9-core/campaign patterns — white/purple palette, Sora+Inter fonts.
- `remotion-composer/src/components/BrandAdCard.tsx` — brand ad card with logo/text/CTA
- `remotion-composer/src/components/ProductShowcase.tsx` — product highlight with animated specs
- `remotion-composer/src/components/CTACard.tsx` — call-to-action end card
- `remotion-composer/src/components/TestimonialCard.tsx` — quote/testimonial for social proof
- `remotion-composer/src/components/social/` — Platform-specific layout wrappers (safe zones, logo placement, CTA style)

### 4. Artifact Schemas
| Schema | File | New? |
|--------|------|------|
| brief | `schemas/artifacts/brief.schema.json` | Extend existing (add platform-specific fields) |
| script | `schemas/artifacts/script.schema.json` | Reuse existing |
| scene_plan | `schemas/artifacts/scene_plan.schema.json` | Reuse existing |
| asset_manifest | `schemas/artifacts/asset_manifest.schema.json` | Reuse existing |
| edit_decisions | `schemas/artifacts/edit_decisions.schema.json` | Extend existing (add per-timeline platforms) |
| render_report | `schemas/artifacts/render_report.schema.json` | Extend existing (add per-platform outputs) |
| publish_log | `schemas/artifacts/publish_log.schema.json` | Extend existing (add per-platform captions/hashtags) |

### 5. Tools
No new tools needed — leverages existing registry (tts_selector, image_selector, video_selector, music_gen, video_compose, audio_mixer). May need `video_trimmer` for per-platform length adjustment.

## Implementation Order

### Phase A: Pipeline Skeleton (sequential)
1. Executive Producer skill — orchestration logic, stage transitions, quality gates
2. Brief Director skill — brand brief template, platform selector, hook design
3. Script Director skill — micro-script structure, hook/body/CTA framing
4. Scene Director skill — visual treatment, asset requirements, platform safe zones

### Phase B: Asset & Render (parallel-capable)
5. Asset Director skill — TTS + image/video gen + music orchestration
6. Edit Director skill — per-platform timeline, cuts, subtitles, music ducking
7. Compose Director skill — per-platform render, multi-output orchestration
8. Publish Director skill — captions, hashtags, export packaging

### Phase C: Remotion Components (parallel with Phase A)
9. BrandAdCard, ProductShowcase, CTACard, TestimonialCard
10. Platform layout wrappers (social/tiktok.tsx, social/linkedin.tsx, ...)
11. Register in Root.tsx and remotion-composer scene index

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 7 platform renders × $0.50-$2.00 each | High — cost overrun | Compose primary at full quality, derivatives at reduced cost (batch) |
| TTS voice inconsistency across 7 platforms | Medium — brand feel | Single TTS narration track, mixed into all variants |
| Image/video gen inconsistent style | Medium — visual cohesion | Single hero image set, cropped/recomposed per platform |
| Platform spec changes (canvas, safe zones) | Low — maintainable | Platform config in YAML manifest, not hardcoded |

## Verification Checkpoints

1. Pipeline manifest loads: `python -c "from lib.pipeline_loader import load_pipeline; p=load_pipeline('social-creative'); print(p.name)"`
2. Each director skill readable and references valid artifact schemas
3. Preflight passes with expected capability envelope
4. Full production run from brief → publish produces 7 valid MP4s
5. All MP4s pass ffprobe validation at correct resolution
