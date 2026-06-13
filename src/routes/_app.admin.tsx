import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Building2,
  Users,
  Bot,
  Smartphone,
  DollarSign,
  Activity,
  AlertTriangle,
  Webhook,
  ListChecks,
  Server,
  Search,
  MoreHorizontal,
  Ban,
  CheckCircle2,
  LogIn,
  Plus,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({
    meta: [
      { title: "Super Admin — VEKTOR A.I" },
      {
        name: "description",
        content:
          "Painel master: tenants, planos, consumo, receita, logs e saúde da plataforma.",
      },
    ],
  }),
  component: AdminPage,
});

type Plan = "Starter" | "Pro" | "Enterprise" | "Custom";
type TenantStatus = "ativo" | "bloqueado" | "trial" | "inadimplente";

interface Tenant {
  id: string;
  company: string;
  owner: string;
  email: string;
  plan: Plan;
  status: TenantStatus;
  sessions: number;
  agents: number;
  messages: number;
  tokens: number;
  revenue: number;
  createdAt: string;
}

const TENANTS: Tenant[] = [
  { id: "t1", company: "Clínica Vitalis", owner: "Dra. Marina Souza", email: "marina@vitalis.com.br", plan: "Pro", status: "ativo", sessions: 3, agents: 6, messages: 48210, tokens: 12_400_000, revenue: 497, createdAt: "12/03/2025" },
  { id: "t2", company: "AutoPeças Diamante", owner: "Carlos Mendes", email: "carlos@diamante.com.br", plan: "Enterprise", status: "ativo", sessions: 8, agents: 14, messages: 192_540, tokens: 58_900_000, revenue: 2497, createdAt: "02/11/2024" },
  { id: "t3", company: "Studio Bella", owner: "Bianca Reis", email: "bianca@studiobella.com", plan: "Starter", status: "trial", sessions: 1, agents: 2, messages: 1240, tokens: 320_000, revenue: 0, createdAt: "01/06/2026" },
  { id: "t4", company: "Imobiliária Prime", owner: "Ricardo Alves", email: "ricardo@prime.com.br", plan: "Pro", status: "inadimplente", sessions: 2, agents: 4, messages: 12_400, tokens: 3_200_000, revenue: 497, createdAt: "20/01/2025" },
  { id: "t5", company: "EcoMarket BR", owner: "Patrícia Lima", email: "patricia@ecomarket.com.br", plan: "Custom", status: "ativo", sessions: 12, agents: 22, messages: 410_900, tokens: 124_000_000, revenue: 4890, createdAt: "08/08/2024" },
  { id: "t6", company: "Academia Pulse", owner: "João Vitor", email: "joao@pulse.fit", plan: "Starter", status: "bloqueado", sessions: 1, agents: 1, messages: 320, tokens: 80_000, revenue: 0, createdAt: "15/05/2026" },
];

