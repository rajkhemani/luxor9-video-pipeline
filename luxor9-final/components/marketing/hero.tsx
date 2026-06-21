"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Layers, Shield, Activity, GitBranch, Cpu, Brain, ArrowRight } from "lucide-react";

const features = [
  {
    icon: GitBranch,
    title: "Hierarchical Orchestration",
    description: "Multi-tier agent hierarchy: Commander → C-Suite → VPs → Managers → Workers. Each level specializes, delegates, and escalates automatically.",
  },
  {
    icon: Layers,
    title: "Specialized Agent Roles",
    description: "scout, mail, social, sales, build, write, chat, data, test, growth — each agent has a defined role, toolset, and communication channel.",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description: "Multi-layer validation, sandboxed execution, audit trails, and automatic failure escalation across the hierarchy.",
  },
  {
    icon: Activity,
    title: "Parallel Execution",
    description: "All agents run simultaneously in coordinated think cycles. Real-time dashboard with second-by-second status updates.",
  },
  {
    icon: Brain,
    title: "Multi-LLM Intelligence",
    description: "Multi-provider fallback with intelligent routing. Strategic agents use stronger models, workers use faster ones.",
  },
  {
    icon: Cpu,
    title: "Autonomous Communication",
    description: "Agents message up, down, and across the hierarchy. Managers reassign failed tasks. VPs rebalance workload automatically.",
  },
];

const steps = [
  {
    number: "01",
    title: "Define Your Objective",
    description: "Tell the Commander what you need. It decomposes your goal into tasks and assigns them across the hierarchy.",
  },
  {
    number: "02",
    title: "Agents Execute in Parallel",
    description: "Specialized agents work simultaneously — each within their role, each communicating with their team. Managers coordinate, workers execute.",
  },
  {
    number: "03",
    title: "Monitor & Optimize",
    description: "Watch real-time agent activity. Failed tasks auto-escalate. The hierarchy self-heals. You focus on the next objective.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    description: "For developers exploring multi-agent systems",
    price: 29,
    features: [
      "Limited Agent Team",
      "Core Agent Roles",
      "Basic Dashboard",
      "Community Support",
      "API Access",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Team",
    description: "For small teams building with agents",
    price: 99,
    features: [
      "Expanded Agent Team",
      "All Agent Roles",
      "Advanced Dashboard",
      "Priority Support",
      "Full API Access",
      "Custom Integrations",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For organizations at scale",
    price: 299,
    features: [
      "Full Agent Hierarchy",
      "Custom Agent Creation",
      "Real-time Analytics",
      "Dedicated Support",
      "SLA Guarantee",
      "On-premise Option",
      "Custom Development",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-dark-bg">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">Now in Public Beta</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-display sm:text-h1 lg:text-display font-heading font-extrabold tracking-tight mb-6">
            <span className="text-white">Deploy an </span>
            <span className="gradient-text-primary">AI Team</span>
            <span className="text-white">, Not Just an Agent</span>
          </h1>
          <p className="text-body-lg lg:text-h4 text-dark-muted max-w-3xl mx-auto mb-8">
            179 agents. 5 tiers. One hierarchy. They work together.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <button className="inline-flex items-center justify-center gap-2 h-12 px-6 text-base font-semibold rounded-lg bg-primary text-dark-bg hover:bg-primary-400 shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all duration-300 hover:scale-105">
            Deploy Your Agents
            <ArrowRight className="h-5 w-5" />
          </button>
          <button className="inline-flex items-center justify-center gap-2 h-12 px-6 text-base font-semibold rounded-lg border border-dark-border text-white hover:bg-dark-surface transition-all duration-300">
            See the Hierarchy
          </button>
        </motion.div>



        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent z-10 pointer-events-none" />
          <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-border bg-dark-elevated">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-accent-error/80" />
                <div className="w-3 h-3 rounded-full bg-accent-warning/80" />
                <div className="w-3 h-3 rounded-full bg-accent-success/80" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-dark-muted font-mono">luxor9.app/orchestrator</span>
              </div>
            </div>
            <div className="p-6 bg-dark-bg min-h-[400px]">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="col-span-2 bg-dark-surface rounded-lg p-4 border border-dark-border">
                  <div className="text-xs text-dark-muted mb-2">TASKS COMPLETED TODAY</div>
                  <div className="text-h2 font-bold text-accent-success">1,247</div>
                  <div className="text-xs text-accent-success mt-1">+12.4% from yesterday</div>
                </div>
                <div className="bg-dark-surface rounded-lg p-4 border border-dark-border">
                  <div className="text-xs text-dark-muted mb-2">ACTIVE AGENTS</div>
                  <div className="text-h2 font-bold text-primary">All Online</div>
                  <div className="text-xs text-primary mt-1">All systems nominal</div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[
                  { label: "Commander", color: "bg-primary" },
                  { label: "C-Suite", color: "bg-secondary" },
                  { label: "VPs", color: "bg-accent-info" },
                  { label: "Managers", color: "bg-accent-success" },
                  { label: "Workers", color: "bg-dark-muted" },
                ].map((tier) => (
                  <div key={tier.label} className="text-center">
                    <div className="text-xs text-dark-muted mb-1 font-mono">{tier.label}</div>
                    <div className={`aspect-square rounded ${tier.color}`} style={{ opacity: 0.8 }} />
                    <div className="text-xs text-dark-muted mt-1">Active</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-dark-muted text-center">
                All tiers operational — agents working in parallel
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export { features, steps, pricingPlans };
