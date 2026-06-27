# Script Director — Social Creative Pipeline

## When to Use

You write the master narration script for a brand ad / social creative video. Unlike explainer scripts (which teach a concept), social creative scripts sell — they hook, create desire, and drive action within seconds.

One master script serves **all platform variants**. Duration trimming happens at the edit stage, not here. Write for the LONGEST platform duration (typically YouTube Shorts or Reddit at 45s); shorter variants trim from the body section.

## Prerequisites

| Layer | Resource | Purpose |
|-------|----------|---------|
| Schema | `schemas/artifacts/script.schema.json` | Artifact validation |
| Prior artifact | `brief` | Brand identity, hook_angle, core_message, cta, tone, platform_durations |
| Playbook | Active style playbook | Voice style, pacing rules |

## Process

### 1. Absorb the Brief

- **Hook angle**: Your opening must deliver on this promise
- **Core message**: The one thing viewers should remember
- **CTA**: Must appear in every platform variant
- **Tone**: Shapes word choice, sentence length, formality
- **Platform durations**: Longest platform determines master script word count

### 2. Plan the Micro-Structure

Social creative follows a tight three-act arc:

```
HOOK (0-4s, ~10 words)     → Grab attention. Bold claim, surprising question, or
                              provocative statement. MUST work without visuals.
                              NEVER: "Hey guys" / "In this video" / "Check this out"

BODY/VALUE (4s to 80%)     → Establish the problem, present the solution, show proof.
                              For a product ad: pain → relief → evidence.
                              For brand awareness: context → vision → resonance.

CTA (last 20%)             → Drive action. Must match brief.cta.
                              Can be said, shown as text overlay, or both.
```

### 3. Write the Master Script

Each section:

```json
{
  "id": "s1",
  "label": "Hook",
  "text": "Stop juggling twelve tools. Your AI marketing team is one click away.",
  "start_seconds": 0,
  "end_seconds": 4,
  "speaker_directions": "Confident, measured pace. Emphasize 'one click away'.",
  "enhancement_cues": [
    {
      "type": "animation",
      "description": "Fast cut of 12 app icons collapsing into one Luxor9 logo",
      "timestamp_seconds": 1
    }
  ]
}
```

**Word budget** (for longest platform, ~45s):

| Duration | Words | Sections |
|----------|-------|----------|
| 30s max | ~65-75 | Hook + body + CTA (3 sections) |
| 45s max | ~100-115 | Hook + 2 body + CTA (4 sections) |
| 60s max | ~130-150 | Hook + 3 body + CTA (5 sections) |

**Pacing by tone:**

| Tone | WPM | Feel |
|------|-----|------|
| confident | 150 | Measured, deliberate |
| energetic | 170 | Fast, exciting |
| aspirational | 130 | Slow, dreamy |
| relatable | 150 | Conversational |
| provocative | 160 | Punchy, bold |

### 4. Write Speaker Directions

Reference TTS capabilities:

| Direction | TTS Implementation |
|-----------|-------------------|
| "Confident, measured pace" | Speed 1.0, stability 0.7 |
| "Fast, exciting" | Speed 1.2, style 0.8 |
| "Punchy, emphasize key words" | Speed 1.1, SSML emphasis |

### 5. Add Enhancement Cues

Minimum one per section. Cues tell the Scene Director what visuals to plan:

| Cue Type | When | Example |
|----------|------|---------|
| `animation` | Concept needs motion | "App icons collapsing into logo" |
| `hero_shot` | Product showcase | "Luxor9 dashboard on screen" |
| `stat_card` | Data/reveal | "Show: 'Replace 12 tools with 1'" |
| `testimonial` | Social proof | "Quote from customer" |
| `overlay` | Key term / label | "Show 'AI Marketing Platform' badge" |
| `broll` | Context behind narration | "Person working on laptop, coffee shop" |

### 6. Self-Evaluate

| Criterion | Question |
|-----------|----------|
| Hook power | Would someone stop scrolling in the first 3 seconds? |
| Word count | Within ±10% of longest platform duration? |
| CTA clarity | Is the call to action specific and actionable? |
| Enhancement density | At least one cue every 8-10 seconds? |

## Common Pitfalls

- **Too many words for the shortest platform.** X/Twitter at 20s can fit ~50 words. If master script is 120 words, it must be trimmable.
- **Hook that needs visuals.** "Look at this screen" fails on audio-only autoplay. Hook must work without images.
- **Generic CTA.** "Click the link" is weak. "Start your free trial at luxor9app.com" is specific.
- **Missing enhancement cues.** Script without visual direction = radio ad script. Every section needs a cue.
