import { useState } from "react";

const ACID = "#39FF14";
const DARK = "#0A0A0A";
const CARD = "#111111";
const CARD2 = "#161616";
const BORDER = "#222222";
const DIM = "#888888";

const platforms = [
  { id: "instagram", name: "Instagram", icon: "📸", color: "#E1306C", handle: "@Luxor9.Ai" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "#0A66C2", handle: "Luxor9" },
  { id: "meta", name: "Meta Ads", icon: "⚡", color: "#1877F2", handle: "Paid" },
  { id: "twitter", name: "X / Twitter", icon: "𝕏", color: "#FFFFFF", handle: "@Luxor9Ai" },
  { id: "reddit", name: "Reddit", icon: "🔴", color: "#FF4500", handle: "r/ strategy" },
  { id: "pinterest", name: "Pinterest", icon: "📌", color: "#E60023", handle: "Luxor9" },
];

const phases = [
  {
    id: 1, name: "IGNITION", days: "Days 1–7", subtitle: "Problem Agitation & Brand Emergence",
    color: "#39FF14", desc: "Establish the void Luxor9 fills. No product pitches — only questions that haunt enterprise decision-makers. The world before orchestration is chaos. Make them feel it.",
    pillars: ["'The Single Agent Wall' — abstract visualizations of one agent hitting limits", "Founder manifesto drop — The vision behind hierarchical agent teams", "Platform teaser: 'What if your agents could talk to each other?' — Intrigue campaign", "Reddit seeding — Organic threads on multi-agent orchestration in r/MachineLearning, r/startups", "LinkedIn: First thought leadership article — 'Why Every AI Agent Platform Gets Isolation Wrong'"],
    posts: { instagram: 7, linkedin: 4, twitter: 14, reddit: 3, pinterest: 5, meta: 2 }
  },
  {
    id: 2, name: "REVELATION", days: "Days 8–14", subtitle: "Feature Architecture & Product Education",
    color: "#00FFFF", desc: "The product enters the frame. Surgical feature reveals — one capability per day. Each post functions as a standalone argument for why Luxor9 is categorically different from everything that came before it.",
    pillars: ["Feature reveal: 5-tier hierarchy — 'Why a Commander agent changes everything'", "Real-time agent communication fabric — 30-second Reel: 179 agents, one objective", "Agent hierarchy visualization — interactive carousel walkthrough", "Self-healing architecture — 'What happens when a worker fails. The manager handles it. Watch.'", "Multi-LLM fallback — '3 providers. Zero downtime. Intelligent routing.'"],
    posts: { instagram: 9, linkedin: 5, twitter: 18, reddit: 4, pinterest: 6, meta: 4 }
  },
  {
    id: 3, name: "AUTHORITY", days: "Days 15–21", subtitle: "Social Proof, Partnerships & Thought Dominance",
    color: "#FFD700", desc: "Establish Luxor9 as the intellectual centre of the orchestration conversation. Investor-facing signals embedded within B2B content. Early access community activation begins.",
    pillars: ["LinkedIn: Long-form — 'Hierarchical AI: Why Agent Teams Beat Single Agents'", "Twitter/X: Technical thread series — 'Building a 179-agent hierarchy (a 12-part breakdown)'", "Community AMAs on Reddit — r/artificial, r/MachineLearning", "Pinterest: Agent hierarchy infographic series", "GitHub: Open-source agent framework teaser", "Waitlist social proof — 'X teams already deploying agent hierarchies'"],
    posts: { instagram: 8, linkedin: 6, twitter: 21, reddit: 5, pinterest: 7, meta: 5 }
  },
  {
    id: 4, name: "CONVERSION", days: "Days 22–30", subtitle: "Waitlist Surge & Empire Builder Activation",
    color: "#FF6B35", desc: "Every piece of content converges on a single threshold: @Luxor9.Ai. Urgency without desperation. Scarcity without manipulation. The message is simple — the window is open. Step through it or watch others build without you.",
    pillars: ["Final cinematic ad deploy — '179 agents, one team' — 21:9 cut across all platforms", "'Early Access' waitlist mechanics — first 500 teams get priority onboarding", "Founder video — direct to camera, raw, no production gloss", "Final LinkedIn push — 'I built a 179-agent hierarchy. Here's why it matters.'", "Twitter/X countdown thread — '5 tiers. 179 agents. 1 platform. 5 days to launch.'", "Meta retargeting: Full-funnel convergence on all engaged users"],
    posts: { instagram: 10, linkedin: 5, twitter: 20, reddit: 3, pinterest: 4, meta: 8 }
  }
];

