# Luxor9 Wan 2.1 Video Factory — Kaggle render pipeline → Google Drive

Fully automatic Wan 2.1 video rendering: pushes a Kaggle notebook (ComfyUI + Wan
2.1 T2V 1.3B fp8), waits for the GPU run, downloads the videos, and syncs them to
Google Drive. Runs from the GitHub Actions workflow in
`.github/workflows/automate-render.yml` (daily 03:00 UTC + manual dispatch), or
locally.

## Files

- `automate_render.py` — the pipeline (push → wait → download → rclone → Drive)
- `Luxor9_Wan21_Kaggle.ipynb` — the Kaggle kernel source (Wan 2.1 scenes in CONFIG cell)
- `kernel-metadata.json` — Kaggle metadata (`machine_shape: NvidiaTeslaT4`)
- `render_state.json` — last-push tracking (written at runtime)

## GitHub secrets required

| Secret | Value |
|---|---|
| `KAGGLE_ACCESS_TOKEN` | Kaggle API token (`KGAT_...`) — kaggle.com → Settings → API |
| `RCLONE_CONF` | your `rclone.conf`, base64-encoded (see below) |
| `RCLONE_REMOTE` | e.g. `gdrive:Luxor9_Seedance2.5_Video_Campaign/renders` |

Create `RCLONE_CONF` once on any machine with rclone:

```bash
rclone config                                   # create the "gdrive" remote (OAuth)
base64 -w0 ~/.config/rclone/rclone.conf         # paste output into the secret
```

## Local usage

```bash
pip install kaggle
kaggle auth                                     # stores ~/.kaggle/access_token
export RCLONE_REMOTE=gdrive:Luxor9_Seedance2.5_Video_Campaign/renders
python automate_render.py --force --timeout 10800
```

`--force` bumps `RENDER_VERSION` in the notebook, which defeats Kaggle's
content-dedupe (identical pushes do NOT start a new run).

## Known blocker

The Kaggle account **must be able to attach a GPU** — if it can't, the kernel
errors at cell 1 (`nvidia-smi not found`). Fix on kaggle.com: verify the phone
number (Account settings) and confirm the notebook's Accelerator dropdown isn't
grayed out.
