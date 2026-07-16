---
name: last30days
description: |
  Research any topic across Reddit, X, Hacker News, YouTube, and the news from the LAST 30 DAYS. Use when: (1) Finding what's trending or being debated about a topic right now, (2) Mining timely hooks for a video proposal ("X just happened, here's what it means"), (3) Checking how the landscape changed since a reference video was published, (4) Discovering the audience's current language, pain points, and hot takes, (5) The user says "what's hot", "what's new", "recent", "this month", or "last 30 days". Produces a dated, cited trend report — never undated vibes.
---

# Last 30 Days — Recency-Scoped Topic Research

Research what actually happened around a topic in the last 30 days. General web search
returns whatever ranks — often years-old evergreen SEO content. This skill forces a hard
recency window on every query and every citation, so the output reflects the *current*
conversation, not the historical one.

## When to Use

- **Trending pulse** during a pipeline `research` stage (this is the deep version of the
  research director's "Search Batch 2").
- **Hook mining** — finding a launch, controversy, or debate fresh enough to open a video with.
- **Reference freshness check** — the user provided a reference video; what changed since it was published?
- **Audience language capture** — how are people phrasing this topic *this month*? (titles, captions, hashtags)

Do NOT use for evergreen fact-finding (statistics, definitions, expert history) — that's
ordinary research where older primary sources are often *better*.

## Core Principle: Recency Discipline

Every claim in the output must be **datable inside the window**. A result you cannot date
does not count as signal. If a source has no visible date, drop it or verify the date via
a second source. "Feels recent" is not a date.

## Step 0: Compute the Window (Mandatory)

Never trust your memory of today's date. Compute it:

```bash
date -u +%Y-%m-%d                     # today
date -u -d "30 days ago" +%Y-%m-%d    # window start
date -u -d "30 days ago" +%s          # window start as epoch (for HN API)
```

Record both dates. Every search below uses them literally.

## Step 1: Source Sweep (run in parallel)

Sweep the sources below in parallel. Use whichever of WebSearch / WebFetch is available;
the Reddit and Hacker News endpoints are plain JSON and need no API key.

### Reddit (no auth needed)

```
WebFetch: https://www.reddit.com/search.json?q=<topic>&sort=top&t=month&limit=25
WebFetch: https://www.reddit.com/search.json?q=<topic>&sort=new&t=month&limit=25
WebFetch: https://www.reddit.com/r/<subreddit>/top.json?t=month&limit=25   (once key subreddits are known)
```

- `t=month` scopes to ~30 days server-side — trust it over eyeballing.
- From the first sweep, note which subreddits dominate, then sweep those directly.
- For a promising thread, fetch `<permalink>.json` to read top comments — comments carry
  the sentiment and the audience's exact vocabulary.
- Record per post: title, subreddit, date (`created_utc`), score, num_comments, permalink.

### Hacker News (no auth needed)

```
WebFetch: https://hn.algolia.com/api/v1/search_by_date?query=<topic>&numericFilters=created_at_i><epoch30daysago>&hitsPerPage=25
WebFetch: https://hn.algolia.com/api/v1/search?query=<topic>&numericFilters=created_at_i><epoch30daysago>&hitsPerPage=25
```

The first orders by date, the second by relevance/points — run both. Record points and
comment counts; a 400-comment HN thread is a strong debate signal.

### X / Twitter

X is login-walled to anonymous fetchers, so go through search engines rather than x.com directly:

```
WebSearch: "<topic>" site:x.com after:<window-start>
WebSearch: "<topic>" (thread OR "hot take" OR unpopular) site:x.com after:<window-start>
```

- Treat thin X results as **access limitation, not absence of conversation** — say so in
  the report rather than concluding "nobody is talking about this on X."
- Cross-check anything important: engagement numbers quoted in search snippets are stale.

### YouTube

```
WebSearch: "<topic>" site:youtube.com after:<window-start>
WebSearch: "<topic>" (review OR explained OR "first look") site:youtube.com after:<window-start>
```

Record upload dates and view counts where visible — a video with 500k views in 2 weeks is
a format/angle signal for the proposal stage.

### News and blogs

```
WebSearch: "<topic>" (announcement OR launch OR release OR update) after:<window-start>
WebSearch: "<topic>" (controversy OR backlash OR criticism OR lawsuit) after:<window-start>
WebSearch: "<topic>" after:<window-start>
```

The `after:` operator is best-effort — engines sometimes return older pages. Verify the
publish date on the page itself before citing.

## Step 2: Separate Signal from Noise

Not everything found is a trend. Classify before synthesizing:

| Class | Test | Use |
|-------|------|-----|
| **Signal** | Same theme appears independently on 2+ sources | Report theme |
| **Debate** | High engagement AND visible disagreement in comments | Hook material — debate drives retention |
| **Spike** | One viral post, no echo elsewhere | Mention with caveat; may be engagement bait |
| **Noise** | Single low-engagement post, or undated | Drop |

Weight by engagement *relative to the venue* (200 points is huge for a niche subreddit,
nothing for r/technology). Note sentiment per theme: excited / frustrated / confused / divided.

## Step 3: Write the Trend Report

Output this structure (as chat summary, or as the `trending` section of a `research_brief`
artifact when running inside a pipeline):

```markdown
# Last 30 Days: <topic>
Window: <start> → <end> (computed <today>)

## TL;DR
2-4 sentences: what changed, what people care about, what's contested.

## Top Themes
Per theme: what it is, which sources carry it, sentiment, 1-2 linked examples with dates.

## Notable Threads & Posts
5-10 items: [title](link) — source, date, engagement, one-line takeaway.

## Audience Language
Words, phrasings, and framings people actually use right now (title/caption/hashtag fodder).

## Timely Hooks
2-4 concrete video hooks, each tied to a dated event or debate above.

## Timeliness Window
"publish this week" / "publish this month" / "evergreen — no fresh signal found"

## Coverage Caveats
Sources that were thin or inaccessible (e.g., X login wall) — absence of data ≠ absence of conversation.
```

When feeding a pipeline: themes and hooks map to `angles_discovered`, the window verdict
maps to `timeliness_window`, and every cited item must keep its URL and date so the script
director can anchor claims.

## Common Pitfalls

- **Skipping Step 0.** Hardcoding dates from memory silently shifts the window; compute with `date`.
- **Citing undated results.** If you can't date it inside the window, it's not last-30-days signal.
- **Trusting `after:` blindly.** Engines leak older evergreen pages into filtered results; check the page's own date.
- **Reading the X login wall as silence.** Thin x.com results usually mean blocked access, not a dead topic — flag it in Coverage Caveats.
- **One viral post = "a trend".** Require independent echo before calling anything a theme.
- **Reporting titles without comments.** On Reddit and HN the comments, not the post, carry sentiment and vocabulary — fetch them for the threads that matter.
- **Letting the sweep replace evergreen research.** This skill covers the *pulse*; data points, statistics, and expert history still come from the standard research batches.
