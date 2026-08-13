# Recovery Step 1 — Original LUXOR9 Video Runtime

Restores the Node/Remotion video runtime that was replaced with stubs during the
fork merge. Recovery only: no refactoring, no consolidation, no dependency or
deployment changes.

## Source Commit

| Field | Value |
|---|---|
| Recovery source | `ecc-tools/luxor9-video-pipeline-1782012745385` |
| Commit | `468bf7fb337c4d66661041809226db714ac0048d` (`468bf7f`) |
| Relationship to `main` | Orphaned history — no merge-base with `main` (distinct root commit `2b35a25`) |
| Restore method | `git checkout 468bf7f -- packages/video-orchestrator/src packages/video-engine/src` |
| Base branch | `claude/luxor9-pipeline-audit-r40wz7` @ `7a1d0ba` (identical to `origin/main`) |

The orphan branch and the local `_ecc` ref were left untouched. Nothing was
merged, rebased, reset, or deleted.

## Restored Directories

- `packages/video-orchestrator/src/`
- `packages/video-engine/src/`

**30 files total: 26 added, 4 replaced, 0 removed, 0 orphaned.**

Every restored file was verified byte-for-byte against `468bf7f` via
`git hash-object` blob-SHA comparison. Zero mismatches — this is exact recovery,
not a rewrite.

## Files Added (26)

### `packages/video-orchestrator/src/` — 11 added

| File | Bytes |
|---|---|
| `demo.ts` | 8485 |
| `free-demo.ts` | 3243 |
| `pipeline/PipelineController.ts` | 5651 |
| `pipeline/FreePipelineController.ts` | 4981 |
| `workers/ComfyUIWorker.ts` | 6542 |
| `workers/DeliveryWorker.ts` | 3640 |
| `workers/FreeImageWorker.ts` | 3528 |
| `workers/FreeTTSWorker.ts` | 2691 |
| `workers/HeyGenWorker.ts` | 2161 |
| `workers/MuapiWorker.ts` | 3512 |
| `workers/RemotionWorker.ts` | 3423 |

### `packages/video-engine/src/` — 15 added

| File | Bytes |
|---|---|
| `theme.ts` | 597 |
| `styles.ts` | 675 |
| `schemas/video-schemas.ts` | 1983 |
| `components/AvatarOverlay.tsx` | 1398 |
| `components/BulletList.tsx` | 1345 |
| `components/CTAButton.tsx` | 1269 |
| `components/GradientBackground.tsx` | 661 |
| `components/LogoIntro.tsx` | 1355 |
| `components/ProductCard.tsx` | 2492 |
| `compositions/SalesVideo.tsx` | 2652 |
| `compositions/ProductDemo.tsx` | 3242 |
| `compositions/SocialClip.tsx` | 1666 |
| `compositions/FreeSalesVideo.tsx` | 5551 |
| `compositions/FreeProductDemo.tsx` | 4975 |
| `compositions/FreeSocialClip.tsx` | 3273 |

## Files Replaced (4)

All four were fork-merge stubs whose own headers instructed this restoration
("the original sources were not carried over in the fork merge").

| File | Before (stub) | After (original) |
|---|---|---|
| `video-orchestrator/src/server.ts` | 1827 | 7627 |
| `video-orchestrator/src/cli.ts` | 486 | 5947 |
| `video-engine/src/Root.tsx` | 669 | 5976 |
| `video-engine/src/entry.ts` | 381 | 109 |

`entry.ts` shrinks because the stub carried an explanatory comment block. The
restored `entry.ts` imports `{ RemotionRoot }` and the restored `Root.tsx`
exports `RemotionRoot` — the pair is internally consistent (the stubs used
`Root`). Both were replaced together, so no dangling reference exists.

## Authenticity Verification

These are the original implementations, not generated or unrelated files:

1. **Coherent internal import graph.** `server.ts` → `PipelineController` /
   `FreePipelineController` → 7 workers; `Root.tsx` → 6 compositions → 6
   components → `theme.ts` / `styles.ts` / `schemas/`. Every relative import
   resolves within the restored set.
2. **Real third-party integrations**, not placeholders: Muapi.ai (submit +
   poll), HeyGen (template generate + status poll), ComfyUI (WebSocket), Resend
   (email), Twilio (SMS), `@remotion/bundler` + `@remotion/renderer`.
3. **Consistent brand system.** All engine components consume the shared `THEME`
   token set (`#00d4ff` primary), with LUXOR9 product copy throughout.
