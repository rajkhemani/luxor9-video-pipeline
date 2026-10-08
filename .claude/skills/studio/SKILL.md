---
name: studio
description: LUXOR9 Studio. Turns one chat request into finished marketing assets (video ad, UGC-style ad, commercial, image, carousel, banner, design system, templates), market research and scheduling, using short capability names and hiding every model name. Use for /studio, for any short-name capability command (/ad, /carousel, ...), or whenever the user asks for campaign assets for a brand.
---

# LUXOR9 Studio

One chat, one flow: brief → assets → brand check → schedule. The user sees short capability names; everything else stays behind the curtain.

## 1. Speak in capability labels only

- Capabilities and their labels live in `capabilities.yaml` (`list_capabilities` on the `luxor9-studio` MCP server, or `lib.capabilities.public_catalog()`).
- In every user-facing message, preview, caption and filename, use labels such as "Ad creation", "Carousel", "Motion". **Never name a model, provider, tool, vendor or render runtime.**
- Still record the exact tool, provider and model in the project's `decision_log`. Hiding names is a presentation rule, not an audit exception (AGENT_GUIDE.md, "Exception: LUXOR9 Studio surface").

## 2. Cost policy: mix

- Every capability runs its **free route** by default.
- A paid model runs only after the user explicitly upgrades **that specific asset**: "Upgrade this Ad creation to premium? About $X." The yes covers that asset only.
- `premium_only` capabilities (Motion) always need that yes first.
- Budget caps and approval thresholds in `config.yaml` still apply on top.

## 3. Route, then run the real pipeline

1. Pick the capability from the request. If unclear, offer at most three labels as choices.
2. Get its internal route: `capability_route(name, upgrade)` (MCP) or `lib.capabilities.resolve()`.
3. By status:
   - `ready`: run it. A `pipeline` route goes through AGENT_GUIDE.md Rule Zero: manifest, stage director skills, Layer 3 skills. A `skill` route invokes that skill.
   - `needs_setup`: tell the owner which plugin to install (`/plugin marketplace add rajkhemani/luxor9-video-pipeline`, then `/plugin install <plugin>@luxor9`, see `capabilities.yaml` → `integrations`) or which connector to connect. To anyone else, say only "this capability isn't enabled yet".
   - `planned`: say it is coming and offer the nearest ready capability.
4. Respect the route's `guard`. `no_synthetic_testimonials`: never present a generated person as a real customer.

## 4. Full-kit flow (one sentence → campaign)

1. **Research** (optional, fast): what the market is saying now.
2. **Brief**: confirm goal, audience, platforms and one key message in a single short question, then go.
3. **Static first**: images (and carousels and banners once ready) come back fast and cheap.
4. **Video in the background**: start Ad creation, UGC-style ad or Commercial runs, keep chatting, and report when done.
5. **Brand check**: run `brand_check` on every deliverable (copy, colors, AI disclosure, claim sources). Any error blocks delivery; fix it and re-check.
6. **Present** a compact gallery: label, preview, one-line purpose. Then offer Scheduling.

## 5. Mobile-first replies

Short messages, one question at a time, previews before explanations, no tables wider than a phone, no jargon.