const STATUS_META: Record<TenantStatus, { label: string; cls: string }> = {
  ativo: { label: "Ativo", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  trial: { label: "Trial", cls: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  inadimplente: { label: "Inadimplente", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  bloqueado: { label: "Bloqueado", cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

const PLAN_META: Record<Plan, { label: string; cls: string }> = {
  Starter: { label: "Starter", cls: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
  Pro: { label: "Pro", cls: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  Enterprise: { label: "Enterprise", cls: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" },
  Custom: { label: "Custom", cls: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
};

const PLANS = [
  { name: "Starter", price: 197, whatsapp: 1, agents: 3, messages: "10k", users: 3, whiteLabel: false, api: false },
  { name: "Pro", price: 497, whatsapp: 3, agents: 10, messages: "50k", users: 10, whiteLabel: false, api: true },
  { name: "Enterprise", price: 2497, whatsapp: 10, agents: 30, messages: "500k", users: 50, whiteLabel: true, api: true },
  { name: "Custom", price: null, whatsapp: 999, agents: 999, messages: "ilimitado", users: 999, whiteLabel: true, api: true },
];

const ERROR_LOGS = [
  { time: "13/06 14:22", tenant: "AutoPeças Diamante", level: "error", msg: "Evolution API timeout em sessão wpp_03" },
  { time: "13/06 13:58", tenant: "Imobiliária Prime", level: "warn", msg: "Rate limit OpenRouter atingido" },
  { time: "13/06 12:41", tenant: "Clínica Vitalis", level: "error", msg: "Falha ao salvar webhook payload (500)" },
  { time: "13/06 11:10", tenant: "EcoMarket BR", level: "warn", msg: "Token cost > limite diário (R$ 80)" },
  { time: "13/06 09:33", tenant: "Studio Bella", level: "info", msg: "Trial expirando em 3 dias" },
];

const WEBHOOK_LOGS = [
  { time: "13/06 14:25", provider: "Mercado Pago", event: "payment.approved", status: 200 },
  { time: "13/06 14:24", provider: "Evolution", event: "messages.upsert", status: 200 },
  { time: "13/06 14:22", provider: "Asaas", event: "PAYMENT_OVERDUE", status: 200 },
  { time: "13/06 14:18", provider: "Evolution", event: "connection.update", status: 500 },
  { time: "13/06 14:10", provider: "Stripe", event: "invoice.paid", status: 200 },
];

const QUEUES = [
  { name: "whatsapp:outbound", pending: 42, processing: 6, failed: 1 },
  { name: "ai:generation", pending: 18, processing: 4, failed: 0 },
  { name: "billing:reminders", pending: 7, processing: 1, failed: 0 },
  { name: "webhooks:dispatch", pending: 3, processing: 0, failed: 2 },
];

const PROVIDERS = [
  { name: "OpenRouter", used: 68, cost: 1240, limit: 2000 },
  { name: "OpenAI", used: 42, cost: 890, limit: 1500 },
  { name: "Gemini", used: 28, cost: 310, limit: 1000 },
  { name: "Anthropic", used: 19, cost: 420, limit: 1000 },
  { name: "Evolution API", used: 81, cost: 0, limit: 100 },
];

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtNum = (v: number) => v.toLocaleString("pt-BR");

function AdminPage() {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Tenant | null>(null);

  const filtered = useMemo(
    () =>
      TENANTS.filter((t) => {
        const q = query.toLowerCase().trim();
        const matchQ =
          !q ||
          t.company.toLowerCase().includes(q) ||
          t.owner.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q);
        const matchP = planFilter === "all" || t.plan === planFilter;
        const matchS = statusFilter === "all" || t.status === statusFilter;
        return matchQ && matchP && matchS;
      }),
    [query, planFilter, statusFilter],
  );

  const totals = useMemo(() => {
    const mrr = TENANTS.reduce((s, t) => s + t.revenue, 0);
    const msgs = TENANTS.reduce((s, t) => s + t.messages, 0);
    const sessions = TENANTS.reduce((s, t) => s + t.sessions, 0);
    const active = TENANTS.filter((t) => t.status === "ativo").length;
    return { mrr, msgs, sessions, active };
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Master Admin
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Painel global da plataforma</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie tenants, planos, consumo, receita e saúde do VEKTOR A.I.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" /> Status público
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Novo tenant
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Building2} label="Tenants ativos" value={`${totals.active}/${TENANTS.length}`} hint="Empresas operando agora" />
        <StatCard icon={DollarSign} label="MRR consolidado" value={fmtBRL(totals.mrr)} hint="+12,4% vs. mês anterior" tone="success" />
        <StatCard icon={Smartphone} label="Sessões WhatsApp" value={fmtNum(totals.sessions)} hint="Conectadas em todos os tenants" />
        <StatCard icon={TrendingUp} label="Mensagens / mês" value={fmtNum(totals.msgs)} hint="Pico em 12/06 às 14h" />
      </div>

      <Tabs defaultValue="tenants" className="flex flex-col gap-4">
        <TabsList className="h-9 w-fit">
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="usage">Consumo</TabsTrigger>
          <TabsTrigger value="health">Saúde</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="mt-0 flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 border-b border-border/50 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-base">Empresas / tenants</CardTitle>
                <CardDescription>{filtered.length} resultado(s)</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por empresa, dono ou e-mail…"
                    className="h-9 w-64 pl-8"
                  />
                </div>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Plano" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os planos</SelectItem>
                    {(["Starter", "Pro", "Enterprise", "Custom"] as Plan[]).map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos status</SelectItem>
                    {(Object.keys(STATUS_META) as TenantStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Sessões</TableHead>
                    <TableHead className="text-right">Agentes</TableHead>
                    <TableHead className="text-right">Mensagens</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow
                      key={t.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(t)}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{t.company}</span>
                          <span className="text-xs text-muted-foreground">{t.owner} · {t.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border", PLAN_META[t.plan].cls)}>{t.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border", STATUS_META[t.status].cls)}>
                          {STATUS_META[t.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{t.sessions}</TableCell>
                      <TableCell className="text-right tabular-nums">{t.agents}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(t.messages)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(t.tokens)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtBRL(t.revenue)}</TableCell>
                      <TableCell className="text-muted-foreground">{t.createdAt}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelected(t)}>
                              <LogIn className="mr-2 h-4 w-4" /> Impersonar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Marcar como pago
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {t.status === "bloqueado" ? (
                              <DropdownMenuItem>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Desbloquear
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-rose-400 focus:text-rose-400">
                                <Ban className="mr-2 h-4 w-4" /> Bloquear tenant
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((p) => (
              <Card key={p.name} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {p.price === null ? "Sob consulta" : `${fmtBRL(p.price)}/mês`}
                    </Badge>
                  </div>
                  <CardDescription>Limites e permissões do plano.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3 text-sm">
                  <LimitRow label="WhatsApp" value={p.whatsapp === 999 ? "Ilimitado" : `${p.whatsapp} números`} />
                  <LimitRow label="Agentes IA" value={p.agents === 999 ? "Ilimitado" : `${p.agents} agentes`} />
                  <LimitRow label="Mensagens" value={`${p.messages}/mês`} />
                  <LimitRow label="Usuários" value={p.users === 999 ? "Ilimitado" : `${p.users} usuários`} />
                  <div className="mt-2 flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
                    <Label className="text-xs">White-label</Label>
                    <Switch checked={p.whiteLabel} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
                    <Label className="text-xs">Acesso API</Label>
                    <Switch checked={p.api} />
                  </div>
                  <Button variant="outline" size="sm" className="mt-auto">Editar limites</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="mt-0 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consumo por provedor</CardTitle>
              <CardDescription>Uso vs. limite mensal contratado.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {PROVIDERS.map((p) => (
                <div key={p.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">
                      {p.used}% · {fmtBRL(p.cost)}
                    </span>
                  </div>
                  <Progress value={p.used} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top tenants por consumo</CardTitle>
              <CardDescription>Mensagens enviadas neste mês.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[...TENANTS]
                .sort((a, b) => b.messages - a.messages)
                .slice(0, 5)
                .map((t) => {
                  const pct = Math.min(100, (t.messages / 500_000) * 100);
                  return (
                    <div key={t.id} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{t.company}</span>
                        <span className="text-muted-foreground">{fmtNum(t.messages)}</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-0 grid gap-4 lg:grid-cols-3">
          <HealthCard title="API Gateway" status="ok" detail="Latência média 124ms" icon={Server} />
          <HealthCard title="Banco de dados" status="ok" detail="CPU 38% · Conexões 142/500" icon={Server} />
          <HealthCard title="Evolution Cluster" status="warn" detail="1 nó com latência elevada" icon={Smartphone} />
          <HealthCard title="OpenRouter" status="ok" detail="Fila estável" icon={Bot} />
          <HealthCard title="Workers" status="ok" detail="8 ativos · 0 reiniciando" icon={Zap} />
          <HealthCard title="Storage" status="ok" detail="62% utilizado (1.24 TB)" icon={Server} />

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Filas em tempo real</CardTitle>
              <CardDescription>Mock — integrar com Redis/BullMQ.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fila</TableHead>
                    <TableHead className="text-right">Pendentes</TableHead>
                    <TableHead className="text-right">Processando</TableHead>
                    <TableHead className="text-right">Falhas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {QUEUES.map((q) => (
                    <TableRow key={q.name}>
                      <TableCell className="font-mono text-xs">{q.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{q.pending}</TableCell>
                      <TableCell className="text-right tabular-nums">{q.processing}</TableCell>
                      <TableCell className={cn("text-right tabular-nums", q.failed > 0 && "text-rose-400")}>{q.failed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-0 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Logs de erro
              </CardTitle>
              <CardDescription>Últimos eventos da plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border/50">
              {ERROR_LOGS.map((l, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 text-sm">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border",
                      l.level === "error" && "border-rose-500/30 bg-rose-500/10 text-rose-300",
                      l.level === "warn" && "border-amber-500/30 bg-amber-500/10 text-amber-300",
                      l.level === "info" && "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
                    )}
                  >
                    {l.level}
                  </Badge>
                  <div className="flex-1">
                    <div className="text-sm">{l.msg}</div>
                    <div className="text-xs text-muted-foreground">{l.tenant} · {l.time}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Webhook className="h-4 w-4 text-primary" /> Webhooks recebidos
              </CardTitle>
              <CardDescription>Eventos dos provedores integrados.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hora</TableHead>
                    <TableHead>Provedor</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {WEBHOOK_LOGS.map((w, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs text-muted-foreground">{w.time}</TableCell>
                      <TableCell>{w.provider}</TableCell>
                      <TableCell className="font-mono text-xs">{w.event}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border",
                            w.status === 200
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-rose-500/30 bg-rose-500/10 text-rose-300",
                          )}
                        >
                          {w.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TenantDialog tenant={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success";
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
          <span>{label}</span>
          <Icon className={cn("h-4 w-4", tone === "success" ? "text-emerald-400" : "text-primary")} />
        </div>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function LimitRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function HealthCard({
  title,
  status,
  detail,
  icon: Icon,
}: {
  title: string;
  status: "ok" | "warn" | "down";
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const meta = {
    ok: { label: "Operacional", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    warn: { label: "Degradado", cls: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
    down: { label: "Fora do ar", cls: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
  }[status];
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-md border border-border/60 bg-muted/30 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium">{title}</div>
            <div className="text-xs text-muted-foreground">{detail}</div>
          </div>
        </div>
        <Badge variant="outline" className={cn("border", meta.cls)}>{meta.label}</Badge>
      </CardContent>
    </Card>
  );
}

function TenantDialog({ tenant, onClose }: { tenant: Tenant | null; onClose: () => void }) {
  return (
    <Dialog open={!!tenant} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {tenant && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> {tenant.company}
              </DialogTitle>
              <DialogDescription>
                {tenant.owner} · {tenant.email} · desde {tenant.createdAt}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow label="Plano" value={tenant.plan} />
                <InfoRow label="Status" value={STATUS_META[tenant.status].label} />
                <InfoRow label="Sessões WhatsApp" value={String(tenant.sessions)} />
                <InfoRow label="Agentes IA" value={String(tenant.agents)} />
                <InfoRow label="Mensagens (mês)" value={fmtNum(tenant.messages)} />
                <InfoRow label="Tokens consumidos" value={fmtNum(tenant.tokens)} />
                <InfoRow label="Receita mensal" value={fmtBRL(tenant.revenue)} />
                <InfoRow label="ID interno" value={tenant.id} />
              </div>
              <div className="mt-4 rounded-lg border border-border/50 p-3 text-xs text-muted-foreground">
                Ao impersonar este tenant, todas as ações serão registradas no log de auditoria.
                Use apenas para suporte.
              </div>
            </div>
            <DialogFooter className="gap-2 pt-3">
              {tenant.status === "bloqueado" ? (
                <Button variant="outline">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Desbloquear
                </Button>
              ) : (
                <Button variant="outline" className="text-rose-400 hover:text-rose-400">
                  <Ban className="mr-2 h-4 w-4" /> Bloquear
                </Button>
              )}
              <Button>
                <LogIn className="mr-2 h-4 w-4" /> Impersonar tenant
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-md border border-border/50 bg-muted/20 px-3 py-2">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