const contentPillars = [
  { name: "Thought Leadership", pct: 30, color: ACID, desc: "Position Luxor9 as the definitive voice on multi-agent orchestration" },
  { name: "Product Education", pct: 25, color: "#00FFFF", desc: "Feature-by-feature reveals — agent hierarchy, communication, self-healing" },
  { name: "Founder Narrative", pct: 20, color: "#FFD700", desc: "Building a 179-agent hierarchy — the technical journey" },
  { name: "Community & Engagement", pct: 15, color: "#FF6B35", desc: "GitHub discussions, AMAs, technical threads" },
  { name: "Social Proof & FOMO", pct: 10, color: "#E1306C", desc: "Waitlist signals, team onboarding, early adopter case studies" },
];

const kpis = [
  { metric: "Instagram Followers", target: "+2,500", timeframe: "30 days", icon: "📈" },
  { metric: "LinkedIn Impressions", target: "150,000+", timeframe: "30 days", icon: "👁" },
  { metric: "Waitlist Signups", target: "500–1,000", timeframe: "30 days", icon: "🎯" },
  { metric: "Twitter/X Reach", target: "80,000+", timeframe: "30 days", icon: "🔊" },
  { metric: "Reddit Upvotes (Total)", target: "5,000+", timeframe: "30 days", icon: "⬆️" },
  { metric: "Meta Ad CTR", target: "3.5%+", timeframe: "Paid", icon: "💡" },
  { metric: "Profile Link Clicks", target: "8,000+", timeframe: "30 days", icon: "🔗" },
  { metric: "Content Saves (IG)", target: "1,500+", timeframe: "30 days", icon: "🔖" },
];

