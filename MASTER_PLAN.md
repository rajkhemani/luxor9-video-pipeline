# LUXOR9 — MASTER PLAN

> Enterprise Multi-Agent Teams. Hierarchical orchestration.

---

## POSITIONING

**LUXOR9 vs Manus.io:**

| Manus.io | LUXOR9 |
|----------|--------|
| Single agent per session | Specialized agents in multi-tier hierarchy |
| General-purpose agent | Defined roles (scout, mail, sales, build, write, etc.) |
| Task-by-task execution | Parallel, coordinated execution |
| No built-in team structure | Commander → C-Suite → VPs → Managers → Workers |
| You tell it what to do | Agents communicate, delegate, and escalate autonomously |

**Tagline:** *"Deploy a team of AI agents, not just one."*

**Target audience:** Engineering teams, enterprises, developers who need complex multi-step automation.

---

## 1. CURRENT STATE

### What's Built
- **Marketing site** — Next.js 14, dark theme
- **Backend** — FastAPI, multi-tier agent hierarchy, PostgreSQL, Redis, LLM engine with multi-provider fallback
- **Agent system** — Fully built: Commander → C-Suite → VPs → Managers → Workers (scout, mail, social, sales, build, write, chat, data, test, growth)
- **Legacy frontend** — Vite/React with 3D agent visualization, MCP services, Gemini API
- **Remotion video studio** — Hero ad + feature reel templates

### What's Broken/Missing
- ❌ **Duplication** — Redundant copies of the project
- ❌ **No CI/CD** — manual everything
- ❌ **Zero tests**
- ❌ **No production deployment**
- ❌ **Backend has conflicting entrypoints**
- ❌ **No monitoring, no email automation**

---

## 2. THE PRODUCT

### Agent Hierarchy (Core Differentiator)

```
Tier 0:  COMMANDER   →  Strategic direction, goal decomposition
Tier 1:  C-SUITE     →  CORTEX (strategy), TREASURY (resources), SENTINEL (security/ops)
Tier 2:  VPs         →  FORGE, NEXUS, MUSE, ATLAS, VAULT, MARKET, TERRA, SIGNAL, TITAN, ORACLE
Tier 3:  MANAGERS    →  Per VP (Acquisition, Delivery, Retention)
Tier 4:  WORKERS     →  scout, mail, social, sales, build, write, chat, data, test, growth
```

Each agent has:
- Specialized role with specific capabilities
- Defined communication channels (up/down/across hierarchy)
- Autonomous think cycles
- LLM-powered reasoning with multi-provider fallback
- Task tracking

### What This Enables That Manus Can't
- **Parallel execution** — Multiple agents research/act simultaneously
- **Enterprise workflows** — Manager delegates to workers, workers escalate failures
- **Multi-step campaigns** — Scout → Write → Build → Test → Deploy pipeline
- **Resilience** — If one agent fails, manager reassigns; hierarchy self-heals

---

## 3. PHASES

### Phase 0: Cleanup & Reposition
- Delete duplicate directories
- Consolidate backend (single entrypoint)
- Fix critical backend issues (API key handling, DB fallback)

### Phase 1: Go Live
- Deploy marketing site → Vercel
- Deploy backend → Railway/Fly.io
- Connect waitlist → email service
- Set up monitoring

### Phase 2: Launch
- Campaign focus on multi-agent orchestration
- Content pipeline
- Social presence
- Developer outreach (HN, GitHub, technical blogs)

### Phase 3: Revenue
- Stripe integration
- Pricing tiers (currently $29/$99/$299)
- Onboarding flow

### Phase 4: Scale
- Automation loops
- Community building
- API/SDK for custom agent creation

---

## 4. MARKETING MESSAGING

| Element | Copy |
|---------|------|
| Tagline | "Deploy a team of AI agents, not just one." |
| Value Prop | "Specialized agents in a multi-tier hierarchy — working together, not alone." |
| Target | Developers, engineering teams, enterprises |
| Tone | Technical, capable, infrastructure |


### Key Hooks
- "Manus gives you one agent. LUXOR9 gives you a team."
- "What if your AI agents could talk to each other?"
- "One agent is a tool. A hierarchy of agents is a workforce."
- "Your most valuable AI agent is the one that coordinates the others."

---

## QUICK REFERENCE

| Component | Location | Tech |
|-----------|----------|------|
| Marketing site | `luxor9-final/` | Next.js 14, Vercel |
| Backend | `LUXOR9-Unified/backend/app/` | FastAPI, PostgreSQL |
| Agent code | `LUXOR9-Unified/backend/app/agents/` | Multi-tier hierarchy |
| Agent factory | `factory.py` | Creates the hierarchy |
| Legacy UI | `luxor9-agentic-ai/` | Vite + React + Three.js |
| Videos | `my-video/` | Remotion |
| Design tokens | `luxor9-final/tailwind.config.ts` | Cyan #00d4ff / Purple #8b5cf6 |
