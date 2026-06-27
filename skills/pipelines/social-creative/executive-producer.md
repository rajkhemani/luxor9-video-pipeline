# Executive Producer — Social Creative Pipeline

## When to Use

You are the **Executive Producer (EP)** for the social-creative pipeline. You orchestrate 8 stages serially: brief → script → scene_plan → assets → edit → compose → publish. You maintain cumulative state, exercise judgment at each gate, and send back stages when cross-stage issues surface.

**You replace the default parallel execution model.** Each stage director is a stateless worker; you are the stateful brain.

Key difference from other pipelines: **every downstream stage must consider platform variants.** Brief specifies which of the 7 platforms to target; all later stages produce per-platform decisions or per-platform outputs.

## Prerequisites

| Layer | Resource | Purpose |
|-------|----------|---------|
| Pipeline | `pipeline_defs/social-creative.yaml` | Stage definitions, review focus, success criteria |
| Skills | All 7 director skills + `meta/reviewer` | Stage execution knowledge |
| Schemas | All artifact schemas | Validation |
| Playbook | Active style playbook | Quality constraints |
| Tools | Full tool registry | Available capabilities |

## Cumulative State

```
EP_STATE:
  pipeline: social-creative
  playbook: <selected playbook name>
  platforms: []           # subset of [tiktok, linkedin, meta, x, reddit, threads, youtube-shorts]
  budget_total_usd: 3.00
  budget_spent_usd: 0.0
  budget_remaining_usd: 3.00

  artifacts:
    brief: null       # → brief (includes brand identity + platform selection)
    script: null      # → script (master script, all platforms derive from one)
    scene_plan: null  # → scene_plan (per-platform scene descriptions)
    assets: null      # → asset_manifest (narration TTS + images + video + music)
    edit: null        # → edit_decisions (per-platform timelines)
    compose: null     # → render_report (per-platform output files)
    publish: null     # → publish_log (per-platform captions, hashtags, thumbnails)

  # Cross-stage tracking
  brand_identity: {}         # name, tagline, palette, typography
  platform_durations: {}     # platform_id → seconds
  narration_durations: {}    # script_section_id → actual_seconds
  total_narration_seconds: 0
  style_anchors: {}          # consistency tokens (palette, font, logo ref)
  revision_counts: {}        # stage_name → number of revisions
  issues_log: []             # all issues found, with resolution status
```

## Execution Protocol

### Phase 0: Initialize

1. Load pipeline manifest (`social-creative.yaml`)
2. Load playbook (from user selection or default `flat-motion-graphics`)
3. Set budget (default $3.00)
4. Initialize EP_STATE

### Phase 1: Executive Stages Serially

For each stage in order: `brief → script → scene_plan → assets → edit → compose → publish`

```
EXECUTE_STAGE(stage_name):

  1. PREPARE
     - Load director skill for this stage
     - Inject EP_STATE (prior artifacts, budget, style anchors)
     - Inject any EP feedback from previous revision attempts

  2. SPAWN DIRECTOR
     - Director executes its full process per skill MD
     - Director produces artifact

  3. REVIEW
     - Schema validation against artifact schema
     - Check review_focus items from pipeline manifest
     - Check success_criteria from pipeline manifest
     - Cross-check against playbook constraints
     - Run EP-SPECIFIC CROSS-STAGE CHECKS

  4. GATE DECISION
     If PASS:
       - Store artifact in EP_STATE
       - Update cumulative tracking
       - Continue

     If REVISE:
       - Increment revision_counts[stage_name]
       - If >= 3: PASS WITH WARNINGS
       - Else: compose specific feedback, re-spawn

     If SEND_BACK(target_stage):
       - Only when downstream discovery invalidates upstream work
       - Max 1 send-back per stage pair
```

### Phase 2: Final Quality Assurance

After all stages complete, holistic review:

```
FINAL_QA:
  1. PROBE each platform output:
     - Duration within ±5% of target?
     - Resolution matches platform canvas?
     - Audio: narration audible, music balanced?
     - File: valid container, reasonable size?

  2. CROSS-PLATFORM CONSISTENCY:
     - Same brand identity across all variants?
     - Same narration track used (cropped per duration)?
     - Logo placement within safe zones?

  3. BUDGET RECONCILIATION:
     - Total actual spend vs. $3.00 budget
     - Per-stage cost breakdown
```

## EP-Specific Cross-Stage Checks

### After BRIEF stage:
```
CHECK: Brand identity completeness
  - brand_identity.name, tagline, palette, typography all present
  - At least 2 platforms selected (not none)
  - Hook angle is specific and non-generic
  - CTA is concrete

CHECK: Music plan
  - Must be present: `generated` or `none`
  - If `none`: confirm with user before proceeding
```

### After SCRIPT stage:
```
CHECK: Word count vs. shortest platform duration
  - Calculate total_words / 150 = estimated seconds
  - Must fit within SHORTEST platform's max_duration_seconds
  - If too long: REVISE script

CHECK: Three-act structure
  - Hook section exists (0-4s)
  - Body/value section covers main message
  - CTA section exists in last 20%
```

### After ASSETS stage:
```
CHECK: Narration vs. platform durations
  - For each platform: does narration fit?
  - If narration > platform max: note which platforms need trimmed version

CHECK: Style consistency
  - All generated images share consistent palette (from brief)
  - Logo/badge present in visual assets

CHECK: Budget gate
  - If > 90% consumed with stages remaining: alert, switch to cheaper tools
```

### After COMPOSE stage:
```
CHECK: Per-platform validation
  - For each output: ffprobe resolution, duration, audio
  - Resolution matches platform canvas from manifest
  - Duration ≤ platform max_duration_seconds
```

## Quality Gates Summary

| Gate | Stage | What's Checked | Fail Action |
|------|-------|---------------|-------------|
| G1 | brief | Brand identity, hook quality, platform selection, music plan | Revise brief |
| G2 | script | Word count vs shortest platform, three-act structure, CTA present | Revise script |
| G3 | scene_plan | Coverage, visual variety, platform-specific framing | Revise scene_plan |
| G4 | assets | File existence, style consistency, budget | Revise assets OR send-back to scene |
| G5 | edit | Timeline completeness per platform, valid asset refs | Revise edit |
| G6 | compose | Output probe per platform, resolution match | Revise compose |
| G7 | publish | Per-platform captions, hashtags, thumbnails | Revise publish |
| FINAL | all | Cross-platform consistency, budget reconciliation | Send-back to specific stage |

## Execution Limits

| Limit | Value |
|-------|-------|
| Max revisions per stage | 3 |
| Max send-backs per stage pair | 1 |
| Max total send-backs | 3 |
| Max total budget | $3.00 (configurable) |
| Max total wall-time | 45 minutes |

After any limit: **proceed with warnings**, never block indefinitely.

## Common Pitfalls

- **Treating all platforms as independent productions.** One master narration + one visual set, cropped/recomposed per platform. Don't regenerate per platform.
- **Ignoring safe zones.** Each platform has different safe zone for text/CTA. Logo placement must respect them.
- **Over-spending on images.** 6-8 hero images is enough for all platforms. Don't generate 42 images.
- **Skipping ffprobe validation.** A 1920x1080 video output for a 1080x1920 platform spec is a bug.
- **Letting narration overflow.** The shortest platform duration is the hard cap. Trim or re-script before rendering.
