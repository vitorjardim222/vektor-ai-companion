import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  Workflow,
  BarChart3,
  Shield,
  Sparkles,
  Check,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VEKTOR A.I — Automate. Engage. Scale." },
      {
        name: "description",
        content:
          "Enterprise WhatsApp automation with AI agents, CRM, intelligent automations and white-label. Built for scale.",
      },
      { property: "og:title", content: "VEKTOR A.I — Automate. Engage. Scale." },
      {
        property: "og:description",
        content: "Enterprise WhatsApp automation with AI agents, CRM and white-label.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: MessageSquare, title: "WhatsApp at scale", desc: "Multi-session inbox, QR onboarding, auto-reconnect and human handoff in one CRM-style workspace." },
  { icon: Bot, title: "AI agents that convert", desc: "Custom prompts, personality, memory, fallback and channel routing — compatible with OpenRouter, Gemini and Groq." },
  { icon: Workflow, title: "Intelligent automations", desc: "Flows, follow-ups, scheduled campaigns, billing triggers and rapid replies that run themselves." },
  { icon: BarChart3, title: "Realtime analytics", desc: "Conversion, response time, AI vs human resolution and lead capture — visualized in a premium dashboard." },
  { icon: Shield, title: "Multi-tenant by design", desc: "Isolated organizations, workspaces, roles and limits. White-label ready from day one." },
  { icon: Zap, title: "Enterprise infrastructure", desc: "Docker-ready, queue-driven, observable. Built to run on your VPS or scale to thousands of tenants." },
];

const plans = [
  { name: "Starter", price: "$49", desc: "For small teams getting started.", features: ["1 WhatsApp number", "2 AI agents", "5k messages/mo", "Email support"] },
  { name: "Pro", price: "$149", desc: "For growing operations.", features: ["5 WhatsApp numbers", "10 AI agents", "50k messages/mo", "CRM + automations", "Priority support"], featured: true },
  { name: "Enterprise", price: "Custom", desc: "Unlimited scale, white-label.", features: ["Unlimited numbers", "Unlimited agents", "White-label", "Dedicated infra", "SLA & onboarding"] },
];

const faqs = [
  { q: "Is VEKTOR multi-tenant?", a: "Yes. Every organization is fully isolated — users, WhatsApp sessions, AI configuration, limits and branding." },
  { q: "Which AI providers are supported?", a: "OpenRouter, Gemini, Groq and any OpenAI-compatible endpoint. Bring your own keys or use the gateway." },
  { q: "Can I self-host?", a: "Yes. VEKTOR ships Docker-ready with a clean separation between frontend, backend, queues and database." },
  { q: "Is white-label included?", a: "On Enterprise. Custom domain, logo, favicon, colors and branded login." },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[600px]" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <BrandLogo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
            <Button asChild size="sm" className="bg-[var(--gradient-brand)] text-primary-foreground hover:opacity-90">
              <Link to="/register">Get started <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-24 text-center">
        <Badge variant="outline" className="mb-6 gap-1.5 border-accent/30 bg-accent/10 text-accent">
          <Sparkles className="h-3 w-3" /> Enterprise WhatsApp + AI platform
        </Badge>
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Automate. Engage. <span className="brand-gradient-text">Scale.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          VEKTOR A.I is the enterprise-grade platform that unifies WhatsApp, AI agents, CRM and
          automations — built multi-tenant, white-label and ready to run on your infrastructure.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-12 bg-[var(--gradient-brand)] px-8 text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)]">
            <Link to="/register">Start free trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 border-border/60 bg-card/40 px-8 backdrop-blur">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>

        {/* Hero card preview */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="absolute -inset-4 rounded-3xl bg-[var(--gradient-brand)] opacity-20 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-border glass-panel shadow-[var(--shadow-elevated)]">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
              <span className="ml-3 text-xs text-muted-foreground">vektor.ai / dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6">
              {[
                { label: "Conversations today", value: "12,847", delta: "+18%" },
                { label: "AI resolution rate", value: "92.4%", delta: "+3.1%" },
                { label: "Active agents", value: "37", delta: "+5" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/60 bg-card/60 p-4 text-left">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
                  <p className="mt-1 text-xs text-accent">{s.delta} vs last week</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            One platform. <span className="brand-gradient-text">Every channel.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to operate AI-driven customer engagement at scale.
          </p>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group relative overflow-hidden rounded-2xl border border-border glass-panel p-6 transition hover:border-primary/40">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Pricing that scales with you
          </h2>
          <p className="mt-4 text-muted-foreground">Start free. Upgrade when you're ready.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-8 ${
                p.featured
                  ? "border-primary/60 bg-card shadow-[var(--shadow-glow)]"
                  : "border-border glass-panel"
              }`}
            >
              {p.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--gradient-brand)] text-primary-foreground">
                  Most popular
                </Badge>
              )}
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{p.price}</span>
                {p.price !== "Custom" && <span className="text-sm text-muted-foreground">/mo</span>}
              </div>
              <Button asChild className={`mt-6 w-full ${p.featured ? "bg-[var(--gradient-brand)] text-primary-foreground hover:opacity-90" : ""}`} variant={p.featured ? "default" : "outline"}>
                <Link to="/register">Choose {p.name}</Link>
              </Button>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="text-center font-display text-4xl font-bold tracking-tight md:text-5xl">
          Frequently asked
        </h2>
        <div className="mt-12 space-y-3">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-xl border border-border glass-panel p-6">
              <h4 className="font-display font-semibold">{f.q}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border glass-panel p-12 text-center">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Ready to scale your operation?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Launch VEKTOR A.I in minutes. No credit card required.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 bg-[var(--gradient-brand)] px-8 text-primary-foreground hover:opacity-90">
            <Link to="/register">Start free trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <BrandLogo />
          <p>© {new Date().getFullYear()} VEKTOR A.I — Automate. Engage. Scale.</p>
        </div>
      </footer>
    </div>
  );
}
