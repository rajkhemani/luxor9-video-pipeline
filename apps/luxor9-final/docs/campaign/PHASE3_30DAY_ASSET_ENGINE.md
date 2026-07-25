# LUXOR9 MASTER CAMPAIGN ORCHESTRATION
## PHASE 3: THE ASSET ENGINE — 30-DAY PRODUCTION CALENDAR

> **Follows:** `PHASE2_CAMPAIGN_SERIES.md` (THE NINE — series design, merged)
> **Track:** Continuum / public track (see Phase 2 §5 — this engine never uses the gated
> patron vocabulary: *Cipher, Atelier, Patron, Gate*, or the chapter epigraphs)
> **Production surface:** ComfyUI (Comfy Cloud) for stills + generated video, OpenMontage
> pipelines for composed/edited deliverables

---

## 1. THE ENGINE

Five content tracks, one asset system, 30 days. Every asset inherits the Obsidian & Gold
DNA (obsidian surfaces, champagne gold accents, mono colophons) at *public-track weight*:
lighter, faster, platform-native — never the patron register.

| Track | Job | Cadence | Primary formats |
|-------|-----|---------|-----------------|
| **A — UGC Ads** | Conversion. Feels human, shot-on-phone | 2/week (8 total) | 9:16 video 15–30s, creator-style stills |
| **B — CGI Ads** | Desire. High-gloss product fantasy | 2/week (8 total) | 9:16 + 1:1 video 6–15s, macro stills |
| **C — Awareness** | Reach. One idea per asset | daily-capable (6 hero) | 1:1 + 9:16 tiles, stat cards, hook lines |
| **D — Brand Story** | Meaning. Why LUXOR9 exists | 1/week (4 total) | 16:9 + 9:16 film 45–90s, still series |
| **E — Founder Journey** | Trust. Build-in-public narrative | daily beats, 4 hero cuts | 9:16 talking video, carousel stills |

**Weekly arc (the 30 days):**

| Week | Theme | Emphasis |
|------|-------|----------|
| W1 (D1–7) | **The Hook** | Awareness + UGC teasers: "a team of AI agents, not just one" |
| W2 (D8–14) | **The Proof** | CGI product fantasy + UGC demos + founder receipts |
| W3 (D15–21) | **The Story** | Brand story films + founder origin arc |
| W4 (D22–30) | **The Close** | Conversion UGC, retargeting CGI cuts, founder ask, launch push |

---

## 2. TRACK SYSTEMS & COMFYUI PROMPT BOOK

Shared style spine for all generated visuals (append to every prompt unless a recipe
overrides it):

```
STYLE SPINE: deep obsidian black environment (#030303), champagne gold accent
lighting (#C8A96A), chiaroscuro single-source light, negative space dominant,
editorial composition, subject at lower third, hairline gold details, no clutter,
premium matte surfaces, filmic contrast, no text artifacts
```

Negative spine: `washed out, oversaturated, neon, plastic sheen, watermark, text,
logo soup, extra fingers, deformed hands, low-res, jpeg artifacts`

### TRACK A — UGC ADS (the anti-polish track)

The one track that deliberately BREAKS the style spine: UGC must look human-shot.
Gold/obsidian appears only in what's on screen (the app UI, merch, desk objects).

**Integrity rule (hard):** no synthetic humans presented as real customers or as the
founder. UGC creator footage is real capture (creators, team, or licensed) — ComfyUI
produces the *b-roll, screens, props, and backgrounds* that intercut it. AI-generated
"testimonial people" are forbidden.

| Recipe | Use | Master prompt |
|--------|-----|---------------|
| A1 · Desk POV b-roll | intercut for creator VO | `handheld iPhone footage, POV over-shoulder shot of a developer's desk at night, laptop showing a dark dashboard UI with gold accent charts, coffee cup, mechanical keyboard, shallow depth of field, slightly imperfect framing, natural window reflections, realistic phone camera grain` |
| A2 · Screen-in-hand | hook frames | `vertical phone-screen-recording aesthetic, hand holding a phone displaying a dark AI-agent dashboard app with gold progress indicators, thumb scrolling, authentic screen glare, casual home lighting` |
| A3 · Reaction cutaway | pacing beats | `candid vertical video still, home office, laptop light on face from below, genuine surprised expression lit by screen glow, documentary realism, phone camera quality` — *real capture preferred; generate only as animatic placeholder, never ship as testimonial* |
| A4 · Before/after split | conversion CTA | `split-screen vertical composition: left side cluttered chaotic desktop with dozens of browser tabs, right side single clean dark dashboard with gold status ring, photorealistic UI` |

### TRACK B — CGI ADS (the desire track)