const platformStrategies = {
  instagram: {
    frequency: "1–2 posts/day + 4 Stories/day",
    formats: ["Cinematic Reels (15–60s)", "Carousels (feature walkthroughs)", "Quote cards (Playfair + Acid Green)", "Behind-the-build Stories"],
    hooks: ["'What happens when 179 AI agents work together in real time?'", "'We didn't build an agent. We built a hierarchy.'", "'Early access is open. 500 teams max.'"],
    bestTime: "7–9 AM IST / 6–8 PM IST",
    note: "Primary brand stage. Every post drives to @Luxor9.Ai bio link."
  },
  linkedin: {
    frequency: "1 post/day + 2 articles/week",
    formats: ["Long-form articles (1,500–3,000 words)", "Document carousels (PDF-style posts)", "Founder video (direct-to-camera)", "Poll + insight threads"],
    hooks: ["'Why single AI agents always hit a ceiling — and hierarchies don't'", "'I built a 179-agent hierarchy. Here's the architecture.'", "'Hierarchical orchestration is the TCP/IP of multi-agent AI.'"],
    bestTime: "8–10 AM IST (Tue–Thu)",
    note: "Investor & CTO pipeline channel. Every article is a due-diligence asset."
  },
  meta: {
    frequency: "3–5 ad sets running concurrently",
    formats: ["Video ads (15s + 30s cuts)", "Lead gen forms (Waitlist direct)", "Retargeting carousel", "Lookalike audiences from LinkedIn"],
    hooks: ["Awareness → Consideration → Conversion full funnel", "Retarget all Instagram profile visitors", "CTO/VP Engineering job title targeting"],
    bestTime: "Continuous — optimise by day 7",
    note: "Budget: Allocate 60% to retargeting, 40% to cold audience prospecting."
  },
  twitter: {
    frequency: "3–5 tweets/day + 2 threads/week",
    formats: ["Technical threads (12-part series)", "Hot takes on AI/MCP news", "Real-time engagement with AI Twitter", "Quote-tweet amplification strategy"],
    hooks: ["'Hierarchical AI is not a trend. It's the next architecture. Thread 🧵'", "'179 reasons single-agent platforms are obsolete (and the hierarchy that replaces them)'", "'One agent is a tool. A team of agents is infrastructure.'"],
    bestTime: "9 AM / 12 PM / 8 PM IST",
    note: "Velocity channel. Be in the conversation before the conversation finds you."
  },
  reddit: {
    frequency: "3–5 posts/week across subreddits",
    formats: ["Value-first threads (no promotion)", "AMA sessions (Week 3)", "Case study posts", "Question seeding for organic discovery"],
    hooks: ["r/MachineLearning, r/artificial, r/startups, r/entrepreneur, r/SaaS", "Never pitch — only contribute. Let the product earn its mention.", "Build karma before Week 1 ends."],
    bestTime: "10 AM–2 PM IST (weekdays)",
    note: "Trust channel. Reddit rewards authenticity and punishes self-promotion. Play the long game."
  },
  pinterest: {
    frequency: "5–7 pins/day (schedulable)",
    formats: ["Enterprise architecture infographics", "Founder quote visuals", "Tech explainer visual series", "Cinematic still frames from ad"],
    hooks: ["'The anatomy of a self-healing AI pipeline'", "'MCP: The protocol that changes enterprise AI'", "'9 agents. One command. Zero limits.' — Visual series"],
    bestTime: "8–11 PM IST",
    note: "Evergreen discovery engine. Pins compound over 6–12 months. Build the visual archive now."
  }
};

