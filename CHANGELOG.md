# Changelog

## 2026-09-07 — Post-consolidation hardening (v2.1.1)

Fixes the outstanding issues from `MERGE_AUDIT_REPORT.md` and restores CI to
green on `main`.

### Fixed

- **`make lint`** — pointed at `tools/analysis/composition_validator.py`
  (previously a non-existent path; audit blocker #1).
- **Node typecheck (CI was red on `main`)** —
  - `ComfyUIWorker`: added `@types/ws` (was silently `any`), typing the
    WebSocket message/error handlers.
  - `DeliveryWorker`: replaced `Bun.file()` with `node:fs/promises.readFile`.
    The service runs on Node 22 via `tsx` (see `render.yaml`); the Bun API
    does not exist there and would have crashed upload delivery at runtime.
  - `FreeImageWorker` / `FreeTTSWorker`: dropped `shell: true` from
    `execSync` options — `execSync` always runs through a shell, and the
    boolean was invalid per Node's types.
  - `RemotionWorker`: `quality` → `jpegQuality` (Remotion 4.x renamed the
    option and types the old name as `never`).
  - `video-engine` `Root.tsx`: added `brandColor` / `showCaptions` /
    `primaryColor` / `featureTitle` to composition `defaultProps`, using
    exactly the values those zod schemas declare via `.default()` — no
    runtime behavior change, just a satisfied type.
- **`.github/workflows/main.yml`** — deleted; it was an empty workflow file
  causing a failed run on every push to `main`.
- **Kaggle render cron** — added a `secret-preflight` job so the daily
  schedule skips cleanly (with a notice) when `KAGGLE_USERNAME` /
  `KAGGLE_API_TOKEN` / `RCLONE_CONF` aren't configured, instead of failing
  every night.

### Changed

- **HyperFrames is now pinned** (`0.8.30`, audit blocker #2): `Makefile`
  `HYPERFRAMES_VERSION`, `tools/video/hyperframes_compose.py`
  (`LUXOR9_HYPERFRAMES_VERSION` env override), plus a CI job that verifies
  the pinned version still resolves from npm.
- **Project-name validation** (`lib/project_names.py`, enforced in
  `write_checkpoint`) — rejects path traversal (`..`, separators, leading
  dots/dashes) while staying compatible with existing ids like `proj` /
  `demo_video_1`.
- **`projects/` TTL pruning** — `scripts/cleanup_projects.py` (dry-run by
  default, `--apply` + `--days`, `keep`/`.keep` marker honored) and
  `make clean-projects DAYS=30 APPLY=1`.
- CI: `make lint` now runs in the python-tests job; node-typecheck matrix
  uses `fail-fast: false` so both packages' errors are reported.

### Verification

- `pytest`: 366 passed, 9 skipped (7 pre-existing environment-limited cases
  requiring system `ffmpeg`/`ffprobe`/`fc-list` binaries behave identically
  on the pristine base commit).
- `npx tsc --noEmit`: clean in both `packages/video-orchestrator` and
  `packages/video-engine`.
- `make lint`, `make preflight`: pass.
