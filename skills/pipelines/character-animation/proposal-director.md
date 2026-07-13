# Proposal Director - Character Animation Pipeline

## Goal

Present character-animation concepts that are honest about local rigged motion,
reuse, cost, and runtime choice.

## Required Proposal Elements

Each option must include:

- characters and roles,
- visual style,
- action complexity,
- rig reuse strategy,
- sample plan,
- audio architecture,
- music plan,
- render runtime options,
- cost estimate,
- honest limitation note.

## Runtime Selection

Read `skills/meta/animation-runtime-selector.md` before recommending a runtime.

When both Remotion and HyperFrames are available, **present both to the user**
(the AGENT_GUIDE hard rule) — recommend one with rationale, but never silently
default. When `render_runtime="hyperframes"` is the pick:

- Remotion: best when the final composition needs deterministic React-rendered
  video, captions, audio, scene JSON, and final MP4 governance.
- HyperFrames: best when the character scene is HTML/SVG/GSAP-heavy and benefits
  from web-native authoring, lint, validate, and registry blocks.
- FFmpeg: post-processing only. Do not pick FFmpeg as the primary runtime for
  character acting.

Wait for user approval before locking `render_runtime`. Record the shortlist —
both runtimes plus any applicable FFmpeg option — as `options_considered` in
the `render_runtime_selection` decision logged in `decision_log`.

## Sample-First Rule

Before full production, propose a 10-15 second sample containing:

- one main character,
- one expression change,
- one body action,
- one camera/background treatment,
- one audio/music cue if relevant.

Do not batch-generate all assets until this sample is approved.

## Cost Honesty

Local rigging is cheap at render time but expensive in authoring complexity.
Report the difference:

- asset generation cost,
- TTS/music cost,
- local render cost,
- manual complexity risk.
