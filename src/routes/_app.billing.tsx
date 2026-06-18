import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError, iptvApi, type IptvPlan } from "@/lib/api/client";

import {
  CreditCard,
  Plus,
  Search,
  Send,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  Clock,
  TrendingUp,
  Wallet,
  Link2,
  Zap,
  QrCode,
  Bot,
  Calendar,
  XCircle,
  Tv,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({ meta: [{ title: "Financeiro — VEKTOR A.I" }] }),
  component: BillingPage,
});

type ChargeStatus = "pendente" | "vencido" | "pago" | "agendado";
type Method = "pix" | "link" | "manual";

interface Charge {
  id: string;
  customer: string;
  whatsapp: string;
  plan: string;
  amount: number;
  dueDate: string; // ISO
  status: ChargeStatus;
  lastReminder?: string;
  pool: string;
  method: Method;
}

const today = new Date();
const addDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const INITIAL_CHARGES: Charge[] = [
  {
    id: "c1",
    customer: "Marcos Lima",
    whatsapp: "+55 11 99812-0011",
    plan: "Pro Mensal",
    amount: 297,
    dueDate: addDays(-2),
    status: "vencido",
    lastReminder: "D+1 vencido",
    pool: "Cobrança Pool",
    method: "pix",
  },
  {
    id: "c2",
    customer: "Ana Beatriz Costa",
    whatsapp: "+55 21 99450-2210",
    plan: "Starter",
    amount: 97,
    dueDate: addDays(1),
    status: "pendente",
    lastReminder: "D-1 lembrete urgente",
    pool: "Cobrança Pool",
    method: "link",
  },
  {
    id: "c3",
    customer: "Carlos Andrade",
    whatsapp: "+55 31 98123-7720",
    plan: "Enterprise",
    amount: 1290,
    dueDate: addDays(5),
    status: "pendente",
    lastReminder: "D-3 lembrete amigável",
    pool: "Vendas Pool",
    method: "pix",
  },
  {
    id: "c4",
    customer: "Joana Mendes",
    whatsapp: "+55 11 97001-5567",
    plan: "Pro Anual",
    amount: 2970,
    dueDate: addDays(-10),
    status: "pago",
    lastReminder: "Pago confirmado",
    pool: "Cobrança Pool",
    method: "pix",
  },
  {
    id: "c5",
    customer: "Renato Souza",
    whatsapp: "+55 47 99887-1100",
    plan: "Starter",
    amount: 97,
    dueDate: addDays(0),
    status: "pendente",
    lastReminder: "D0 vencimento hoje",
    pool: "Cobrança Pool",
    method: "link",
  },
  {
    id: "c6",
    customer: "Larissa Prado",
    whatsapp: "+55 11 98010-4422",
    plan: "Pro Mensal",
    amount: 297,
    dueDate: addDays(-5),
    status: "vencido",
    lastReminder: "D+3 recuperação",
    pool: "Cobrança Pool",
    method: "pix",
  },
];

const BRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_META: Record<ChargeStatus, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  vencido: { label: "Vencido", className: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  pago: { label: "Pago", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  agendado: { label: "Agendado", className: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
};

const METHOD_META: Record<Method, { label: string; icon: any }> = {
  pix: { label: "Pix", icon: QrCode },
  link: { label: "Link", icon: Link2 },
  manual: { label: "Manual", icon: Wallet },
};

const BILLING_RULES = [
  { id: "d-3", label: "D-3 lembrete amigável", active: true },
  { id: "d-1", label: "D-1 lembrete urgente", active: true },
  { id: "d0", label: "D0 vencimento hoje", active: true },
  { id: "d+1", label: "D+1 vencido", active: true },
  { id: "d+3", label: "D+3 recuperação", active: true },
  { id: "paid", label: "Pago confirmado → mover para cliente ativo", active: true },
];

const PLANS = [
  { name: "Starter", price: 97, customers: 142 },
  { name: "Pro Mensal", price: 297, customers: 86 },
  { name: "Pro Anual", price: 2970, customers: 24 },
  { name: "Enterprise", price: 1290, customers: 9 },
];

const PAYMENT_LINKS = [
  { id: "pl1", title: "Pro Mensal — Recorrência", url: "vektor.ai/pay/pro-mensal", method: "pix", active: true },
  { id: "pl2", title: "Starter — Avulso", url: "vektor.ai/pay/starter", method: "link", active: true },
  { id: "pl3", title: "Enterprise — Customizado", url: "vektor.ai/pay/ent-custom", method: "link", active: false },
];

function BillingPage() {
  const [charges, setCharges] = useState<Charge[]>(INITIAL_CHARGES);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("resumo");

  const metrics = useMemo(() => {
    const pendente = charges.filter((c) => c.status === "pendente");
    const vencido = charges.filter((c) => c.status === "vencido");
    const pago = charges.filter((c) => c.status === "pago");
    const sum = (arr: Charge[]) => arr.reduce((a, c) => a + c.amount, 0);
    return {
      pendenteTotal: sum(pendente),
      vencidoTotal: sum(vencido),
      pagoTotal: sum(pago),
      mrr: sum(pago) + sum(pendente),
      pendenteCount: pendente.length,
      vencidoCount: vencido.length,
      pagoCount: pago.length,
    };
  }, [charges]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return charges.filter(
      (c) =>
        !q ||
        c.customer.toLowerCase().includes(q) ||
        c.whatsapp.includes(q) ||
        c.plan.toLowerCase().includes(q),
    );
  }, [charges, search]);

  const markPaid = (id: string) =>
    setCharges((p) => p.map((c) => (c.id === id ? { ...c, status: "pago", lastReminder: "Pago confirmado" } : c)));

  const sendReminder = (id: string) =>
    setCharges((p) =>
      p.map((c) => (c.id === id ? { ...c, lastReminder: "Lembrete enviado agora" } : c)),
    );

  const addCharge = (c: Charge) => setCharges((p) => [c, ...p]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" /> Financeiro
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Cobranças & Receita</h1>
          <p className="text-sm text-muted-foreground">
            Gestão de cobranças, régua automática e integração com WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente, WhatsApp, plano…"
              className="w-72 pl-8"
            />
          </div>
          <NewChargeDialog onCreate={addCharge} />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          label="Receita confirmada"
          value={BRL(metrics.pagoTotal)}
          hint={`${metrics.pagoCount} pagamentos`}
          tone="emerald"
        />
        <MetricCard
          icon={Clock}
          label="Pendentes"
          value={BRL(metrics.pendenteTotal)}
          hint={`${metrics.pendenteCount} cobranças`}
          tone="amber"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Vencidos"
          value={BRL(metrics.vencidoTotal)}
          hint={`${metrics.vencidoCount} clientes`}
          tone="rose"
        />
        <MetricCard
          icon={Wallet}
          label="MRR projetado"
          value={BRL(metrics.mrr)}
          hint="Mês corrente"
          tone="sky"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="vencidos">Vencidos</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="iptv">Planos IPTV</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="automacoes">Automações</TabsTrigger>
        </TabsList>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <TabsContent value="resumo" className="mt-0 space-y-4">
            <ChargesTable
              rows={filtered}
              onPaid={markPaid}
              onRemind={sendReminder}
            />
          </TabsContent>
          <TabsContent value="pendentes" className="mt-0">
            <ChargesTable
              rows={filtered.filter((c) => c.status === "pendente")}
              onPaid={markPaid}
              onRemind={sendReminder}
            />
          </TabsContent>
          <TabsContent value="vencidos" className="mt-0">
            <ChargesTable
              rows={filtered.filter((c) => c.status === "vencido")}
              onPaid={markPaid}
              onRemind={sendReminder}
            />
          </TabsContent>
          <TabsContent value="pagos" className="mt-0">
            <ChargesTable
              rows={filtered.filter((c) => c.status === "pago")}
              onPaid={markPaid}
              onRemind={sendReminder}
            />
          </TabsContent>
          <TabsContent value="planos" className="mt-0">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((p) => (
                <Card key={p.name} className="border-white/5 bg-white/[0.02]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="text-2xl font-semibold">{BRL(p.price)}</div>
                    <div className="text-xs text-muted-foreground">{p.customers} clientes ativos</div>
                    <div className="pt-2 text-xs text-emerald-300">
                      MRR: {BRL(p.price * p.customers)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="iptv" className="mt-0">
            <IptvPlansTab />
          </TabsContent>
          <TabsContent value="links" className="mt-0 space-y-2">
            {PAYMENT_LINKS.map((l) => (
              <Card key={l.id} className="border-white/5 bg-white/[0.02]">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <Link2 className="h-4 w-4 text-sky-300" /> {l.title}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">{l.url}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-white/10 text-xs uppercase">
                      {l.method}
                    </Badge>
                    <Badge
                      className={cn(
                        "border text-xs",
                        l.active
                          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                          : "border-white/10 bg-white/5 text-muted-foreground",
                      )}
                    >
                      {l.active ? "Ativo" : "Pausado"}
                    </Badge>
                    <Button variant="ghost" size="sm">Copiar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="automacoes" className="mt-0 space-y-2">
            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-amber-300" /> Régua de cobrança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {BILLING_RULES.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-md border border-white/5 bg-background/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {r.label}
                    </div>
                    <Switch defaultChecked={r.active} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="h-4 w-4 text-sky-300" /> Integrações
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {["Mercado Pago", "Asaas", "Pix manual", "Sigma"].map((p) => (
                  <div
                    key={p}
                    className="flex items-center justify-between rounded-md border border-white/5 bg-background/40 px-3 py-2"
                  >
                    <div className="text-sm">{p}</div>
                    <Badge variant="outline" className="border-white/10 text-xs">
                      Em breve
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  hint: string;
  tone: "emerald" | "amber" | "rose" | "sky";
}) {
  const toneMap = {
    emerald: "text-emerald-300 bg-emerald-500/10",
    amber: "text-amber-300 bg-amber-500/10",
    rose: "text-rose-300 bg-rose-500/10",
    sky: "text-sky-300 bg-sky-500/10",
  };
  return (
    <Card className="border-white/5 bg-white/[0.02]">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("rounded-lg p-2", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="truncate text-xl font-semibold">{value}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChargesTable({
  rows,
  onPaid,
  onRemind,
}: {
  rows: Charge[];
  onPaid: (id: string) => void;
  onRemind: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <Card className="border-white/5 bg-white/[0.02]">
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          Nenhuma cobrança nesta visão.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-white/5 bg-white/[0.02]">
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead>Cliente</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último lembrete</TableHead>
            <TableHead>Pool</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => {
            const MIcon = METHOD_META[c.method].icon;
            return (
              <TableRow key={c.id} className="border-white/5">
                <TableCell>
                  <div className="font-medium">{c.customer}</div>
                  <div className="text-xs text-muted-foreground">{c.whatsapp}</div>
                </TableCell>
                <TableCell className="text-sm">{c.plan}</TableCell>
                <TableCell className="font-medium">{BRL(c.amount)}</TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1.5">
                    <MIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {new Date(c.dueDate).toLocaleDateString("pt-BR")}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("border text-xs", STATUS_META[c.status].className)}>
                    {STATUS_META[c.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.lastReminder ?? "—"}
                </TableCell>
                <TableCell className="text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-0.5">
                    <Bot className="h-3 w-3" /> {c.pool}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Enviar cobrança"
                      onClick={() => onRemind(c.id)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Marcar como pago"
                      onClick={() => onPaid(c.id)}
                      disabled={c.status === "pago"}
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    </Button>
                    <Button size="sm" variant="ghost" title="Abrir conversa">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function NewChargeDialog({ onCreate }: { onCreate: (c: Charge) => void }) {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(addDays(7));
  const [plan, setPlan] = useState("Starter");
  const [method, setMethod] = useState<Method>("pix");
  const [message, setMessage] = useState(
    "Olá {nome}, sua fatura do plano {plano} no valor de {valor} vence em {vencimento}. Pague com Pix em segundos.",
  );
  const [rule, setRule] = useState(true);

  const submit = () => {
    if (!customer || !amount) return;
    onCreate({
      id: `c${Date.now()}`,
      customer,
      whatsapp,
      plan,
      amount: Number(amount),
      dueDate,
      status: "pendente",
      pool: "Cobrança Pool",
      method,
      lastReminder: rule ? "Régua ativada" : undefined,
    });
    setOpen(false);
    setCustomer("");
    setWhatsapp("");
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nova cobrança
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova cobrança</DialogTitle>
          <DialogDescription>
            Crie uma cobrança e dispare a régua automática pelo WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+55 11 99999-0000" />
            </div>
            <div className="space-y-1.5">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="297"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vencimento</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Plano</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => (
                    <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Método</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as Method)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="link">Link de pagamento</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Mensagem automática</Label>
              <Textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Variáveis: {"{nome}"}, {"{plano}"}, {"{valor}"}, {"{vencimento}"}.
              </p>
            </div>
            <div className="md:col-span-2 flex items-center justify-between rounded-md border border-white/5 bg-background/40 px-3 py-2">
              <div>
                <div className="text-sm font-medium">Ativar régua de cobrança</div>
                <div className="text-xs text-muted-foreground">
                  D-3, D-1, D0, D+1 e D+3 automáticos via Cobrança Pool.
                </div>
              </div>
              <Switch checked={rule} onCheckedChange={setRule} />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-white/5 pt-3">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            <XCircle className="h-4 w-4" /> Cancelar
          </Button>
          <Button onClick={submit}>
            <Send className="h-4 w-4" /> Criar cobrança
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Planos IPTV — gestão de planos editáveis por tenant
// ============================================================

type IptvPlanRow = {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  price: number;
  currency: string;
  connectionsLimit: number;
  trialEnabled: boolean;
  trialDurationHours: number;
  active: boolean;
  sortOrder: number;
  assignedAiPoolId: string;
  reminderDaysBefore: number[];
  overdueDaysAfter: number[];
  messageTemplate: string;
};

const INITIAL_IPTV_PLANS: IptvPlanRow[] = [
  {
    id: "iptv1",
    name: "IPTV Mensal — 1 tela",
    description: "Acesso completo, qualidade Full HD/4K, 1 conexão simultânea.",
    durationDays: 30,
    price: 35,
    currency: "BRL",
    connectionsLimit: 1,
    trialEnabled: true,
    trialDurationHours: 6,
    active: true,
    sortOrder: 1,
    assignedAiPoolId: "Cobrança Pool",
    reminderDaysBefore: [7, 3, 1, 0],
    overdueDaysAfter: [1, 3, 7],
    messageTemplate: "Olá {{nome}}, seu plano IPTV vence em {{dias}} dias. Renove pelo Pix.",
  },
  {
    id: "iptv2",
    name: "IPTV Mensal — 2 telas",
    description: "Pacote família, 2 conexões simultâneas.",
    durationDays: 30,
    price: 55,
    currency: "BRL",
    connectionsLimit: 2,
    trialEnabled: true,
    trialDurationHours: 6,
    active: true,
    sortOrder: 2,
    assignedAiPoolId: "Cobrança Pool",
    reminderDaysBefore: [7, 3, 1, 0],
    overdueDaysAfter: [1, 3, 7],
    messageTemplate: "Olá {{nome}}, seu plano IPTV vence em {{dias}} dias.",
  },
  {
    id: "iptv3",
    name: "IPTV Trimestral",
    description: "3 meses com desconto, 1 conexão.",
    durationDays: 90,
    price: 95,
    currency: "BRL",
    connectionsLimit: 1,
    trialEnabled: false,
    trialDurationHours: 0,
    active: true,
    sortOrder: 3,
    assignedAiPoolId: "Cobrança Pool",
    reminderDaysBefore: [7, 3, 1],
    overdueDaysAfter: [1, 3],
    messageTemplate: "Olá {{nome}}, seu plano trimestral está acabando.",
  },
  {
    id: "iptv4",
    name: "IPTV Anual",
    description: "12 meses, melhor custo-benefício.",
    durationDays: 365,
    price: 340,
    currency: "BRL",
    connectionsLimit: 2,
    trialEnabled: false,
    trialDurationHours: 0,
    active: false,
    sortOrder: 4,
    assignedAiPoolId: "Vendas Pool",
    reminderDaysBefore: [30, 7, 1],
    overdueDaysAfter: [1, 7],
    messageTemplate: "Olá {{nome}}, sua assinatura anual vence em breve.",
  },
];

const POOL_OPTIONS = ["Cobrança Pool", "Vendas Pool", "Suporte Pool", "Renovação Pool"];

function emptyPlan(): IptvPlanRow {
  return {
    id: `iptv_${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    description: "",
    durationDays: 30,
    price: 0,
    currency: "BRL",
    connectionsLimit: 1,
    trialEnabled: false,
    trialDurationHours: 6,
    active: true,
    sortOrder: 99,
    assignedAiPoolId: "Cobrança Pool",
    reminderDaysBefore: [7, 3, 1, 0],
    overdueDaysAfter: [1, 3, 7],
    messageTemplate: "Olá {{nome}}, seu plano IPTV vence em {{dias}} dias.",
  };
}

function backendErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Sessão expirada. Entre novamente.";
    if (err.status === 403) return "Sem permissão para esta operação.";
    if (err.status === 400) return "Dados inválidos.";
  }
  return "Backend indisponível. Verifique a API.";
}

function planFromApi(p: IptvPlan): IptvPlanRow {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    durationDays: p.durationDays,
    price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
    currency: p.currency,
    connectionsLimit: p.connectionsLimit,
    trialEnabled: p.trialEnabled,
    trialDurationHours: p.trialDurationHours,
    active: p.active,
    sortOrder: p.sortOrder,
    assignedAiPoolId: "Cobrança Pool",
    reminderDaysBefore: [7, 3, 1, 0],
    overdueDaysAfter: [1, 3, 7],
    messageTemplate: "Olá {{nome}}, seu plano IPTV vence em {{dias}} dias.",
  };
}

function planToApi(p: IptvPlanRow): Partial<IptvPlan> {
  return {
    name: p.name,
    description: p.description || null,
    durationDays: p.durationDays,
    price: p.price,
    currency: p.currency,
    connectionsLimit: p.connectionsLimit,
    trialEnabled: p.trialEnabled,
    trialDurationHours: p.trialDurationHours,
    active: p.active,
    sortOrder: p.sortOrder,
  };
}

function IptvPlansTab() {
  const { currentOrgId, ready, isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<IptvPlanRow | null>(null);
  const [open, setOpen] = useState(false);

  const enabled = ready && isAuthenticated && !!currentOrgId;

  const plansQuery = useQuery({
    queryKey: ["iptv-plans", currentOrgId],
    enabled,
    queryFn: () => iptvApi.listPlans(currentOrgId!).then((r) => r.plans.map(planFromApi)),
  });

  const plans = plansQuery.data ?? [];
  const sorted = useMemo(() => [...plans].sort((a, b) => a.sortOrder - b.sortOrder), [plans]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["iptv-plans", currentOrgId] });

  const createMut = useMutation({
    mutationFn: (p: IptvPlanRow) => iptvApi.createPlan(currentOrgId!, planToApi(p)),
    onSuccess: () => { toast.success("Plano criado."); setOpen(false); setEditing(null); invalidate(); },
    onError: (err) => toast.error(backendErrorMessage(err)),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, p }: { id: string; p: IptvPlanRow }) =>
      iptvApi.updatePlan(currentOrgId!, id, planToApi(p)),
    onSuccess: () => { toast.success("Plano atualizado."); setOpen(false); setEditing(null); invalidate(); },
    onError: (err) => toast.error(backendErrorMessage(err)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => iptvApi.deletePlan(currentOrgId!, id),
    onSuccess: () => { toast.success("Plano removido."); invalidate(); },
    onError: (err) => toast.error(backendErrorMessage(err)),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      iptvApi.updatePlan(currentOrgId!, id, { active }),
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(backendErrorMessage(err)),
  });

  const saving = createMut.isPending || updateMut.isPending;
  const upsert = (p: IptvPlanRow) => {
    const existing = plans.some((x) => x.id === p.id);
    if (existing) updateMut.mutate({ id: p.id, p });
    else createMut.mutate(p);
  };

  const openNew = () => { setEditing(emptyPlan()); setOpen(true); };
  const openEdit = (p: IptvPlanRow) => { setEditing(p); setOpen(true); };

  return (
    <div className="space-y-4">
      <Card className="border-white/5 bg-white/[0.02]">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-300"><Tv className="h-5 w-5" /></div>
            <div>
              <div className="text-sm font-medium">Planos IPTV editáveis</div>
              <div className="text-xs text-muted-foreground">
                Configure preços, duração, conexões, trial e régua de renovação por plano.
              </div>
            </div>
          </div>
          <Button onClick={openNew} className="gap-1" disabled={!currentOrgId}>
            <Plus className="h-4 w-4" /> Novo plano IPTV
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-white/[0.02]">
        {plansQuery.isError ? (
          <div className="flex items-center gap-2 p-6 text-sm text-rose-300">
            <AlertTriangle className="h-4 w-4" /> Backend indisponível. Verifique a API.
            <Button size="sm" variant="ghost" onClick={() => plansQuery.refetch()}>Tentar de novo</Button>
          </div>
        ) : plansQuery.isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando planos…
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Plano</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Conexões</TableHead>
                <TableHead>Trial</TableHead>
                <TableHead>Pool</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((p) => (
                <TableRow key={p.id} className="border-white/5">
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="line-clamp-1 text-xs text-muted-foreground">{p.description}</div>
                  </TableCell>
                  <TableCell className="text-sm">{p.durationDays} dias</TableCell>
                  <TableCell className="text-sm">{BRL(p.price)}</TableCell>
                  <TableCell className="text-sm">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {p.connectionsLimit}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.trialEnabled ? (
                      <Badge className="border border-sky-500/30 bg-sky-500/15 text-sky-300">
                        {p.trialDurationHours}h
                      </Badge>
                    ) : (<span className="text-xs text-muted-foreground">—</span>)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.assignedAiPoolId}</TableCell>
                  <TableCell>
                    <Switch
                      checked={p.active}
                      disabled={toggleMut.isPending}
                      onCheckedChange={(v) => toggleMut.mutate({ id: p.id, active: v })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="gap-1">
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      disabled={deleteMut.isPending}
                      onClick={() => { if (confirm(`Remover ${p.name}?`)) deleteMut.mutate(p.id); }}
                      className="gap-1 text-rose-300 hover:text-rose-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    Nenhum plano IPTV criado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <IptvPlanDialog open={open} onOpenChange={(b) => { if (!saving) setOpen(b); }} value={editing} onSave={upsert} saving={saving} />
    </div>
  );
}


function IptvPlanDialog({
  open,
  onOpenChange,
  value,
  onSave,
  saving = false,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  value: IptvPlanRow | null;
  onSave: (p: IptvPlanRow) => void;
  saving?: boolean;
}) {
  const [draft, setDraft] = useState<IptvPlanRow | null>(value);

  useEffect(() => {
    setDraft((current) => (current === value || current?.id === value?.id ? current : value));
  }, [value]);

  if (!draft) return null;

  const set = <K extends keyof IptvPlanRow>(k: K, v: IptvPlanRow[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  const parseNums = (s: string) =>
    s
      .split(",")
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => Number.isFinite(n) && n >= 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tv className="h-4 w-4 text-sky-300" />
            {value && draft.name ? "Editar plano IPTV" : "Novo plano IPTV"}
          </DialogTitle>
          <DialogDescription>
            Configure os detalhes do plano. As regras de renovação rodam automaticamente quando
            ativadas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nome do plano</Label>
              <Input value={draft.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Pool de cobrança</Label>
              <Select
                value={draft.assignedAiPoolId}
                onValueChange={(v) => set("assignedAiPoolId", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POOL_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Duração (dias)</Label>
              <Input
                type="number"
                min={1}
                value={draft.durationDays}
                onChange={(e) => set("durationDays", parseInt(e.target.value || "0", 10))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Preço (BRL)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={draft.price}
                onChange={(e) => set("price", parseFloat(e.target.value || "0"))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Conexões</Label>
              <Input
                type="number"
                min={1}
                value={draft.connectionsLimit}
                onChange={(e) => set("connectionsLimit", parseInt(e.target.value || "1", 10))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ordem</Label>
              <Input
                type="number"
                value={draft.sortOrder}
                onChange={(e) => set("sortOrder", parseInt(e.target.value || "0", 10))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-lg border border-white/5 bg-background/40 p-3 md:grid-cols-3">
            <div className="flex items-center justify-between md:col-span-1">
              <Label className="text-sm">Trial habilitado</Label>
              <Switch
                checked={draft.trialEnabled}
                onCheckedChange={(v) => set("trialEnabled", v)}
              />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <Label>Duração do trial (horas)</Label>
              <Input
                type="number"
                min={0}
                disabled={!draft.trialEnabled}
                value={draft.trialDurationHours}
                onChange={(e) => set("trialDurationHours", parseInt(e.target.value || "0", 10))}
              />
            </div>
            <div className="flex items-center justify-between md:col-span-1">
              <Label className="text-sm">Plano ativo</Label>
              <Switch checked={draft.active} onCheckedChange={(v) => set("active", v)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Lembretes antes do vencimento (dias, separados por vírgula)</Label>
              <Input
                value={draft.reminderDaysBefore.join(", ")}
                onChange={(e) => set("reminderDaysBefore", parseNums(e.target.value))}
                placeholder="7, 3, 1, 0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cobranças após vencimento (dias)</Label>
              <Input
                value={draft.overdueDaysAfter.join(", ")}
                onChange={(e) => set("overdueDaysAfter", parseNums(e.target.value))}
                placeholder="1, 3, 7"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Mensagem padrão de renovação</Label>
            <Textarea
              rows={3}
              value={draft.messageTemplate}
              onChange={(e) => set("messageTemplate", e.target.value)}
              placeholder="Olá {{nome}}, seu plano IPTV vence em {{dias}} dias…"
            />
            <p className="text-xs text-muted-foreground">
              Variáveis: <code>{"{{nome}}"}</code>, <code>{"{{dias}}"}</code>,{" "}
              <code>{"{{plano}}"}</code>, <code>{"{{valor}}"}</code>.
            </p>
          </div>
        </div>

        <DialogFooter className="border-t border-white/5 pt-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={() => draft && onSave(draft)} disabled={saving || !draft.name.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar plano"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
