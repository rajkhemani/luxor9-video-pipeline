# LUXOR9 — Multi-Agent Orchestration Platform

**Positioning:** Enterprise multi-agent teams. Specialized agents in a multi-tier hierarchy. Competing with Manus.io on team-based orchestration vs single-agent approaches.

## Commands

```sh
npm run dev      # next dev on port 3000
npm run build    # next build
npm run lint     # next lint (only linter, no typecheck)
npm run start    # next start (production server)
```

No test runner, typecheck script, CI, or formatter config exists.

## Architecture

- **Next.js 14 App Router**, TypeScript, `strict: true`
- **Tailwind CSS 3.4** with `dark` class mode — `<html className="dark">` forced in `layout.tsx`
- **shadcn/ui** (`components.json`): `@/` alias → project root, `rsc: true`
- Imports use `@/` barrel exports from `components/ui/index.ts` and `components/marketing/index.ts`
- `"use client"` required per-component where hooks or browser APIs are used (e.g. `button.tsx`, marketing components)
- No React compiler / server actions / API routes — static marketing site only

## Directory structure

```
app/layout.tsx         # Root layout (dark mode, metadata, Inter + JetBrains Mono fonts)
app/page.tsx           # Homepage: Navbar → Hero → Features → HowItWorks → Pricing → CTA → Footer
app/globals.css        # Tailwind directives + custom utilities (glow, glass, noise, grid-pattern, gradient-text)
components/ui/         # shadcn-style primitives (Button, Card, Badge, Input) with CVA variants
components/marketing/  # Page sections (Navbar, Hero, Features, HowItWorks, Pricing, CTA, Footer, EmailCapture)
lib/utils.ts           # cn(), formatCurrency(), formatNumber(), formatPercent(), formatDuration()
design-system/         # tokens.css (design token reference, NOT applied — tokens live in tailwind.config.ts)
```

## Design system

- **Primary**: `#00d4ff` (cyan), **Secondary**: `#8b5cf6` (purple)
- **Text**: `dark-text: #e2e8f0`, `dark-muted: #64748b`
- **Surfaces**: `dark-bg: #0a0a0f`, `dark-surface: #12121a`, `dark-elevated: #1a1a24`, `dark-border: #1e1e2e`
- **Font**: Inter (headings 700-800, body 400-500), JetBrains Mono for code
- **Animations**: framer-motion, custom tailwind keyframes (`fade-in`, `slide-up`, `scale-in`, `pulse-glow`, `float`)
- **Glow utilities**: `.glow-primary`, `.glow-secondary`, `.glow-success`, `.gradient-text`, `.glass`, `.animated-border`
- **Icons**: lucide-react

## Component conventions

- UI primitives use `class-variance-authority` (`cva`) for variant/size APIs
- `cn()` from `@/lib/utils` merges Tailwind classes (clsx + tailwind-merge)
- Re-export from barrel `index.ts` in each component directory
- Data constants (`features`, `steps`, `pricingPlans`) live alongside their consumer component in `hero.tsx`
- Marketing components are `"use client"` (use framer-motion, event handlers, hooks)
