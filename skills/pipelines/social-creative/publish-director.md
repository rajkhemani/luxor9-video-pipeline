# Publish Director — Social Creative Pipeline

## When to Use

Renders are complete and validated. You now produce per-platform publishing collateral: captions, hashtags, thumbnails, and export packaging. This is the final stage before human approval.

## Prerequisites

| Layer | Resource | Purpose |
|-------|----------|---------|
| Schema | `schemas/artifacts/publish_log.schema.json` | Artifact validation |
| Prior artifact | `render_report` | Output file paths, durations |
| Prior artifact | `brief` | Brand identity, hook, CTA |
| Prior artifact | `script` (optional) | Section text for captions |

## Process

### 1. Generate Per-Platform Captions

Each caption follows: **Hook → Value → CTA** structure. Platform-specific formatting:

| Platform | Format Rules | Max Length | Hashtags |
|----------|-------------|------------|----------|
| TikTok | Short, hook-first, line breaks | 2200 chars | 3-5, mix broad+narrow |
| LinkedIn | Professional, longer form, line breaks | 3000 chars | 3-5, industry focus |
| Meta | Hook-first, emoji-friendly | 2200 chars | 5-10, engagement focus |
| X | Punchy, under 280 chars preferred | 4000 chars | 1-3, minimal |
| Reddit | Context-first, conversational | 40000 chars | 0 (subreddit flair instead) |
| Threads | Casual, hook-first, line breaks | 500 chars | 2-3, topical |
| YouTube Shorts | Hook-first, searchable | 5000 chars | 5-10, SEO focus |

**LinkedIn example:**
```
Stop juggling 12 marketing tools. Your AI marketing team is one click away.

Luxor9 replaces Canva, Hootsuite, ChatGPT, and 9 more tools with one unified platform.

→ AI-powered content creation
→ Smart scheduling across all platforms
→ Real-time performance analytics

Start your free trial at luxor9app.com

#MarketingAutomation #AIContent #SocialMediaStrategy #Luxor9 #Productivity
```

### 2. Generate Per-Platform Hashtag Sets

Produce platform-appropriate hashtag clusters:

- **TikTok**: Mix of viral (5M+) and niche (10K-100K) tags
- **LinkedIn**: Industry-specific professional tags
- **Meta**: Broad reach + engagement tags
- **X**: 1-3 targeted tags only
- **YouTube Shorts**: SEO keywords as hashtags

### 3. Generate Thumbnail Concepts

For each platform, describe optimal static thumbnail:

```json
{
  "platform": "youtube-shorts",
  "description": "Bold text overlay on dark bg: 'YOUR AI MARKETING TEAM' in Sora font, purple accent, Luxor9 logo bottom-right. 1080x1920.",
  "generation_approach": "image_selector with brief palette + bold typography"
}
```

### 4. Organize Export Package

```
exports/<project-name>/
├── tiktok/
│   ├── tiktok.mp4
│   ├── caption.txt
│   ├── hashtags.txt
│   └── thumbnail.png
├── linkedin/
│   ├── linkedin.mp4
│   ├── caption.txt
│   └── hashtags.txt
├── meta/
│   ├── meta.mp4
│   ├── caption.txt
│   ├── hashtags.txt
│   └── thumbnail.png
├── x/
│   ├── x.mp4
│   ├── caption.txt
│   └── hashtags.txt
├── reddit/
│   ├── reddit.mp4
│   └── caption.txt
├── threads/
│   ├── threads.mp4
│   └── caption.txt
└── youtube-shorts/
    ├── youtube-shorts.mp4
    ├── caption.txt
    ├── hashtags.txt
    └── thumbnail.png
```

### 5. Record the Publish Log

```json
{
  "version": "1.0",
  "pipeline": "social-creative",
  "project": "luxor9-launch",
  "platforms": {
    "tiktok": {
      "video_path": "exports/luxor9-launch/tiktok/tiktok.mp4",
      "caption": "...",
      "hashtags": ["#AIMarketing", "#Productivity", "#ContentCreation", "#Luxor9"],
      "thumbnail_concept": "bold text 'YOUR AI MARKETING TEAM' on purple bg"
    },
    ...
  },
  "export_directory": "exports/luxor9-launch/",
  "metadata": {
    "total_platforms": 7,
    "total_file_size_mb": 35.4,
    "generated_at": "2026-06-27T12:00:00Z"
  }
}
```

### 6. Quality Gate

- Per-platform caption present for each platform
- Each caption contains hook → value → CTA structure
- CTA matches brief.cta
- Hashtag set present (appropriate count per platform)
- Thumbnail concept described (for platforms where relevant)
- Export directory contains all files with correct naming
- publish_log.platforms list matches brief.platforms

## Common Pitfalls

- **One caption for all platforms.** LinkedIn professional tone ≠ TikTok casual tone. Adapt voice per platform.
- **Too many hashtags on X.** 1-3 tags. 10 tags on X looks spammy.
- **Missing CTA in caption.** Every caption must drive action. If the video has a CTA, the caption should reinforce it.
- **No thumbnail concept.** Platforms with visual preview (YouTube Shorts, TikTok, Meta) need a thumbnail plan.
- **Export structure mismatch.** If the output structure doesn't match what a social scheduling tool expects, the publish step is incomplete.
