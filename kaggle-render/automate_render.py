#!/usr/bin/env python3
"""
Luxor9 OS — fully automated Wan 2.1 video factory (Kaggle API).

Pushes the Kaggle notebook (which installs ComfyUI + Wan 2.1 and renders every
scene in its CONFIG), waits for the run to finish, downloads the videos, and
optionally syncs them to Google Drive via rclone. Designed to run unattended:
cron, GitHub Actions, or any always-on machine.

Why Kaggle and not Colab: Colab's free tier has no public API to trigger a
notebook run. Kaggle's API submits + tracks + downloads runs natively.

One-time setup:
    /root/venv/bin/pip install kaggle --only-binary=:all:
    /root/venv/bin/kaggle auth            # stores ~/.kaggle/access_token
    # optional Google Drive sync:
    rclone config                          # create a remote, e.g. "gdrive"
    export RCLONE_REMOTE=gdrive:Luxor9_Seedance2.5_Video_Campaign/renders

Usage:
    python3 automate_render.py                  # push + wait + download (+ sync if configured)
    python3 automate_render.py --force          # bump RENDER_VERSION in the notebook, then push
    python3 automate_render.py --resume         # no push: wait for the in-flight run, then download
    python3 automate_render.py --push-only      # submit the job and exit
    python3 automate_render.py --download-only  # fetch output of the latest run
    python3 automate_render.py --timeout 10800  # wait up to 3 hours for the run

Notes on the Kaggle "dedupe" trap:
    `kaggle kernels push` with byte-identical notebook content does NOT start a
    new run — Kaggle keeps the same kernel version and silently does nothing
    (status then reports the *old* run). We hash the notebook before pushing,
    and refuse to re-push identical content unless --force is given.
    --force bumps the RENDER_VERSION marker in CONFIG cell of the notebook,
    which guarantees a new version -> new run.
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
METADATA_PATH = os.path.join(HERE, "kernel-metadata.json")
NOTEBOOK_PATH = os.path.join(HERE, "Luxor9_Wan21_Kaggle.ipynb")
STATE_PATH = os.path.join(HERE, "render_state.json")
PLACEHOLDER = "YOUR_KAGGLE_USERNAME"
DEFAULT_OUTPUT_DIR = os.path.join(HERE, "renders")
POLL_INTERVAL = 60  # seconds between status checks

# Prefer the venv kaggle CLI (this repo's install target) over PATH.
_KAGGLE_CANDIDATES = [
    "/root/venv/bin/kaggle",
]
_KAGGLE_BIN = None


def die(msg):
    print("ERROR:", msg, file=sys.stderr)
    sys.exit(1)


def kaggle_bin():
    global _KAGGLE_BIN
    if _KAGGLE_BIN:
        return _KAGGLE_BIN
    for cand in _KAGGLE_CANDIDATES:
        if os.path.isfile(cand) and os.access(cand, os.X_OK):
            _KAGGLE_BIN = cand
            return cand
    found = shutil.which("kaggle")
    if found:
        _KAGGLE_BIN = found
        return found
    die("kaggle CLI not found. Install it into the venv with: "
        "/root/venv/bin/pip install kaggle --only-binary=:all:")


# --------------------------------------------------------------------------- #
# state helpers
# --------------------------------------------------------------------------- #

def load_state():
    if not os.path.isfile(STATE_PATH):
        return {}
    try:
        return json.loads(open(STATE_PATH).read())
    except Exception:
        return {}


def save_state(state):
    with open(STATE_PATH, "w") as f:
        json.dump(state, f, indent=2)


def notebook_hash():
    with open(NOTEBOOK_PATH, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


# --------------------------------------------------------------------------- #
# notebook helpers
# --------------------------------------------------------------------------- #

def bump_render_version():
    """Increment the RENDER_VERSION marker in the notebook's CONFIG cell.

    Kaggle dedupes pushes with identical content, so a content change is the
    only reliable way to force a brand-new run. Returns the new version string.
    """
    with open(NOTEBOOK_PATH) as f:
        nb = json.load(f)
    marker_re = re.compile(r'RENDER_VERSION = "([^"]+)"')
    cur = None
    for cell in nb["cells"]:
        src = "".join(cell.get("source", []))
        m = marker_re.search(src)
        if m:
            cur = m.group(1)
            # bump trailing .N
            mm = re.match(r"^(.*\.)(\d+)$", cur)
            nxt = f"{mm.group(1)}{int(mm.group(2)) + 1}" if mm else cur + ".1"
            new_src = src.replace(
                f'RENDER_VERSION = "{cur}"', f'RENDER_VERSION = "{nxt}"', 1)
            cell["source"] = new_src.splitlines(keepends=True)
            break
    if cur is None:
        die("RENDER_VERSION marker not found in the notebook — was cell 2 patched?")
    with open(NOTEBOOK_PATH, "w") as f:
        json.dump(nb, f, indent=1)
    print(f"Bumped RENDER_VERSION: {cur} -> {nxt}")
    return nxt


# --------------------------------------------------------------------------- #
# kaggle CLI wrappers
# --------------------------------------------------------------------------- #

def run_kaggle(args):
    """Run a kaggle CLI command, streaming its output."""
    bin_path = kaggle_bin()
    print(f"+ {bin_path} " + " ".join(args))
    result = subprocess.run([bin_path, *args], text=True)
    if result.returncode != 0:
        die(f"kaggle {' '.join(args)} failed (exit {result.returncode}). "
            "Check credentials: /root/venv/bin/kaggle auth")
    return result


def kernel_status(kernel_id):
    """Return the normalized status of the latest run.

    Handles the new CLI (2.x) format:
        '<kernel> has status "KernelWorkerStatus.RUNNING"'
    and the legacy CLI format:
        'status: running'
    """
    bin_path = kaggle_bin()
    try:
        probe = subprocess.run(
            [bin_path, "kernels", "status", kernel_id],
            capture_output=True, text=True,
            timeout=45,  # don't let a hung API call stall the watcher
        )
    except subprocess.TimeoutExpired:
        return "unknown"
    text = (probe.stdout + probe.stderr).strip()
    m = re.search(r'KernelWorkerStatus\.(\w+)', text)
    if m:
        return m.group(1).lower()
    m = re.search(r"status:\s*(\S+)", text)
    if m:
        return m.group(1).lower()
    return "unknown"


# --------------------------------------------------------------------------- #
# pipeline steps
# --------------------------------------------------------------------------- #

def push(force=False, accelerator="NvidiaTeslaT4"):
    """Submit the notebook to Kaggle exactly once.

    Guards against Kaggle's content-dedupe: identical notebook content does not
    start a new run, so we track the last pushed hash and refuse to re-push
    unless --force is given (which bumps RENDER_VERSION first).
    """
    if not os.path.isfile(NOTEBOOK_PATH):
        die(f"notebook not found at {NOTEBOOK_PATH}")

    state = load_state()
    h = notebook_hash()
    if not force and state.get("pushed_hash") == h:
        die(
            "Notebook content is identical to the last push — Kaggle would "
            "NOT start a new run (content-dedupe). Re-run with --force to bump "
            "RENDER_VERSION and force a fresh run."
        )

    if force:
        bump_render_version()

    args = ["kernels", "push", "-p", HERE]
    if accelerator:
        args += ["--accelerator", accelerator]
    try:
        probe = subprocess.run(
            [kaggle_bin(), *args], capture_output=True, text=True,
            timeout=180,  # a hung API call must not block the watcher forever
        )
    except subprocess.TimeoutExpired:
        die("kaggle kernels push timed out after 180s — the API may be "
            "rate-limited. Wait a few minutes and re-run (the notebook is "
            "already version-bumped, so --force is safe again).")
    output = (probe.stdout or "") + (probe.stderr or "")
    if output.strip():
        print(output.strip())
    if probe.returncode != 0:
        die(
            f"kaggle kernels push failed (exit {probe.returncode}). "
            "Check credentials: /root/venv/bin/kaggle auth"
        )

    # Extract the kernel URL from stdout ("Kernel pushed successfully: <url>").
    m = re.search(r"https://www\.kaggle\.com/code/[\w/\-]+", output)
    url = m.group(0) if m else None

    state.update({
        "kernel_id": kernel_id_from_url_or_metadata(url),
        "pushed_hash": notebook_hash(),
        "last_submitted_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "last_status": "submitted",
        "last_status_time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })
    save_state(state)
    return url


def kernel_id_from_url_or_metadata(url):
    if url:
        m = re.search(r"/code/([\w/\-]+)", url)
        if m:
            return m.group(1)
    meta = json.loads(open(METADATA_PATH).read())
    return meta.get("id", "")


def wait_for_completion(kernel_id, timeout, log_path=None):
    print(f"Waiting for run {kernel_id} ... (polling every {POLL_INTERVAL}s, "
          f"timeout {timeout}s)")
    logf = open(log_path, "a") if log_path else None
    deadline = time.time() + timeout
    while time.time() < deadline:
        status = kernel_status(kernel_id)
        stamp = time.strftime("%H:%M:%S")
        line = f"  [{stamp}] status: {status}"
        print(line)
        if logf:
            logf.write(line + "\n")
            logf.flush()

        state = load_state()
        state["last_status"] = status
        state["last_status_time"] = time.strftime(
            "%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        save_state(state)

        if status == "complete":
            if logf:
                logf.close()
            return
        if status in ("error", "canceled", "failed"):
            if logf:
                logf.close()
            die(f"Kaggle run ended with status '{status}' — check the "
                f"notebook logs at https://www.kaggle.com/code/{kernel_id}")
        time.sleep(POLL_INTERVAL)
    if logf:
        logf.close()
    die(f"Timed out after {timeout}s waiting for run {kernel_id}. "
        f"Re-run with --resume to keep waiting.")


def download(kernel_id, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    run_kaggle(["kernels", "output", kernel_id, "-p", output_dir, "-o"])
    files = [f for f in os.listdir(output_dir)
             if os.path.isfile(os.path.join(output_dir, f))]
    if not files:
        print("Warning: no files downloaded — the run may have produced no "
              "output.")
    else:
        print(f"Downloaded {len(files)} file(s) to {output_dir}:")
        for f in sorted(files):
            print("  -", f)
    return files


def sync_to_drive(output_dir):
    remote = os.environ.get("RCLONE_REMOTE")
    if not remote:
        return
    if shutil.which("rclone") is None:
        print("Warning: RCLONE_REMOTE is set but rclone is not installed — "
              "skipping Drive sync.")
        return
    print(f"Syncing {output_dir} -> {remote}")
    subprocess.run(
        ["rclone", "copy", output_dir, remote,
         "--create-empty-src-dirs", "--transfers", "4"],
        check=True,
    )
    print("Drive sync complete.")


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #

def main():
    parser = argparse.ArgumentParser(
        description="Automated Luxor9 Wan 2.1 render pipeline on Kaggle")
    parser.add_argument("--force", action="store_true",
                        help="bump RENDER_VERSION in the notebook, then push "
                             "(bypasses Kaggle's content-dedupe)")
    parser.add_argument("--resume", action="store_true",
                        help="do NOT push; wait for the in-flight run, then "
                             "download")
    parser.add_argument("--push-only", action="store_true",
                        help="submit the job and exit (no wait/download)")
    parser.add_argument("--download-only", action="store_true",
                        help="skip push; download the latest run's output")
    parser.add_argument("--accelerator", default="NvidiaTeslaT4",
                        help="Kaggle machine_shape for the run. Valid values: "
                             "NvidiaTeslaT4, NvidiaTeslaP100, Tpu1VmV38 "
                             "(default: NvidiaTeslaT4 — the old \"GPU\" value "
                             "was invalid and silently fell back to CPU)")
    parser.add_argument("--timeout", type=int, default=7200,
                        help="max seconds to wait for the run (default 7200)")
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR,
                        help="where to save downloaded videos")
    parser.add_argument("--log", default=None,
                        help="append status lines to this file (e.g. render_run.log)")
    args = parser.parse_args()

    metadata = json.loads(open(METADATA_PATH).read())
    kernel_id = metadata.get("id", "")
    if PLACEHOLDER in kernel_id:
        username = os.environ.get("KAGGLE_USERNAME")
        if not username:
            die(f"kernel-metadata.json still has the placeholder "
                f"'{PLACEHOLDER}'. Set KAGGLE_USERNAME or edit "
                f"kernel-metadata.json.")
        kernel_id = kernel_id.replace(PLACEHOLDER, username)
        metadata["id"] = kernel_id
        with open(METADATA_PATH, "w") as f:
            json.dump(metadata, f, indent=2)

    if args.download_only:
        download(kernel_id, args.output_dir)
        sync_to_drive(args.output_dir)
        return

    if args.resume:
        wait_for_completion(kernel_id, args.timeout, log_path=args.log)
        download(kernel_id, args.output_dir)
        sync_to_drive(args.output_dir)
        print("Done.")
        return

    url = push(force=args.force, accelerator=args.accelerator)
    print(f"Submitted: {url or ('https://www.kaggle.com/code/' + kernel_id)}")

    if args.push_only:
        print(f"Job submitted. Track it with: "
              f"kaggle kernels status {kernel_id}")
        return

    wait_for_completion(kernel_id, args.timeout, log_path=args.log)
    download(kernel_id, args.output_dir)
    sync_to_drive(args.output_dir)
    print("Done.")


if __name__ == "__main__":
    main()
