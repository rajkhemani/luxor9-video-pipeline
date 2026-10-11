import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, Zap, Layers, Shield, Globe, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Multi-Model Intelligence',
    description: 'Smart router picks the optimal model per request — Seedance 2.0 for cinematic, Soul for characters, Kling for budget.',
  },
  {
    icon: Layers,
    title: 'Production Pipelines',
    description: 'Not just generation — script → scene → asset → edit → compose → publish. 13 specialized pipelines.',
  },
  {
    icon: Sparkles,
    title: 'Character Consistency',
    description: 'Soul ID + Pose Library + Reference chaining = recurring characters that actually work.',
  },
  {
    icon: Globe,
    title: 'Auto-Distribution',
    description: 'One render → 7 platforms (YouTube, TikTok, Instagram, LinkedIn, X, Threads, Shorts), optimized each.',
  },
  {
    icon: Shield,
    title: 'Brand System Native',
    description: 'Visual styles apply automatically to every generation. Extract from website/PDF/Figma.',
  },
  {
    icon: ArrowRight,
    title: 'Developer-First API',
    description: 'MCP server + REST + Webhooks. Embed video generation in your app in minutes.',
  },
];

const models = [
  { name: 'Seedance 2.0', bestFor: 'Cinematic, multi-shot, synced audio', cost: '$0.80/clip' },
  { name: 'Seedance 2.0 Fast', bestFor: 'Social shorts, rapid iteration', cost: '$0.50/clip' },
  { name: 'Soul Cinema', bestFor: 'Character consistency, recurring actors', cost: '$1.20/clip' },
  { name: 'Kling 3.0', bestFor: 'Budget projects, high volume', cost: '$0.10/clip' },
  { name: 'Veo 3.1 / Sora 2', bestFor: 'Maximum quality, hero shots', cost: '$0.50/clip' },
  { name: 'WAN 2.5', bestFor: 'Open-source alternative', cost: '$0.10/clip' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now powered by Higgsfield Cloud — 6 models, one API
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance mb-6 animate-slide-up">
              One Subscription.{' '}
              <span className="text-primary">Every Premium Model.</span>{' '}
              Production Done.
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Higgsfield Studio routes every prompt to the optimal model — Seedance for cinematic, Soul for characters, Kling for budget.
              Plus: production pipelines, brand consistency, character memory, and auto-publish to 7 platforms.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link href="/auth/register">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Start Free — 50 Credits
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Documentation
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '300ms' }}>
              No credit card required · 50 free credits · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-primary">6</div>
              <div className="text-sm text-muted-foreground">Premium Models</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-primary">13</div>
              <div className="text-sm text-muted-foreground">Production Pipelines</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground">Auto-Publish Platforms</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-primary">$0</div>
              <div className="text-sm text-muted-foreground">Infrastructure Cost (Free Tier)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Model Comparison */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Every Model. One Smart Router.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't choose models. Let our router pick the optimal one for your prompt, budget, and quality needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <Card key={model.name} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                  <CardDescription>{model.bestFor}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{model.cost}</span>
                  <span className="text-sm text-muted-foreground">per 5s clip</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Built for Production, Not Just Demos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature exists because real video production needs it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors h-full">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pipelines */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              13 Specialized Pipelines
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each pipeline handles the full production flow: research → script → assets → edit → compose → publish.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Cinematic', icon: '🎬', desc: 'Trailers, teasers, mood films' },
              { name: 'Avatar Spokesperson', icon: '🎭', desc: 'Lip-sync presenters' },
              { name: 'Social Creative', icon: '📱', desc: '7 platform variants from 1 brief' },
              { name: 'Animated Explainer', icon: '✨', desc: '3Blue1Brown-style education' },
              { name: 'Talking Head', icon: '🎤', desc: 'Footage-based speakers' },
              { name: 'Screen Demo', icon: '💻', desc: 'Synthetic terminal recordings' },
              { name: 'Character Animation', icon: '🎨', desc: 'SVG rigs + pose libraries' },
              { name: 'Localization/Dub', icon: '🌍', desc: '30+ languages, lip-sync' },
            ].map((pipeline, i) => (
              <Card key={i} className="border-border/50 hover:border-primary/50 transition-colors p-6">
                <div className="text-3xl mb-2">{pipeline.icon}</div>
                <h3 className="font-semibold mb-1">{pipeline.name}</h3>
                <p className="text-sm text-muted-foreground">{pipeline.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
            Ready to Produce at Scale?
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Join creators and agencies producing 100+ videos/month on Higgsfield Studio.
            Start free with 50 credits — no credit card required.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-4">
              Get 50 Free Credits
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">OpenMontage</h3>
              <p className="text-sm text-muted-foreground">
                The first AI-native video production platform. Prompt to publish in minutes, not days.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/pipelines" className="hover:text-foreground">Pipelines</Link></li>
                <li><Link href="/templates" className="hover:text-foreground">Templates</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Models</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Seedance 2.0</li>
                <li>Soul Cinema</li>
                <li>Kling 3.0</li>
                <li>Veo 3.1 / Sora 2</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © 2024 OpenMontage. Built with Higgsfield Cloud.
          </div>
        </div>
      </footer>
    </div>
  );
}