Full style spine. This is where the luxury DNA leaks into public view.

| Recipe | Use | Master prompt |
|--------|-----|---------------|
| B1 · Obsidian monolith | hero spot | `cinematic CGI product film still, a monolithic obsidian slab standing in an infinite black studio, molten champagne gold circuitry veins slowly igniting across its surface, volumetric gold rim light, macro dust particles, 8k octane render aesthetic` + spine |
| B2 · Gold key macro | teaser loop | `extreme macro CGI shot, matte black key rotating in darkness, engraved geometry catching a single champagne gold light sweep, shallow depth of field, motes of light, luxury watch commercial aesthetic` + spine |
| B3 · Agent swarm ballet | "team of agents" visual | `abstract CGI sequence still, nine points of warm gold light orbiting a central obsidian core in choreographed formation, each trailing hairline light paths, deep black void, elegant physics, no faces no robots` + spine |
| B4 · Figurine reveal | premium/merch beats | `CGI turntable still of a 1:7 scale porcelain figurine with gold leaf accents on a machined aluminum base, dramatic single-source lighting in black studio, museum vitrine mood` + spine |
| B5 · Dashboard hologram | product-fantasy | `CGI shot of a holographic dark-glass dashboard floating above an obsidian desk surface, champagne gold data threads flowing between panels, cinematic haze` + spine |

Video route: stills via image model → image-to-video (Kling / Veo / Seedance class
partner models) for 6–10s loops → composed in OpenMontage (`cinematic` pipeline,
runtime chosen at proposal per AGENT_GUIDE).

### TRACK C — AWARENESS (the one-idea track)

Hybrid: generated backplates + typographic overlays composed in Remotion/HyperFrames
(text is NEVER generated inside the image — type is set in post, always).

| Recipe | Use | Master prompt (backplate) |
|--------|-----|---------------------------|
| C1 · Void gradient plate | hook-line tiles | `minimal abstract backdrop, deep obsidian black with a faint champagne gold radial glow rising from lower third, subtle film grain, empty negative space for typography` |
| C2 · Hairline geometry | stat cards | `ultra-minimal dark backdrop with a single thin gold geometric line motif (orbit / grid / keyhole), vast negative space, architectural precision` |
| C3 · Crowd-of-one | category POV | `wide cinematic shot, one person standing in a vast dark space, nine faint gold light points arrayed behind them like a formation, silhouette lighting` + spine |

Copy bank (set in Didot over C1/C2 plates, public-track voice — declarative but not
patron-register): `A team, not a tool.` · `Your agents report to your agents.` ·
`Ship while you sleep.` · `One command. Nine minds.` · `Stop prompting. Start delegating.`

### TRACK D — BRAND STORY (the meaning track)

45–90s films telling why LUXOR9 exists: the move from single-agent tools to an
orchestrated workforce. Public retelling of the series DNA without gated vocabulary.

| Recipe | Use | Master prompt |
|--------|-----|---------------|
| D1 · Origin frames | film chapter 1 | `cinematic still, empty workshop at night, a single desk lamp pooling warm gold light on sketches and a dark laptop, everything else falling into black, Gregory Crewdson stillness` + spine |
| D2 · The craft | film chapter 2 | `cinematic macro of hands adjusting a precise mechanism in darkness, warm gold task lighting, watchmaker energy, no face visible` + spine |
| D3 · The awakening | film chapter 3 | `slow cinematic shot of a dark room where nine points of gold light ignite one by one across a wall of black glass panels` + spine |
| D4 · The horizon | film close | `cinematic wide shot at dawn, figure at a floor-to-ceiling window over a dark city, thin gold sunrise line on the horizon, interior lit only by a dashboard's gold glow` + spine |

Structure per film: D1→D2→D3→D4 + awareness copy line + logo colophon. VO in the
public voice; score minimal; produced via `cinematic` pipeline.

### TRACK E — FOUNDER JOURNEY (the trust track)

**Real founder on camera — always.** ComfyUI supplies b-roll, diagrams-as-art, and
backdrop plates only. No AI likeness of the founder, ever (same integrity rule as
Track A).

| Recipe | Use | Master prompt |
|--------|-----|---------------|
| E1 · Build-log backdrop | talking-head backdrop plate | `soft-focus dark home-office backdrop, warm gold practical lamps bokeh, deep shadows, vertical composition with clean center third for a speaker` |
| E2 · Milestone still | carousel/receipts | `flat-lay on black matte surface: printed metrics chart with gold ink accents, mechanical keyboard corner, coffee, moleskine with sketches, top-down editorial product photography` |
| E3 · Roadmap art | vision posts | `architectural blueprint aesthetic on obsidian paper, hairline champagne gold linework showing a five-tier hierarchy diagram, elegant drafting style, no readable text` |

