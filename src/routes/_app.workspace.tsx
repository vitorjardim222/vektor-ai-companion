import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Users,
  Bot,
  Plug,
  Shield,
  Sparkles,
  CreditCard,
  Bell,
  Palette,
  ArrowRight,
  CircleDot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — VEKTOR A.I" },
      { name: "description", content: "Visão geral do workspace: branding, equipe, integrações, IA e segurança." },
    ],
  }),
  component: WorkspacePage,
});

const SECTIONS = [
  { title: "Empresa", icon: Building2, desc: "Nome, CNPJ, idioma, fuso e moeda.", tab: "workspace", status: "Configurado" },
  { title: "Branding", icon: Palette, desc: "Cores, logos e identidade visual.", tab: "branding", status: "Configurado" },
  { title: "Equipe", icon: Users, desc: "5 membros · 3 online agora.", tab: "team", status: "Ativo" },
  { title: "Permissões", icon: Shield, desc: "Matriz de papéis e acessos.", tab: "roles", status: "Configurado" },
  { title: "Notificações", icon: Bell, desc: "Alertas de IA, leads e cobrança.", tab: "notifications", status: "Ativo" },
  { title: "Integrações", icon: Plug, desc: "Evolution, Mercado Pago, Supabase…", tab: "integrations", status: "8 integrações" },
  { title: "Provedores IA", icon: Bot, desc: "OpenRouter, OpenAI, Gemini, Claude…", tab: "ai", status: "5 ativos" },
  { title: "Billing", icon: CreditCard, desc: "Plano Business · R$ 497/mês.", tab: "billing", status: "Em dia" },
  { title: "Segurança", icon: Shield, desc: "2FA, sessões, IPs e dispositivos.", tab: "security", status: "Reforçada" },
  { title: "White Label", icon: Sparkles, desc: "Domínio, marca, tema e rodapé.", tab: "whitelabel", status: "Disponível" },
];

function WorkspacePage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visão consolidada do seu workspace VEKTOR A.I.
          </p>
        </div>
        <Link to="/settings">
          <Button className="cta-primary">
            Abrir configurações <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent">
        <CardContent className="flex flex-wrap items-center justify-between gap-6 p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <Sparkles className="h-7 w-7 text-cyan-300" />
            </div>
            <div>
              <div className="text-lg font-semibold">VEKTOR A.I</div>
              <div className="text-xs text-muted-foreground">contato@vektor.ai · São Paulo, BR</div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-400/30 bg-emerald-500/10 text-[10px] text-emerald-300">
                  <CircleDot className="mr-1 h-2.5 w-2.5" /> Workspace ativo
                </Badge>
                <Badge variant="outline" className="border-white/10 bg-white/5 text-[10px]">Plano Business</Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <Stat label="Membros" value="5" />
            <Stat label="Sessões WhatsApp" value="3" />
            <Stat label="Agentes IA" value="8" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link key={s.title} to="/settings" className="group">
            <Card className="h-full border-white/10 transition hover:border-cyan-400/30 hover:bg-white/[0.02]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                    <s.icon className="h-4 w-4 text-cyan-300" />
                  </div>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-[10px]">{s.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base">{s.title}</CardTitle>
                <CardDescription className="mt-1 text-xs">{s.desc}</CardDescription>
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-300 opacity-0 transition group-hover:opacity-100">
                  Gerenciar <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
