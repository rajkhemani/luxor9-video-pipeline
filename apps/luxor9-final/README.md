# LUXOR9 — Multi-Agent Orchestration Platform

<p align="center">
  <img src="https://img.shields.io/badge/Multi--Agent-Orchestration-blueviolet" alt="Multi-Agent">
  <img src="https://img.shields.io/badge/Hierarchy-Tiers-success" alt="Hierarchy">
  <img src="https://img.shields.io/badge/For-Developers%20%26%20Teams-orange" alt="For Developers & Teams">
</p>

**Deploy a team of AI agents, not just one.**

LUXOR9 is a hierarchical multi-agent orchestration platform. Specialized agents organized in a multi-tier hierarchy — working together, communicating, delegating, and executing complex workflows autonomously. Built for developers and engineering teams who need more than a single AI agent.

## The Agent Hierarchy

```
Commander (Tier 0)  —  Strategic direction, goal decomposition
C-Suite   (Tier 1)  —  Strategy, Resources, Security/Operations
VPs       (Tier 2)  —  Domain-specialized category leads
Managers  (Tier 3)  —  Acquisition, Delivery, Retention per domain
Workers   (Tier 4)  —  scout, mail, social, sales, build, write, chat, data, test, growth
```

## Key Features

- **Hierarchical Orchestration** — Multi-tier agent hierarchy with autonomous delegation, communication, and escalation
- **Specialized Agent Roles** — Each agent has a defined role, toolset, and communication channel
- **Parallel Execution** — All agents run simultaneously in coordinated think cycles
- **Multi-LLM Intelligence** — Multi-provider fallback with intelligent tiered routing
- **Self-Healing** — Failed tasks auto-escalate up the hierarchy. Managers reassign, VPs rebalance
- **Real-time Dashboard** — Live status of all agents, task completion rates, and hierarchy health

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker (for backend services)

### Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the marketing site.

### Backend

```bash
cd apps/LUXOR9-Unified/backend
cp .env.example .env
docker-compose up -d
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Project Structure

```
apps/luxor9-final/         # Next.js 14 marketing site
apps/LUXOR9-Unified/
  backend/
    app/
      agents/              # All agent implementations
        base_agent.py      # Base agent with lifecycle, messaging, LLM
        prime.py           # LUXOR-PRIME (Commander)
        csuite.py          # C-Suite agents
        vp_agent.py        # VP agents
        manager_agent.py   # Manager agents
        worker_agent.py    # Worker agents
        factory.py         # Creates the full hierarchy
      api/                 # API routes
      orchestrator.py      # Central orchestration engine
    docker-compose.yml
```

## Design System

- **Primary**: `#00d4ff` (Cyan)
- **Secondary**: `#8b5cf6` (Purple)
- **Theme**: Dark mode
- **Font**: Inter (headings), JetBrains Mono (code)

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Python 3.11, LangChain, SQLAlchemy
- **Agents**: OpenAI / Anthropic / Groq (multi-provider fallback)
- **Infrastructure**: PostgreSQL, Redis, Docker

## License

MIT License

## Known gap

`app/page.tsx` imports `@/components/marketing/*` and `@/components/ui/*`, but the
`components/` directory was never carried over in the fork merge — `next build`
fails with module-not-found until those components are restored from the original
fork. Dependency installs and audits work normally.