Daily beats: short 9:16 founder updates (real capture) + one E2/E3 still.
Hero cuts D7, D14, D21, D30 recap the week in 60s.

---

## 3. THE 30-DAY CALENDAR

`Hero` = the day's lead asset. Every hero also ships as platform derivatives via the
`social-creative` pipeline (7 variants per brief). Founder daily beats run in parallel
every weekday.

| Day | Track | Hero asset | Recipe |
|-----|-------|-----------|--------|
| 1 | C | Launch tile: "A team, not a tool." | C1 |
| 2 | A | UGC #1 — hook: "I replaced 5 tools" | A2+A1 |
| 3 | B | CGI teaser loop — key macro | B2 |
| 4 | C | Stat card: parallel agents vs. one | C2 |
| 5 | E | Founder hero #0 — "why I'm building this" | E1 |
| 6 | B | CGI — agent swarm ballet 10s | B3 |
| 7 | E | Founder weekly cut #1 + week recap carousel | E2 |
| 8 | A | UGC #2 — demo: delegate a real task | A1+A4 |
| 9 | C | Hook tile: "Ship while you sleep." | C1 |
| 10 | B | CGI — dashboard hologram spot | B5 |
| 11 | A | UGC #3 — before/after workflow | A4 |
| 12 | C | Crowd-of-one category film still | C3 |
| 13 | B | CGI — monolith ignition 15s | B1 |
| 14 | E | Founder weekly cut #2 — metrics receipts | E2 |
| 15 | D | Brand story film #1 — Origin (45s) | D1–D4 |
| 16 | A | UGC #4 — objection: "is it just hype?" | A2 |
| 17 | C | Stat card: hours saved / week | C2 |
| 18 | B | CGI — figurine reveal (merch tease) | B4 |
| 19 | D | Brand story stills series (carousel) | D1–D3 |
| 20 | A | UGC #5 — creator's 7-day verdict | A1 |
| 21 | E | Founder weekly cut #3 — hardest week yet | E1 |
| 22 | D | Brand story film #2 — The Awakening (60s) | D3+D4 |
| 23 | A | UGC #6 — conversion: pricing walkthrough | A2+A4 |
| 24 | B | CGI retarget cut — swarm 6s loop | B3 |
| 25 | C | Hook tile: "One command. Nine minds." | C1 |
| 26 | A | UGC #7 — team use-case (agency) | A1 |
| 27 | B | CGI retarget cut — key macro 6s | B2 |
| 28 | D | Brand story film #3 — The Horizon (90s) | D4 |
| 29 | A | UGC #8 — final CTA: launch offer | A4 |
| 30 | E | Founder hero #4 — 30-day retro + what's next | E1+E2 |

---

## 4. COMFYUI PRODUCTION PROTOCOL

1. **Pilot before batch.** Each recipe generates 1 pilot image for approval before any
   batch. No batch run without a human-approved pilot of that recipe.
2. **Announce before spend.** Every paid generation call is announced first: tool,
   provider, model, sample-vs-batch — per the repo's Decision Communication Contract.
3. **Route:** stills → image partner models (Flux/BFL class) via Comfy Cloud
   `partner_generate`; motion → image-to-video partner models (Kling/Veo/Seedance
   class); custom LoRA/ControlNet consistency passes → `submit_workflow` graphs.
4. **Consistency:** lock a seed per recipe family once the pilot is approved; log
   `recipe / model / seed / prompt hash` for every kept output.
5. **Storage:** generated media lands in `projects/continuum-30day/assets/…`
   (gitignored, per repo convention). Only briefs, prompts, and edit decisions are
   committed — never raster batches.
6. **Naming:** `d{day}-{track}{n}-{recipe}-v{k}` (e.g. `d13-b1-monolith-v2`).
7. **Composition:** all cuts/renders go through OpenMontage pipelines
   (`social-creative` for platform variants, `cinematic` for films) — Rule Zero applies.

## 5. QA GATES

- **Brand gate:** obsidian/gold DNA present (except Track A interiors); no patron
  vocabulary anywhere; type set in post, never in-model.
- **Integrity gate:** no synthetic humans as testimonials; no AI founder likeness;
  AI-generated segments disclosed where platform policy requires.
- **Performance gate:** every asset carries one idea and one CTA max; hooks in the
  first 2 seconds for vertical video.
- **Weekly review:** D7/D14/D21/D30 — kill underperforming recipes, double winners.

---

**PHASE 3 LOCKED — ENGINE READY.**
**NEXT: RECIPE PILOTS (ONE IMAGE PER RECIPE) → APPROVAL → WEEK 1 BATCH.**