4. **Decisive provenance match against artifacts already committed on `main`.**
   `output/demo/_sales_props.json` on `main` is a byte-for-byte JSON
   serialization of the `salesProps` object literal in the restored `demo.ts`.
   Every committed output filename matches a restored generator:
   - `output/demo/{sales_demo,demo_demo,social_demo_*}.mp4` and
     `_{sales,demo,social_*}_props.json` ← `demo.ts`
   - `output/free-demo/free_sales_<epoch>.mp4` ←
     `` `free_sales_${Date.now()}` `` in `FreePipelineController.ts`

   The demo artifacts sitting on `main` were produced by exactly these sources.
5. **Runtime confirmation** — see Build/Test results below: the server boots and
   all 10 original compositions enumerate.

## Dependencies

**No dependency changes were made.** `package.json` and `package-lock.json` for
both packages are byte-identical to `HEAD` (`git diff --stat` empty).

The declared dependency sets on `main` were already identical to those at
`468bf7f` for both packages, so the restored source needed nothing added.

`node_modules` was absent, so `npm ci --no-audit --no-fund` was run in each
package to materialize the **already-declared, already-locked** dependencies —
the same command CI runs. `npm ci` installs strictly from the committed lockfile
and never rewrites manifests. 247 packages (orchestrator), 191 (engine).

Remotion additionally downloaded its Headless Shell (~92 MB) into its own cache
during composition enumeration. That is a runtime asset outside the repo; no
tracked file was affected.

## Build Result

CI runs `npx tsc --noEmit` per package. Both were run identically.

### `video-orchestrator` — FAILED (7 errors, exit 2)

```
src/workers/ComfyUIWorker.ts(1,27):   TS7016  no declaration file for module 'ws'
src/workers/ComfyUIWorker.ts(90,25):  TS7006  parameter 'raw' implicitly 'any'
src/workers/ComfyUIWorker.ts(109,23): TS7006  parameter 'err' implicitly 'any'
src/workers/DeliveryWorker.ts(15,24): TS2867  cannot find name 'Bun'
src/workers/FreeImageWorker.ts(60,63):TS2769  execSync: 'boolean' not assignable to 'string'
src/workers/FreeTTSWorker.ts(64,61):  TS2769  execSync: 'boolean' not assignable to 'string'
src/workers/RemotionWorker.ts(48,7):  TS2322  'number' not assignable to 'undefined'
```

### `video-engine` — FAILED (8 errors, exit 2)

All 8 are in `src/Root.tsx`, all the same class: `TS2322` on `defaultProps`.
Remotion's `Composition` types require the zod schema's **output** type
(post-defaults), while `defaultProps` supplies the **input** type. Fields with
`.default(...)` — `brandColor`, `showCaptions`, `primaryColor`, `featureTitle` —
are therefore reported missing. Type-level only; zod applies the defaults at
runtime (confirmed below).

### Honest assessment of these failures

**All 15 errors are pre-existing defects in the original source, not artifacts of
the restore.** The restored files are byte-identical to `468bf7f`.

