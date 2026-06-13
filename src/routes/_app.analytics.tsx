import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart3,
  MessageSquare,
  Bot,
  Users,
  CreditCard,
  Tv,
  Workflow,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — VEKTOR A.I" }] }),
  component: AnalyticsPage,
});

// ---- mock data (matches backend shape) ----
function mockDays(n: number) {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const MOCK = {
  kpis: {
    mensagensTotal: 18420,
    taxaResolucaoIA: 0.78,
    taxaHandoffHumano: 0.22,
    conversaoLeads: 0.34,
    receitaMensal: 48230.5,
    cobrancasVencidas: 12,
    renovacoesIptv: 87,
    sessoesWhatsappAtivas: 4,
    sucessoAutomacoes: 0.92,
  },
  messagesPerDay: mockDays(30).map((date, i) => ({
    date,
    enviadas: 180 + Math.round(Math.sin(i / 3) * 60 + i * 4),
    recebidas: 150 + Math.round(Math.cos(i / 3) * 50 + i * 3),
  })),
  leadsBySource: [
    { source: "WhatsApp", value: 412 },
    { source: "Instagram", value: 198 },
    { source: "Site", value: 156 },
    { source: "Indicação", value: 89 },
    { source: "Outros", value: 44 },
  ],
  funnel: [
    { stage: "Novo", value: 820 },
    { stage: "Qualificado", value: 540 },
    { stage: "Proposta", value: 310 },
    { stage: "Negociação", value: 180 },
    { stage: "Fechado", value: 124 },
  ],
  revenueMonthly: [
    { month: "Jan", value: 28100 },
    { month: "Fev", value: 31200 },
    { month: "Mar", value: 33980 },
    { month: "Abr", value: 36500 },
    { month: "Mai", value: 41250 },
    { month: "Jun", value: 48230 },
  ],
  overdueBilling: mockDays(14).map((date, i) => ({
    date,
    value: 2 + ((i * 3) % 7),
  })),
  iptvRenewals: mockDays(14).map((date, i) => ({
    date,
    renovados: 5 + ((i * 2) % 9),
    vencidos: ((i * 3) % 5),
  })),
  agentPerformance: [
    { name: "Ana Souza", atendimentos: 184, resolucao: 0.91 },
    { name: "Bruno Lima", atendimentos: 142, resolucao: 0.84 },
    { name: "Carla Dias", atendimentos: 121, resolucao: 0.79 },
    { name: "Diego Reis", atendimentos: 98, resolucao: 0.73 },
  ],
  poolPerformance: [
    { name: "Comercial", conversas: 432, sucesso: 0.88 },
    { name: "Suporte", conversas: 318, sucesso: 0.82 },
    { name: "Cobrança", conversas: 256, sucesso: 0.76 },
  ],
  aiProviderUsage: [
    { provider: "OpenAI", tokens: 1240000, cost: 312.4 },
    { provider: "Anthropic", tokens: 820000, cost: 245.1 },
    { provider: "Gemini", tokens: 410000, cost: 98.7 },
    { provider: "Groq", tokens: 220000, cost: 18.2 },
  ],
  whatsappSessions: [
    { name: "Comercial-01", status: "online", uptime: 0.998 },
    { name: "Suporte-01", status: "online", uptime: 0.991 },
    { name: "Cobrança-01", status: "degraded", uptime: 0.872 },
    { name: "Vendas-02", status: "offline", uptime: 0.0 },
  ],
};

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
const fmtNum = (n: number) => n.toLocaleString("pt-BR");
const fmtShortDate = (s: string) => {
  const d = new Date(s);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
};

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
}) {
  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
            {delta && (
              <p
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs",
                  trend === "up" ? "text-emerald-400" : "text-rose-400",
                )}
              >
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {delta}
              </p>
            )}
          </div>
          <div className="rounded-lg border border-border/60 bg-background/40 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/60 bg-card/40 backdrop-blur", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [session, setSession] = useState("all");
  const [pool, setPool] = useState("all");
  const data = MOCK;

  const kpis = useMemo(
    () => [
      {
        icon: MessageSquare,
        label: "Mensagens (30d)",
        value: fmtNum(data.kpis.mensagensTotal),
        delta: "+12,4% vs período anterior",
        trend: "up" as const,
      },
      {
        icon: Bot,
        label: "Resolução IA",
        value: fmtPct(data.kpis.taxaResolucaoIA),
        delta: "+3,1 pp",
        trend: "up" as const,
      },
      {
        icon: Users,
        label: "Conversão de leads",
        value: fmtPct(data.kpis.conversaoLeads),
        delta: "+1,8 pp",
        trend: "up" as const,
      },
      {
        icon: CreditCard,
        label: "Receita mensal",
        value: fmtBRL(data.kpis.receitaMensal),
        delta: "+16,9%",
        trend: "up" as const,
      },
      {
        icon: Activity,
        label: "Handoff humano",
        value: fmtPct(data.kpis.taxaHandoffHumano),
        delta: "-2,3 pp",
        trend: "down" as const,
      },
      {
        icon: CreditCard,
        label: "Cobranças vencidas",
        value: fmtNum(data.kpis.cobrancasVencidas),
        delta: "-4 vs semana anterior",
        trend: "down" as const,
      },
      {
        icon: Tv,
        label: "Renovações IPTV",
        value: fmtNum(data.kpis.renovacoesIptv),
        delta: "+9 essa semana",
        trend: "up" as const,
      },
      {
        icon: Workflow,
        label: "Automações OK",
        value: fmtPct(data.kpis.sucessoAutomacoes),
        delta: "+0,8 pp",
        trend: "up" as const,
      },
    ],
    [data],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" /> Analytics
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Visão analítica da operação
          </h1>
          <p className="text-sm text-muted-foreground">
            Métricas em tempo real de WhatsApp, IA, CRM, financeiro e IPTV.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="ytd">Ano atual</SelectItem>
            </SelectContent>
          </Select>
          <Select value={session} onValueChange={setSession}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sessão WhatsApp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as sessões</SelectItem>
              {data.whatsappSessions.map((s) => (
                <SelectItem key={s.name} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={pool} onValueChange={setPool}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Pool IA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os pools</SelectItem>
              {data.poolPerformance.map((p) => (
                <SelectItem key={p.name} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="ia">IA</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="iptv">IPTV</TabsTrigger>
          <TabsTrigger value="auto">Automações</TabsTrigger>
        </TabsList>

        {/* Visão geral */}
        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-2">
          <ChartCard title="Mensagens por dia" description="Enviadas vs recebidas">
            <AreaChart data={data.messagesPerDay}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={fmtShortDate}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={fmtShortDate} />
              <Area
                type="monotone"
                dataKey="enviadas"
                stroke="#3b82f6"
                fill="url(#g1)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="recebidas"
                stroke="#8b5cf6"
                fill="url(#g2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartCard>

          <ChartCard title="Leads por origem">
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie
                data={data.leadsBySource}
                dataKey="value"
                nameKey="source"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.leadsBySource.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartCard>

          <ChartCard title="Receita mensal" description="Últimos 6 meses">
            <LineChart data={data.revenueMonthly}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => fmtBRL(v)}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartCard>

          <ChartCard title="Conversão por etapa">
            <BarChart data={data.funnel} layout="vertical">
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis
                type="category"
                dataKey="stage"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                width={90}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartCard>
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp" className="mt-4 grid gap-4 lg:grid-cols-2">
          <ChartCard title="Volume de mensagens" className="lg:col-span-2">
            <BarChart data={data.messagesPerDay}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={fmtShortDate} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={fmtShortDate} />
              <Bar dataKey="enviadas" stackId="a" fill="#3b82f6" />
              <Bar dataKey="recebidas" stackId="a" fill="#8b5cf6" />
            </BarChart>
          </ChartCard>
          <Card className="border-border/60 bg-card/40 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Saúde das sessões</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {data.whatsappSessions.map((s) => (
                <div
                  key={s.name}
                  className="rounded-lg border border-border/60 bg-background/40 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{s.name}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        s.status === "online" && "border-emerald-500/50 text-emerald-400",
                        s.status === "degraded" && "border-amber-500/50 text-amber-400",
                        s.status === "offline" && "border-rose-500/50 text-rose-400",
                      )}
                    >
                      {s.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {fmtPct(s.uptime)}
                  </p>
                  <p className="text-xs text-muted-foreground">Uptime 30d</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA */}
        <TabsContent value="ia" className="mt-4 grid gap-4 lg:grid-cols-2">
          <ChartCard title="Uso por provedor IA" description="Tokens consumidos">
            <BarChart data={data.aiProviderUsage}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="provider" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNum(v)} />
              <Bar dataKey="tokens" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
          <ChartCard title="Custo por provedor IA" description="USD no período">
            <BarChart data={data.aiProviderUsage}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="provider" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}`} />
              <Bar dataKey="cost" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
          <Card className="border-border/60 bg-card/40 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Desempenho dos pools</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {data.poolPerformance.map((p) => (
                <div
                  key={p.name}
                  className="rounded-lg border border-border/60 bg-background/40 p-4"
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {fmtNum(p.conversas)} conversas
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-400">
                    {fmtPct(p.sucesso)}
                  </p>
                  <p className="text-xs text-muted-foreground">Taxa de sucesso</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CRM */}
        <TabsContent value="crm" className="mt-4 grid gap-4 lg:grid-cols-2">
          <ChartCard title="Funil de conversão">
            <BarChart data={data.funnel} layout="vertical">
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis
                type="category"
                dataKey="stage"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                width={90}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartCard>
          <ChartCard title="Leads por origem">
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie
                data={data.leadsBySource}
                dataKey="value"
                nameKey="source"
                outerRadius={100}
              >
                {data.leadsBySource.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartCard>
          <Card className="border-border/60 bg-card/40 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Desempenho por agente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.agentPerformance.map((a) => (
                  <div
                    key={a.name}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3"
                  >
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {fmtNum(a.atendimentos)} atendimentos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-emerald-400">
                        {fmtPct(a.resolucao)}
                      </p>
                      <p className="text-xs text-muted-foreground">resolução</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="financeiro" className="mt-4 grid gap-4 lg:grid-cols-2">
          <ChartCard title="Receita mensal">
            <AreaChart data={data.revenueMonthly}>
              <defs>
                <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtBRL(v)} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                fill="url(#gr)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartCard>
          <ChartCard title="Cobranças vencidas (14d)">
            <BarChart data={data.overdueBilling}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={fmtShortDate}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={fmtShortDate} />
              <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
        </TabsContent>

        {/* IPTV */}
        <TabsContent value="iptv" className="mt-4 grid gap-4">
          <ChartCard title="Renovações IPTV (14d)" description="Renovados vs vencidos">
            <BarChart data={data.iptvRenewals}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={fmtShortDate}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={fmtShortDate} />
              <Bar dataKey="renovados" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vencidos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
        </TabsContent>

        {/* Automações */}
        <TabsContent value="auto" className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card className="border-border/60 bg-card/40 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Taxa de sucesso das automações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-6">
                <p className="text-5xl font-semibold tracking-tight text-emerald-400">
                  {fmtPct(data.kpis.sucessoAutomacoes)}
                </p>
                <p className="pb-2 text-sm text-muted-foreground">
                  4.218 execuções nos últimos 30 dias · 342 falhas tratadas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
