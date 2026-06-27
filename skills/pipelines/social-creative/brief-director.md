# Brief Director — Social Creative Pipeline

## When to Use

You are turning a user's product/campaign concept into the `brief` artifact. This is the creative foundation for the entire pipeline — brand identity, hook angle, platform selection, tone, music plan, and call to action.

Unlike explainer pipeline (which researches a topic), this pipeline derives the brief from the user's brand description. No web research needed — the brand identity is given or built from conversation.

## Prerequisites

| Layer | Resource | Purpose |
|-------|----------|---------|
| Schema | `schemas/artifacts/brief.schema.json` | Artifact validation |
| Pipeline | `pipeline_defs/social-creative.yaml` | Platform definitions, canvas specs |
| Playbooks | `styles/*.yaml` | Visual/audio style options |

## Process

### 1. Extract Brand Identity

Clarify with the user (if not already clear):

| Field | Question | Example |
|-------|----------|---------|
| `brand_name` | What's the brand/product name? | "Luxor9" |
| `tagline` | One-line brand promise | "Your AI marketing team" |
| `product_description` | What does it do? | "AI-powered content creation for social media teams" |
| `visual_vibe` | What does it look like? | "Clean white + deep purple, minimalist, modern fintech" |
| `target_audience` | Who's the customer? | "Social media managers at mid-market brands" |
| `cta` | What action should viewers take? | "Sign up at luxor9app.com" |

If the user hasn't specified colors, propose a palette from the playbook or derive from the brand description.

### 2. Select Platforms

From the 7 available platforms (tiktok, linkedin, meta, x, reddit, threads, youtube-shorts), which should we produce? Default: **all 7** (or as many as budget allows).

Per-platform duration selection:

| Platform | Default Max | Notes |
|----------|-------------|-------|
| TikTok | 30s | Hook-critical, fast pacing |
| LinkedIn | 45s | Professional, longer form OK |
| Meta | 30s | Hook-critical, square |
| X | 20s | Shortest attention span |
| Reddit | 45s | Educational/demo style |
| Threads | 25s | Casual, text-heavy |
| YouTube Shorts | 45s | Slightly longer form OK |

Ask the user only if the default doesn't make sense. Usually propose the default and proceed.

### 3. Define Brand Palette & Typography

Extract from conversation or propose defaults:

```json
{
  "brand_identity": {
    "name": "Luxor9",
    "tagline": "Your AI marketing team",
    "palette": {
      "primary": "#6C5CE7",
      "background": "#FFFFFF",
      "surface": "#F8F9FA",
      "text_primary": "#1A1A2E",
      "text_secondary": "#6B7280",
      "accent": "#6C5CE7"
    },
    "typography": {
      "display": "Sora",
      "body": "Inter"
    }
  }
}
```

If user gave colors, use exact. If not, propose based on vibe.

### 4. Fix the Hook Angle

The brief must have ONE hook angle. Not three options — just one, sharpened by conversation.

Good hook angles:
- "Stop juggling 12 tools. Your AI marketing team is one click away."
- "What if your ads wrote themselves?"
- "Most brands waste 40 hours a week on content. Here's the fix."

Bad hooks:
- "Check out this product" (generic)
- "We're excited to announce..." (corporate, no curiosity gap)

### 5. Set Tone Register

Pick ONE from the fixed list:

| Register | When | Emotional Feel |
|----------|------|----------------|
| confident | SaaS, enterprise, B2B | Assertive, credible |
| energetic | Consumer, social, viral | Fast, exciting |
| aspirational | Brand awareness, lifestyle | Inspiring, dreamy |
| relatable | Small biz, creator economy | Warm, conversational |
| educational | Demo, how-it-works | Patient, informative |
| provocative | Disruptor, challenger brand | Bold, surprising |

### 6. Note Music Intent (MANDATORY)

Music is MANDATORY. The ONLY way out is explicit user opt-out:

- `generated` — produce via ElevenLabs/other with prompt seed
- `none` — require opt_out_reason

Default for social-creative: `generated` with energetic/upbeat prompt.

### 7. Record the Brief

```json
{
  "version": "1.0",
  "brand_identity": {
    "name": "Luxor9",
    "tagline": "Your AI marketing team",
    "description": "AI-powered content creation for social media teams",
    "palette": { "...": "..." },
    "typography": { "display": "Sora", "body": "Inter" },
    "logo_path": null
  },
  "hook_angle": "Stop juggling 12 tools. Your AI marketing team is one click away.",
  "core_message": "Luxor9 replaces your entire content creation stack with one AI-powered platform.",
  "cta": "Visit luxor9app.com to start your free trial.",
  "tone": "confident",
  "platforms": ["tiktok", "linkedin", "meta", "x", "reddit", "threads", "youtube-shorts"],
  "platform_durations": {
    "tiktok": 30, "linkedin": 45, "meta": 30, "x": 20,
    "reddit": 45, "threads": 25, "youtube-shorts": 45
  },
  "music_plan": {
    "source": "generated",
    "provider": "elevenlabs",
    "prompt_seed": "Energetic upbeat electronic, 30-60s, modern brand feel"
  }
}
```

### 8. Quality Gate

- Hook angle is specific, non-generic, creates curiosity
- CTA is concrete action + destination
- Platforms list non-empty, subset of defined platforms
- Brand identity has name, palette, typography, tagline
- Music plan present (generated or none + reason)
- Tone is one value from fixed register list

## Common Pitfalls

- **Vague hooks.** "Check out our product" is not a hook. Every hook must create an information gap.
- **Wrong platform mix.** All 7 platforms is ambitious; if budget is tight, recommend 3 core (TikTok, LinkedIn, Meta).
- **Missing music plan.** Always include it. Silence in social ads feels unfinished.
- **Generic CTA.** "Learn more" is weak. "Start your free trial at luxor9app.com" is concrete.
- **Skipping brand identity.** Without palette/typography, asset director has no style anchor.
