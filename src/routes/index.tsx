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
      { title: "VEKTOR A.I — Automatize. Engaje. Escale." },
      {
        name: "description",
        content:
          "Plataforma enterprise de automação WhatsApp com agentes de IA, CRM, automações inteligentes e white-label. Feita para escalar.",
      },
      { property: "og:title", content: "VEKTOR A.I — Automatize. Engaje. Escale." },
      {
        property: "og:description",
        content: "Plataforma enterprise de automação WhatsApp com agentes de IA, CRM e white-label.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: MessageSquare, title: "WhatsApp em escala", desc: "Caixa de entrada multi-sessão, onboarding via QR Code, reconexão automática e transferência para humano em um único workspace estilo CRM." },
  { icon: Bot, title: "Agentes IA que convertem", desc: "Prompts personalizados, personalidade, memória, fallback e roteamento por canal — compatível com OpenRouter, Gemini e Groq." },
  { icon: Workflow, title: "Automações inteligentes", desc: "Fluxos, follow-ups, campanhas agendadas, gatilhos de cobrança e respostas rápidas rodando sozinhos." },
  { icon: BarChart3, title: "Analytics em tempo real", desc: "Conversão, tempo de resposta, resolução IA vs humano e captação de leads — visualizados em um painel premium." },
  { icon: Shield, title: "Multi-tenant nativo", desc: "Organizações, workspaces, papéis e limites isolados. White-label pronto desde o dia um." },
  { icon: Zap, title: "Infraestrutura enterprise", desc: "Pronta para Docker, orientada a filas e observável. Roda na sua VPS ou escala para milhares de tenants." },
];

const plans = [
  { name: "Starter", price: "R$ 247", desc: "Para times pequenos começando.", features: ["1 número de WhatsApp", "2 agentes IA", "5 mil mensagens/mês", "Suporte por e-mail"] },
  { name: "Pro", price: "R$ 747", desc: "Para operações em crescimento.", features: ["5 números de WhatsApp", "10 agentes IA", "50 mil mensagens/mês", "CRM + automações", "Suporte prioritário"], featured: true },
  { name: "Enterprise", price: "Sob consulta", desc: "Escala ilimitada e white-label.", features: ["Números ilimitados", "Agentes ilimitados", "White-label", "Infra dedicada", "SLA e onboarding"] },
];

const faqs = [
  { q: "A VEKTOR é multi-tenant?", a: "Sim. Cada organização é totalmente isolada — usuários, sessões de WhatsApp, configuração de IA, limites e branding." },
  { q: "Quais provedores de IA são suportados?", a: "OpenRouter, Gemini, Groq e qualquer endpoint compatível com OpenAI. Use suas próprias chaves ou o gateway." },
  { q: "Posso fazer self-host?", a: "Sim. A VEKTOR é Docker-ready, com separação limpa entre frontend, backend, filas e banco de dados." },
  { q: "White-label está incluso?", a: "Sim, no plano Enterprise. Domínio próprio, logo, favicon, cores e tela de login com sua marca." },
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
            <a href="#features" className="hover:text-foreground">Recursos</a>
            <a href="#pricing" className="hover:text-foreground">Planos</a>
            <a href="#faq" className="hover:text-foreground">Dúvidas</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/login">Entrar</Link></Button>
            <Button asChild size="sm" className="bg-[var(--gradient-brand)] text-primary-foreground hover:opacity-90">
              <Link to="/register">Começar agora <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-24 text-center">
        <Badge variant="outline" className="mb-6 gap-1.5 border-accent/30 bg-accent/10 text-accent">
          <Sparkles className="h-3 w-3" /> Plataforma enterprise de WhatsApp + IA
        </Badge>
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Automatize. Engaje. <span className="brand-gradient-text">Escale.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          A VEKTOR A.I é a plataforma enterprise que unifica WhatsApp, agentes de IA, CRM e
          automações — nativa multi-tenant, white-label e pronta para rodar na sua infraestrutura.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="cta-primary h-12 px-8 text-base">
            <Link to="/register">Começar teste grátis <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 border-border/60 bg-card/40 px-8 backdrop-blur">
            <Link to="/login">Entrar</Link>
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
              <span className="ml-3 text-xs text-muted-foreground">vektor.ai / painel</span>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6">
              {[
                { label: "Conversas hoje", value: "12.847", delta: "+18%" },
                { label: "Resolução por IA", value: "92,4%", delta: "+3,1%" },
                { label: "Agentes ativos", value: "37", delta: "+5" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/60 bg-card/60 p-4 text-left">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
                  <p className="mt-1 text-xs text-accent">{s.delta} vs semana anterior</p>
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
            Uma plataforma. <span className="brand-gradient-text">Todos os canais.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tudo o que você precisa para operar atendimento e vendas com IA em escala.
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
            Planos que escalam com você
          </h2>
          <p className="mt-4 text-muted-foreground">Comece grátis. Faça upgrade quando quiser.</p>
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
                  Mais popular
                </Badge>
              )}
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{p.price}</span>
                {p.price !== "Sob consulta" && <span className="text-sm text-muted-foreground">/mês</span>}
              </div>
              <Button asChild className={`mt-6 w-full ${p.featured ? "bg-[var(--gradient-brand)] text-primary-foreground hover:opacity-90" : ""}`} variant={p.featured ? "default" : "outline"}>
                <Link to="/register">Escolher {p.name}</Link>
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
          Perguntas frequentes
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
            Pronto para escalar sua operação?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Coloque a VEKTOR A.I no ar em minutos. Sem cartão de crédito.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 bg-[var(--gradient-brand)] px-8 text-primary-foreground hover:opacity-90">
            <Link to="/register">Começar teste grátis <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <BrandLogo />
          <p>© {new Date().getFullYear()} VEKTOR A.I — Automatize. Engaje. Escale.</p>
        </div>
      </footer>
    </div>
  );
}
