---
name: motion
description: LUXOR9 Studio "Motion" capability. Use when the user upgrades a shot or asset to premium AI video (including MiniMax's newest video models such as H3 / Hailuo 3), AI images or voice, through the minimax MCP server. Paid API.
---

# Motion

Premium AI video, image and voice through MiniMax's official `minimax-mcp` server.

## Setup (owner only, once)

1. Install `uv` (https://docs.astral.sh/uv/).
2. Set two environment variables before starting Claude Code:
   - `MINIMAX_API_KEY`: your MiniMax API key.
   - `MINIMAX_API_HOST`: must match the platform the key came from:
     `https://api.minimax.io` (international) or `https://api.minimaxi.com` (mainland China).
     A key and host from different platforms is the usual cause of "invalid api key".

## Rules

- **Paid only:** Motion has no free route. Under the Studio "mix" policy, run it only after the user explicitly upgrades that specific asset, and state the estimated cost before the call. Budget caps in `config.yaml` still apply.
- **Short names only:** to the user this is "Motion". Never name MiniMax, Hailuo, H3 or any model in user-facing replies. Record the exact model and its cost in the project's decision log.
- **Model choice:** the models the server can call depend on the installed `minimax-mcp` version and your account. Check the video tool's model parameter before choosing; prefer the newest video model your account has (H3 / Hailuo 3 where available, otherwise Hailuo 2.x). Do not guess model IDs.
- **No fake people as customers:** never generate a person presented as a real customer or testimonial (FTC 16 CFR Part 465).
- **Brand:** run `brand_check` (luxor9-studio server) on every result before presenting it. Save outputs under `projects/<project-name>/assets/video/`.