const weeklyCalendar = [
  { week: 1, theme: "IGNITION", days: [
    { day: 1, content: "Founder manifesto drop — 'Why agents need teams' — Instagram + LinkedIn", platform: "instagram,linkedin" },
    { day: 2, content: "Reddit seed: 'Why do single AI agents keep hitting a wall?' — r/MachineLearning", platform: "reddit" },
    { day: 3, content: "'What if your agents could talk to each other?' — Teaser Reel", platform: "instagram" },
    { day: 4, content: "LinkedIn Article: 'The Isolation Problem No One in AI Is Solving'", platform: "linkedin" },
    { day: 5, content: "Twitter thread: '5 reasons single-agent architectures fail at complex tasks'", platform: "twitter" },
    { day: 6, content: "Pinterest: 'The state of multi-agent orchestration in 2025' infographic", platform: "pinterest" },
    { day: 7, content: "Instagram carousel: 'Before LUXOR9' — the single-agent limit visualized", platform: "instagram" },
  ]},
  { week: 2, theme: "REVELATION", days: [
    { day: 8, content: "Feature reveal: 5-tier hierarchy — 30s Reel + LinkedIn post", platform: "instagram,linkedin" },
    { day: 9, content: "Twitter thread: 'How we built a 179-agent hierarchy — a 12-part breakdown'", platform: "twitter" },
    { day: 10, content: "Instagram carousel: Agent hierarchy visualization — 8-slide walkthrough", platform: "instagram" },
    { day: 11, content: "Feature reveal: Real-time agent communication fabric — Reel", platform: "instagram" },
    { day: 12, content: "LinkedIn: 'Self-healing agent systems: how failures cascade up, not out'", platform: "linkedin" },
    { day: 13, content: "Meta Ads LAUNCH — Awareness campaign goes live across all audiences", platform: "meta" },
    { day: 14, content: "Feature reveal: Multi-LLM fallback — '3 providers. Zero downtime.'", platform: "instagram,twitter" },
  ]},
  { week: 3, theme: "AUTHORITY", days: [
    { day: 15, content: "LinkedIn manifesto: 'The Architecture of Agentic Enterprise: A 2025 Manifesto'", platform: "linkedin" },
    { day: 16, content: "Reddit AMA — r/startups: 'I built an MCP-native orchestration platform solo. AMA.'", platform: "reddit" },
    { day: 17, content: "Pinterest infographic series launch: 'The anatomy of an orchestrated enterprise'", platform: "pinterest" },
    { day: 18, content: "Twitter/X: Waitlist social proof tweet — 'X founders already inside.'", platform: "twitter" },
    { day: 19, content: "Instagram: Founder-to-camera video — raw, no script, no production", platform: "instagram" },
    { day: 20, content: "Meta retargeting campaign LAUNCH — all website + Instagram visitors", platform: "meta" },
    { day: 21, content: "Partnership teaser — blurred logos, 'Coming soon.' — all platforms", platform: "instagram,linkedin,twitter" },
  ]},
  { week: 4, theme: "CONVERSION", days: [
    { day: 22, content: "Cinematic ad DEPLOY — 21:9 cut distributed across all platforms", platform: "instagram,linkedin,twitter,meta" },
    { day: 23, content: "Twitter/X: '9 days. 9 agents. 9 reasons to join the waitlist.' — countdown thread", platform: "twitter" },
    { day: 24, content: "LinkedIn: Founder video — direct camera, 'What I built and why it matters'", platform: "linkedin" },
    { day: 25, content: "Instagram: 'Invite only. For now.' — urgency post + Stories sequence", platform: "instagram" },
    { day: 26, content: "Reddit: r/entrepreneur — 'Lessons from 15 months of solo building'", platform: "reddit" },
    { day: 27, content: "Meta: Full-funnel convergence — all retargeting budgets maximised", platform: "meta" },
    { day: 28, content: "Twitter/X: Final thread — 'Luxor9: what it is, what it does, why it matters now'", platform: "twitter" },
    { day: 29, content: "Instagram + LinkedIn: 'The window is open.' — final CTA push", platform: "instagram,linkedin" },
    { day: 30, content: "ALL PLATFORMS: Campaign close — waitlist final push + metrics recap post", platform: "instagram,linkedin,twitter,reddit,meta" },
  ]},
];

const platformColor = (p) => {
  const m = { instagram: "#E1306C", linkedin: "#0A66C2", twitter: "#FFFFFF", reddit: "#FF4500", pinterest: "#E60023", meta: "#1877F2" };
  return m[p] || ACID;
};