The original code was only ever executed through `tsx`, which strips types
without checking them — every entry point uses it (`dev`, `cli`, `demo`,
`server`, `render.yaml`'s `npx tsx src/server.ts`). `tsc` was almost certainly
never run against this code before now.

**Consequence to be aware of: this restore turns CI red.** The stubs typechecked
cleanly, so `node-typecheck` currently passes on `main`. It will fail for both
packages once these files land. This was not fixed here because Step 1 is scoped
to recovery, and several of these are genuine bugs needing a deliberate decision
rather than a mechanical silence — see Unresolved Issues.

## Test Result

**No tests were run — none exist.** Neither package declares a `test` script, and
there are no `*.test.ts`, `*.spec.ts`, or `__tests__` files anywhere under
`packages/`. Nothing was skipped or suppressed.

Runtime smoke checks were performed instead, and both passed:

1. **Server boot** — `PORT=4123 npx tsx src/server.ts` started cleanly and
   `GET /health` returned the *original* payload
   `{"status":"ok","services":{"hasHeyGen":false,"hasMuapi":false}}`
   (the stub returned a different `{status, service, mode, note}` shape). This
   exercises the full import graph: server → both controllers → all 7 workers →
   `@remotion/bundler` + `@remotion/renderer`.

2. **Composition enumeration** — `npx remotion compositions src/entry.ts`
   exited 0 and listed all 10 original compositions:

   ```
   SalesVideo                30  1080x1920   600
   ProductDemo               30  1920x1080  1800
   SocialClip                30  1080x1920   390
   SocialClip-Square         30  1080x1080   390
   SocialClip-Landscape      30  1920x1080   600
   FreeSalesVideo            30  1080x1920   900
   FreeProductDemo           30  1920x1080   900
   FreeSocialClip            30  1080x1920   450
   FreeSocialClip-Square     30  1080x1080   450
   FreeSocialClip-Landscape  30  1920x1080   600
   ```

   These match every `compositionId` the orchestrator's `RemotionWorker`
   references. This also proves the 8 `Root.tsx` type errors are type-level
   only — the zod defaults resolve correctly at runtime.

No video was rendered end-to-end; that requires TTS and is blocked by the
missing `scripts/` directory (below).

## Unresolved Issues

Ordered by severity. **None were fixed** — all are out of Step 1's scope.

### 1. Missing `packages/video-orchestrator/scripts/` (blocks the free pipeline)

`FreeTTSWorker` resolves `../../scripts/tts_gen.py` and `FreeImageWorker`
resolves `../../scripts/free_image_gen.py`. Neither exists on `main` — they live
at `468bf7f` under `packages/video-orchestrator/scripts/` (`tts_gen.py`,
`free_image_gen.py`, `setup.sh`), which is **outside the `src/`-only restore
scope defined for this step**.

Effect: `FreeTTSWorker.generate()` returns
`{success:false, error:"TTS script not found at …"}`, so `free-sales` renders
silent video. `checkTTS()` reports no engines. This is the single largest
functional gap remaining.

### 2. `DeliveryWorker.uploadToCDN` uses the Bun runtime API under Node

`await Bun.file(localPath).arrayBuffer()` — the package runs on Node via `tsx`,
where `Bun` is undefined. Causes `TS2867` at typecheck and a `ReferenceError` at
runtime. CDN upload is non-functional as written.

### 3. `RemotionWorker.renderVideo` passes a removed Remotion option

Passes `quality: opts.quality ?? 80` to `renderMedia`. Remotion 4.x renamed this
to `jpegQuality`; the current type is `undefined`, hence `TS2322`. Renders may
proceed but the setting is inert.

### 4. `execSync({ shell: true })` type violation (2 sites)

`FreeTTSWorker.ts:64` and `FreeImageWorker.ts:60` pass `shell: true`, but Node's
`ExecSyncOptions.shell` is typed `string`. Runtime-tolerated, typecheck-fatal.

### 5. `@types/ws` is not declared

`ComfyUIWorker` imports `ws`; `ws` is a declared runtime dependency but
`@types/ws` is absent from `devDependencies`. This is the one case where the
restored source *proves* a dependency is missing. Not added here to keep this
step a pure recovery diff — it accounts for 3 of the 7 orchestrator errors.

### 6. Hardcoded developer-machine paths

`FreeTTSWorker.findPython()` probes
`C:/Users/rajkh/AppData/Local/Programs/Python/Python312/python.exe` before
falling back to `python3`/`python`/`py`. Harmless (fallbacks work) but it is a
leaked absolute path from the original author's Windows machine.

### 7. Pre-existing deploy-config mismatch (untouched, per instructions)

`render.yaml`'s worker uses `startCommand: … npx tsx src/cli.ts render-worker`.
The restored original CLI has no `render-worker` command; it would hit the
`default:` branch and `process.exit(1)`. This mismatch predates the restore and
deployment configuration was explicitly out of scope.

### 8. Schema/runtime mismatch on `voiceoverUrl`

`FreeSalesVideoSchema` declares `voiceoverUrl: z.string().url()`, but
`FreePipelineController` passes `""` when TTS fails and `Root.tsx` `defaultProps`
also pass `""`. An empty string fails `.url()` validation. Latent, and more
likely to surface now that issue #1 guarantees TTS failure.

### 9. CI will go red

Covered under Build Result. `node-typecheck` currently passes on `main` only
because it is checking stubs.

## Next Recommended Recovery Step

**Step 2 — restore `packages/video-orchestrator/scripts/` from `468bf7f`, then
fix the typecheck failures as a separate, explicitly-approved change.**

Suggested sequencing, smallest reversible unit first:

1. **Restore `scripts/`** (`tts_gen.py`, `free_image_gen.py`, `setup.sh`) from
   `468bf7f`. Pure recovery, same character as Step 1, and it closes the largest
   functional gap (issue #1). Verify with
   `npx tsx src/cli.ts free-check` — expect non-empty `ttsEngines`.
2. **Then, as a distinct change**, fix the 15 typecheck errors: add `@types/ws`
   (#5), replace the `Bun.file` call with `node:fs` (#2), rename
   `quality` → `jpegQuality` (#3), correct the two `execSync` calls (#4), and
   satisfy `Root.tsx` `defaultProps` (#8 in Build Result) — most cleanly by
   typing them against `z.input<typeof Schema>`. Keep this separate from
   recovery so the "what was restored" diff stays auditable.
3. **Then** an end-to-end render (`npx tsx src/free-demo.ts`) to confirm the
   restored pipeline produces a video with audio.

Deployment configuration (issue #7), `apps/LUXOR9-Unified`, and
`apps/luxor9-final` remain untouched and are later steps.

## State

Changes are **staged in the working tree only. Nothing has been committed.**
`git status` shows exactly 30 paths, all inside the two target directories.