export default function LuxorCampaign() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activePlatform, setActivePlatform] = useState("instagram");
  const [activePhase, setActivePhase] = useState(1);

  const tabs = [
    { id: "overview", label: "Campaign Overview" },
    { id: "phases", label: "Phase Architecture" },
    { id: "platforms", label: "Platform Playbooks" },
    { id: "calendar", label: "30-Day Calendar" },
    { id: "kpis", label: "KPI Framework" },
  ];

  return (
    <div style={{ background: DARK, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#FFFFFF", padding: "0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #39FF14; border-radius: 2px; }
        .tab-btn { transition: all 0.2s; cursor: pointer; border: none; background: none; }
        .tab-btn:hover { color: #39FF14 !important; }
        .card-hover { transition: all 0.25s; } .card-hover:hover { transform: translateY(-2px); border-color: #39FF14 !important; }
        .platform-btn { transition: all 0.2s; cursor: pointer; }
        .platform-btn:hover { opacity: 1 !important; }
        .phase-btn { transition: all 0.2s; cursor: pointer; }
        .glow { box-shadow: 0 0 20px rgba(57,255,20,0.15); }
        .acid-text { color: #39FF14; }
        .mono { font-family: 'DM Mono', monospace; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .pulse { animation: pulse 2s infinite; }
        @keyframes slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .slide-in { animation: slideIn 0.3s ease; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#0D0D0D", borderBottom: `1px solid ${BORDER}`, padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ACID, boxShadow: `0 0 8px ${ACID}` }} className="pulse" />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: DIM, letterSpacing: "0.15em", textTransform: "uppercase" }}>Campaign Active</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
            <span style={{ color: ACID }}>LUXOR9</span> — 30-Day Empire Campaign
          </h1>
          <p style={{ color: DIM, fontSize: "13px", margin: "4px 0 0", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>
            "Built for Those Who Build Empires." · @Luxor9.Ai · India + Global
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: DIM, marginBottom: "4px" }}>TOTAL TOUCHPOINTS</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", color: ACID, fontWeight: 900, lineHeight: 1 }}>847+</div>
          <div style={{ fontSize: "11px", color: DIM }}>across 6 platforms · 30 days</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#0D0D0D", borderBottom: `1px solid ${BORDER}`, padding: "0 40px", display: "flex", gap: "0" }}>
        {tabs.map(t => (
          <button key={t.id} className="tab-btn" onClick={() => setActiveTab(t.id)}
            style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 500, color: activeTab === t.id ? ACID : DIM, borderBottom: activeTab === t.id ? `2px solid ${ACID}` : "2px solid transparent", letterSpacing: "0.02em" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }} className="slide-in">

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div>
            {/* Campaign brief */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "32px", marginBottom: "24px", borderLeft: `3px solid ${ACID}` }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: ACID, letterSpacing: "0.2em", marginBottom: "12px" }}>CAMPAIGN BRIEF</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", margin: "0 0 12px", fontWeight: 700 }}>Objective: Establish Luxor9 as the canonical enterprise orchestration platform before the category is named by someone else.</h2>
              <p style={{ color: "#AAAAAA", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
                A 30-day multi-platform narrative offensive structured across four tactical phases: Ignition → Revelation → Authority → Conversion. Each phase operates as a distinct act in a single, coherent story — the story of what happens when intelligence is finally orchestrated. The campaign does not sell features. It sells the architectural inevitability of Luxor9.
              </p>
            </div>

            {/* Platform overview grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
              {platforms.map(p => (
                <div key={p.id} className="card-hover" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "20px", cursor: "pointer" }} onClick={() => { setActivePlatform(p.id); setActiveTab("platforms"); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <span style={{ fontSize: "24px" }}>{p.icon}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: p.color, background: `${p.color}15`, padding: "3px 8px", borderRadius: "4px" }}>{p.handle}</span>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{p.name}</div>
                  <div style={{ fontSize: "12px", color: DIM }}>Click to view playbook →</div>
                </div>
              ))}
            </div>

            {/* Content Pillars */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "32px", marginBottom: "24px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: ACID, letterSpacing: "0.2em", marginBottom: "24px" }}>CONTENT ARCHITECTURE — 5 PILLARS</div>
              {contentPillars.map((cp, i) => (
                <div key={i} style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "14px" }}>{cp.name}</span>
                      <span style={{ color: DIM, fontSize: "12px", marginLeft: "12px" }}>{cp.desc}</span>
                    </div>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: cp.color, fontWeight: 600 }}>{cp.pct}%</span>
                  </div>
                  <div style={{ height: "4px", background: BORDER, borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${cp.pct}%`, background: cp.color, borderRadius: "2px", transition: "width 0.6s ease" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Phase summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {phases.map(ph => (
                <div key={ph.id} className="card-hover" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "20px", cursor: "pointer", borderTop: `3px solid ${ph.color}` }} onClick={() => { setActivePhase(ph.id); setActiveTab("phases"); }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", color: ph.color, letterSpacing: "0.2em", marginBottom: "8px" }}>PHASE {ph.id} · {ph.days}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 900, color: ph.color, marginBottom: "6px" }}>{ph.name}</div>
                  <div style={{ fontSize: "11px", color: DIM, lineHeight: 1.5 }}>{ph.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PHASES ── */}
        {activeTab === "phases" && (
          <div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
              {phases.map(ph => (
                <button key={ph.id} className="phase-btn" onClick={() => setActivePhase(ph.id)}
                  style={{ padding: "10px 20px", borderRadius: "8px", border: `1px solid ${activePhase === ph.id ? ph.color : BORDER}`, background: activePhase === ph.id ? `${ph.color}15` : CARD, color: activePhase === ph.id ? ph.color : DIM, fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em" }}>
                  PHASE {ph.id}: {ph.name}
                </button>
              ))}
            </div>

            {phases.filter(ph => ph.id === activePhase).map(ph => (
              <div key={ph.id} className="slide-in">
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "32px", marginBottom: "24px", borderLeft: `4px solid ${ph.color}` }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: ph.color, letterSpacing: "0.2em", marginBottom: "8px" }}>{ph.days} · {ph.subtitle}</div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: ph.color, margin: "0 0 16px", fontWeight: 900 }}>{ph.name}</h2>
                  <p style={{ color: "#AAAAAA", fontSize: "14px", lineHeight: 1.8, margin: 0 }}>{ph.desc}</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "28px" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: ph.color, letterSpacing: "0.2em", marginBottom: "20px" }}>CONTENT PILLARS THIS PHASE</div>
                    {ph.pillars.map((p, i) => (
                      <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "14px", alignItems: "flex-start" }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: `${ph.color}20`, border: `1px solid ${ph.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: ph.color, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>{i + 1}</div>
                        <div style={{ fontSize: "13px", color: "#CCCCCC", lineHeight: 1.6 }}>{p}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "28px" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: ph.color, letterSpacing: "0.2em", marginBottom: "20px" }}>POST VOLUME / PLATFORM</div>
                    {Object.entries(ph.posts).map(([plt, count]) => {
                      const pObj = platforms.find(p => p.id === plt);
                      return (
                        <div key={plt} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "16px" }}>{pObj?.icon}</span>
                            <span style={{ fontSize: "13px", color: "#AAAAAA" }}>{pObj?.name}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ display: "flex", gap: "3px" }}>
                              {Array.from({ length: Math.min(count, 10) }).map((_, j) => (
                                <div key={j} style={{ width: "6px", height: "6px", borderRadius: "1px", background: pObj?.color || ph.color, opacity: 0.8 }} />
                              ))}
                            </div>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: pObj?.color || ph.color, fontWeight: 600 }}>{count}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "12px", marginTop: "8px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", color: DIM }}>Phase Total</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: ph.color, fontWeight: 700 }}>{Object.values(ph.posts).reduce((a, b) => a + b, 0)} posts</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PLATFORMS ── */}
        {activeTab === "platforms" && (
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "32px", flexWrap: "wrap" }}>
              {platforms.map(p => (
                <button key={p.id} className="platform-btn" onClick={() => setActivePlatform(p.id)}
                  style={{ padding: "10px 18px", borderRadius: "8px", border: `1px solid ${activePlatform === p.id ? p.color : BORDER}`, background: activePlatform === p.id ? `${p.color}15` : CARD, color: activePlatform === p.id ? p.color : DIM, fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", opacity: activePlatform === p.id ? 1 : 0.7 }}>
                  <span>{p.icon}</span> {p.name}
                </button>
              ))}
            </div>

            {platforms.filter(p => p.id === activePlatform).map(p => {
              const s = platformStrategies[p.id];
              return (
                <div key={p.id} className="slide-in">
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "32px", marginBottom: "24px", borderLeft: `4px solid ${p.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ fontSize: "40px" }}>{p.icon}</span>
                        <div>
                          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", margin: 0, color: p.color }}>{p.name}</h2>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: DIM, marginTop: "4px" }}>{p.handle}</div>
                        </div>
                      </div>
                      <div style={{ background: `${p.color}15`, border: `1px solid ${p.color}30`, borderRadius: "8px", padding: "12px 20px", textAlign: "center" }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: DIM, marginBottom: "4px" }}>FREQUENCY</div>
                        <div style={{ fontSize: "13px", color: p.color, fontWeight: 600 }}>{s.frequency}</div>
                      </div>
                    </div>
                    <div style={{ background: `${p.color}08`, border: `1px solid ${p.color}20`, borderRadius: "8px", padding: "14px", fontSize: "13px", color: "#CCCCCC", lineHeight: 1.7 }}>
                      {s.note}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "24px" }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: p.color, letterSpacing: "0.2em", marginBottom: "16px" }}>CONTENT FORMATS</div>
                      {s.formats.map((f, i) => (
                        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "flex-start" }}>
                          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: p.color, marginTop: "7px", flexShrink: 0 }} />
                          <span style={{ fontSize: "13px", color: "#BBBBBB" }}>{f}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "24px" }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: p.color, letterSpacing: "0.2em", marginBottom: "16px" }}>HOOKS & ANGLES</div>
                      {s.hooks.map((h, i) => (
                        <div key={i} style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "10px 12px", marginBottom: "8px", fontSize: "12px", color: "#AAAAAA", fontStyle: "italic", lineHeight: 1.5 }}>
                          "{h}"
                        </div>
                      ))}
                    </div>

                    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "24px" }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: p.color, letterSpacing: "0.2em", marginBottom: "16px" }}>OPTIMAL POST TIMES</div>
                      <div style={{ background: `${p.color}10`, borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "16px", color: p.color, fontWeight: 600 }}>{s.bestTime}</div>
                      </div>
                      <div style={{ fontSize: "12px", color: DIM, lineHeight: 1.6 }}>
                        Times calibrated for India (IST) primary audience with global secondary reach windows. Adjust for Singapore + UK timezone crossover.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CALENDAR ── */}
        {activeTab === "calendar" && (
          <div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: ACID, letterSpacing: "0.2em", marginBottom: "8px" }}>30-DAY EXECUTION CALENDAR</div>
              <p style={{ color: DIM, fontSize: "13px", margin: 0 }}>Each entry is a primary content action. Secondary posts (Stories, reposts, replies) run in parallel at platform-specific cadence.</p>
            </div>

            {weeklyCalendar.map(week => {
              const ph = phases.find(p => p.id === week.week);
              return (
                <div key={week.week} style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "14px" }}>
                    <div style={{ height: "1px", flex: 1, background: BORDER }} />
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: ph?.color, letterSpacing: "0.15em", whiteSpace: "nowrap" }}>WEEK {week.week} — {week.theme}</div>
                    <div style={{ height: "1px", flex: 1, background: BORDER }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {week.days.map(d => (
                      <div key={d.day} className="card-hover" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "14px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "48px", textAlign: "center", flexShrink: 0 }}>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: DIM }}>DAY</div>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: ph?.color, fontWeight: 900, lineHeight: 1 }}>{d.day}</div>
                        </div>
                        <div style={{ flex: 1, fontSize: "13px", color: "#CCCCCC" }}>{d.content}</div>
                        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                          {d.platform.split(",").map(plt => {
                            const pObj = platforms.find(p => p.id === plt);
                            return pObj ? (
                              <span key={plt} style={{ fontSize: "14px", opacity: 0.8 }} title={pObj.name}>{pObj.icon}</span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── KPIs ── */}
        {activeTab === "kpis" && (
          <div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "32px", marginBottom: "24px", borderLeft: `4px solid ${ACID}` }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: ACID, letterSpacing: "0.2em", marginBottom: "8px" }}>NORTH STAR METRIC</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", margin: "0 0 12px", fontWeight: 700 }}>500–1,000 qualified waitlist signups within 30 days.</h2>
              <p style={{ color: "#AAAAAA", fontSize: "13px", lineHeight: 1.7, margin: 0 }}>Every secondary metric exists in service of this single conversion event. Reach means nothing without pipeline. Followers mean nothing without intent. The campaign is designed to funnel all audience interest toward one irreversible action — joining the waitlist at @Luxor9.Ai.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
              {kpis.map((k, i) => (
                <div key={i} className="card-hover" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "24px" }}>
                  <div style={{ fontSize: "24px", marginBottom: "12px" }}>{k.icon}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", color: DIM, letterSpacing: "0.15em", marginBottom: "6px", textTransform: "uppercase" }}>{k.metric}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: ACID, fontWeight: 900, lineHeight: 1, marginBottom: "6px" }}>{k.target}</div>
                  <div style={{ fontSize: "11px", color: DIM }}>{k.timeframe}</div>
                </div>
              ))}
            </div>

            {/* Weekly milestone table */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "32px", marginBottom: "24px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: ACID, letterSpacing: "0.2em", marginBottom: "24px" }}>WEEKLY MILESTONE GATES</div>
              {[
                { week: "Week 1", gate: "Ignition Complete", targets: ["100+ new Instagram followers", "1 viral LinkedIn post (5,000+ impressions)", "Reddit thread 200+ upvotes", "Brand presence established on all 6 platforms"] },
                { week: "Week 2", gate: "Revelation Active", targets: ["Meta Ads live — 10,000+ impressions", "Feature content generating saves & shares", "Twitter thread 500+ likes", "First 100 waitlist signups"] },
                { week: "Week 3", gate: "Authority Locked", targets: ["250 total waitlist signups", "LinkedIn article 50,000+ impressions", "Reddit AMA 500+ comments/upvotes", "Retargeting audiences built (500+ users)"] },
                { week: "Week 4", gate: "Conversion Surge", targets: ["500–1,000 waitlist signups total", "Cinematic ad 100,000+ combined views", "Instagram follower velocity: +500 in final week", "All Meta budgets at maximum — funnel closed"] },
              ].map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "20px", marginBottom: "20px", paddingBottom: "20px", borderBottom: i < 3 ? `1px solid ${BORDER}` : "none" }}>
                  <div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: phases[i]?.color, marginBottom: "4px" }}>{row.week}</div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{row.gate}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {row.targets.map((t, j) => (
                      <div key={j} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <div style={{ width: "5px", height: "5px", borderRadius: "1px", background: phases[i]?.color, marginTop: "6px", flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "#AAAAAA" }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Budget note */}
            <div style={{ background: CARD, border: `1px solid #FFD70030`, borderRadius: "12px", padding: "24px", borderLeft: "4px solid #FFD700" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#FFD700", letterSpacing: "0.2em", marginBottom: "12px" }}>BUDGET ALLOCATION PRINCIPLE</div>
              <p style={{ color: "#CCCCCC", fontSize: "13px", lineHeight: 1.8, margin: 0 }}>
                Organic-first architecture — 80% of this campaign is zero-cost content strategy. Paid (Meta Ads) activates on Day 13 after organic proof-of-concept is established. Recommended paid budget: ₹15,000–₹40,000 / $200–$500 across 30 days. Concentrate spend on retargeting warm audiences — cold prospecting should represent no more than 40% of paid allocation. Every rupee of paid media should amplify content that already proved itself organically.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: DIM }}>LUXOR9 · 30-DAY EMPIRE CAMPAIGN · INDIA + GLOBAL</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: ACID }}>@Luxor9.Ai · Built for Those Who Build Empires.</div>
      </div>
    </div>
  );
}
