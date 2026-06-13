import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  Filter,
  GitBranch,
  Layers,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  Tag,
  Trash2,
  UserCheck,
  Webhook,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/automations")({
  head: () => ({ meta: [{ title: "Automações — VEKTOR A.I" }] }),
  component: AutomationsPage,
});

type Status = "active" | "paused" | "draft" | "error";

type NodeType = "trigger" | "condition" | "action" | "delay" | "fallback" | "end";

interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  detail?: string;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  status: Status;
  trigger: string;
  lastRun: string;
  successRate: number;
  executions: number;
  session: string;
  pool: string;
  priority: "alta" | "média" | "baixa";
  nodes: FlowNode[];
}

const STATUS_META: Record<Status, { label: string; class: string; dot: string }> = {
  active: { label: "Ativa", class: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
  paused: { label: "Pausada", class: "bg-amber-500/15 text-amber-300 border-amber-500/30", dot: "bg-amber-400" },
  draft: { label: "Rascunho", class: "bg-slate-500/15 text-slate-300 border-slate-500/30", dot: "bg-slate-400" },
  error: { label: "Erro", class: "bg-rose-500/15 text-rose-300 border-rose-500/30", dot: "bg-rose-400" },
};

const TRIGGERS = [
  "Novo lead recebido",
  "Mensagem recebida",
  "Cliente sem resposta por X minutos",
  "Lead mudou de estágio",
  "Pagamento vencido",
  "Boleto/Pix gerado",
  "IA falhou",
  "Humano assumiu",
  "Fora do horário comercial",
];

const CONDITIONS = [
  "Origem do lead",
  "Tag contém",
  "Estágio atual",
  "Horário comercial",
  "Agente disponível",
  "Cliente vencido",
  "Plano do cliente",
  "Valor do negócio",
  "Intenção detectada",
];

const ACTIONS = [
  { label: "Enviar mensagem WhatsApp", icon: MessageSquare },
  { label: "Acionar Pool IA", icon: Layers },
  { label: "Mover lead no CRM", icon: GitBranch },
  { label: "Criar tarefa", icon: CheckCircle2 },
  { label: "Adicionar tag", icon: Tag },
  { label: "Enviar cobrança", icon: Send },
  { label: "Transferir para humano", icon: UserCheck },
  { label: "Pausar IA", icon: Pause },
  { label: "Enviar webhook", icon: Webhook },
  { label: "Agendar follow-up", icon: Clock },
];

const NODE_META: Record<NodeType, { label: string; class: string; icon: any }> = {
  trigger: { label: "Gatilho", class: "border-sky-500/40 bg-sky-500/10 text-sky-200", icon: Zap },
  condition: { label: "Condição", class: "border-amber-500/40 bg-amber-500/10 text-amber-200", icon: Filter },
  action: { label: "Ação", class: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200", icon: Sparkles },
  delay: { label: "Atraso", class: "border-violet-500/40 bg-violet-500/10 text-violet-200", icon: Clock },
  fallback: { label: "Fallback", class: "border-rose-500/40 bg-rose-500/10 text-rose-200", icon: AlertTriangle },
  end: { label: "Fim", class: "border-slate-500/40 bg-slate-500/10 text-slate-200", icon: CheckCircle2 },
};

const SEED: Automation[] = [
  {
    id: "a1",
    name: "Boas-vindas + Qualificação IA",
    description: "Recebe novo lead, classifica intenção e direciona para o Pool de Vendas.",
    status: "active",
    trigger: "Novo lead recebido",
    lastRun: "há 2 min",
    successRate: 96,
    executions: 1842,
    session: "Comercial • +55 11 99876-2210",
    pool: "Vendas Pool",
    priority: "alta",
    nodes: [
      { id: "n1", type: "trigger", label: "Novo lead recebido", detail: "WhatsApp Comercial" },
      { id: "n2", type: "condition", label: "Origem = Anúncio Meta" },
      { id: "n3", type: "action", label: "Acionar Vendas Pool", detail: "Prioridade alta" },
      { id: "n4", type: "delay", label: "Aguardar 30 min sem resposta" },
      { id: "n5", type: "fallback", label: "Transferir para humano" },
      { id: "n6", type: "end", label: "Fim do fluxo" },
    ],
  },
  {
    id: "a2",
    name: "Cobrança automática de boleto vencido",
    description: "Reengaja clientes com pagamentos em atraso usando o Pool Cobrança.",
    status: "active",
    trigger: "Pagamento vencido",
    lastRun: "há 14 min",
    successRate: 88,
    executions: 624,
    session: "Financeiro • +55 11 95555-1100",
    pool: "Cobrança Pool",
    priority: "alta",
    nodes: [
      { id: "n1", type: "trigger", label: "Pagamento vencido" },
      { id: "n2", type: "condition", label: "Atraso > 2 dias" },
      { id: "n3", type: "action", label: "Enviar mensagem WhatsApp" },
      { id: "n4", type: "delay", label: "24h" },
      { id: "n5", type: "action", label: "Enviar cobrança Pix" },
      { id: "n6", type: "end", label: "Fim" },
    ],
  },
  {
    id: "a3",
    name: "Follow-up sem resposta 2h",
    description: "Reativa conversas paradas com mensagem personalizada da IA.",
    status: "paused",
    trigger: "Cliente sem resposta por X minutos",
    lastRun: "há 3 h",
    successRate: 72,
    executions: 309,
    session: "Comercial • +55 11 99876-2210",
    pool: "Vendas Pool",
    priority: "média",
    nodes: [
      { id: "n1", type: "trigger", label: "Sem resposta por 120 min" },
      { id: "n2", type: "action", label: "Acionar IA follow-up" },
      { id: "n3", type: "end", label: "Fim" },
    ],
  },
  {
    id: "a4",
    name: "Fora do horário → mensagem automática",
    description: "Responde clientes fora do expediente e agenda retorno.",
    status: "draft",
    trigger: "Fora do horário comercial",
    lastRun: "—",
    successRate: 0,
    executions: 0,
    session: "Suporte • +55 11 94444-7720",
    pool: "Suporte Pool",
    priority: "baixa",
    nodes: [
      { id: "n1", type: "trigger", label: "Fora do horário" },
      { id: "n2", type: "action", label: "Enviar mensagem WhatsApp" },
      { id: "n3", type: "action", label: "Agendar follow-up" },
      { id: "n4", type: "end", label: "Fim" },
    ],
  },
  {
    id: "a5",
    name: "Escalonamento — IA falhou",
    description: "Quando a IA atinge limite ou erra, transfere para atendente humano.",
    status: "error",
    trigger: "IA falhou",
    lastRun: "há 41 min",
    successRate: 41,
    executions: 87,
    session: "Suporte • +55 11 94444-7720",
    pool: "Suporte Pool",
    priority: "alta",
    nodes: [
      { id: "n1", type: "trigger", label: "IA falhou" },
      { id: "n2", type: "fallback", label: "Transferir para humano" },
      { id: "n3", type: "end", label: "Fim" },
    ],
  },
];

function AutomationsPage() {
  const [items, setItems] = useState<Automation[]>(SEED);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [editing, setEditing] = useState<Automation | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      items.filter(
        (a) =>
          (statusFilter === "all" || a.status === statusFilter) &&
          (a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.trigger.toLowerCase().includes(search.toLowerCase())),
      ),
    [items, search, statusFilter],
  );

  const totals = useMemo(() => {
    const active = items.filter((i) => i.status === "active").length;
    const exec = items.reduce((s, i) => s + i.executions, 0);
    const avg = Math.round(
      items.filter((i) => i.executions > 0).reduce((s, i) => s + i.successRate, 0) /
        Math.max(1, items.filter((i) => i.executions > 0).length),
    );
    const errors = items.filter((i) => i.status === "error").length;
    return { active, exec, avg, errors };
  }, [items]);

  const toggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a,
      ),
    );
  };

  const openEditor = (a?: Automation) => {
    setEditing(
      a ?? {
        id: `a${Date.now()}`,
        name: "",
        description: "",
        status: "draft",
        trigger: TRIGGERS[0],
        lastRun: "—",
        successRate: 0,
        executions: 0,
        session: "Comercial • +55 11 99876-2210",
        pool: "Vendas Pool",
        priority: "média",
        nodes: [
          { id: "n1", type: "trigger", label: TRIGGERS[0] },
          { id: "n2", type: "condition", label: CONDITIONS[0] },
          { id: "n3", type: "action", label: ACTIONS[0].label },
          { id: "n4", type: "end", label: "Fim" },
        ],
      },
    );
    setOpen(true);
  };

  const saveEditor = () => {
    if (!editing) return;
    setItems((prev) => {
      const exists = prev.some((p) => p.id === editing.id);
      return exists ? prev.map((p) => (p.id === editing.id ? editing : p)) : [editing, ...prev];
    });
    setOpen(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Workflow className="h-3.5 w-3.5" /> Automação
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Automações</h1>
          <p className="text-sm text-muted-foreground">
            Construa fluxos para WhatsApp, CRM, IA e cobrança com gatilhos, condições e ações.
          </p>
        </div>
        <Button onClick={() => openEditor()} className="gap-2">
          <Plus className="h-4 w-4" /> Nova automação
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Activity} label="Automações ativas" value={String(totals.active)} accent="text-emerald-300" />
        <StatCard icon={Zap} label="Execuções totais" value={totals.exec.toLocaleString("pt-BR")} accent="text-sky-300" />
        <StatCard icon={CheckCircle2} label="Taxa média de sucesso" value={`${totals.avg}%`} accent="text-violet-300" />
        <StatCard icon={AlertTriangle} label="Com erro" value={String(totals.errors)} accent="text-rose-300" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou gatilho..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="paused">Pausadas</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="error">Com erro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto pr-1 xl:grid-cols-2">
        {filtered.map((a) => (
          <AutomationCard
            key={a.id}
            automation={a}
            onToggle={() => toggleStatus(a.id)}
            onEdit={() => openEditor(a)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
            <Workflow className="h-10 w-10 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium">Nenhuma automação encontrada</p>
            <p className="text-xs text-muted-foreground">Ajuste os filtros ou crie uma nova automação.</p>
          </div>
        )}
      </div>

      <AutomationEditor
        open={open}
        onOpenChange={setOpen}
        value={editing}
        onChange={setEditing}
        onSave={saveEditor}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card className="border-border/60 bg-card/40 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", accent)} />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </Card>
  );
}

function AutomationCard({
  automation,
  onToggle,
  onEdit,
}: {
  automation: Automation;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const meta = STATUS_META[automation.status];
  return (
    <Card className="group border-border/60 bg-card/40 p-5 backdrop-blur transition hover:border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
            <h3 className="truncate font-semibold">{automation.name}</h3>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{automation.description}</p>
        </div>
        <Badge variant="outline" className={cn("shrink-0 border", meta.class)}>
          {meta.label}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <Info icon={Zap} label="Gatilho" value={automation.trigger} />
        <Info icon={Clock} label="Última execução" value={automation.lastRun} />
        <Info icon={Activity} label="Execuções" value={automation.executions.toLocaleString("pt-BR")} />
        <Info icon={CheckCircle2} label="Sucesso" value={`${automation.successRate}%`} />
        <Info icon={MessageSquare} label="WhatsApp" value={automation.session} />
        <Info icon={Bot} label="Pool IA" value={automation.pool} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={automation.status === "active"} onCheckedChange={onToggle} />
          {automation.status === "active" ? "Ativa" : "Inativa"}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1">
            <Play className="h-3.5 w-3.5" /> Testar
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1">
            <Settings2 className="h-3.5 w-3.5" /> Editar
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-foreground/90">{value}</div>
      </div>
    </div>
  );
}

function AutomationEditor({
  open,
  onOpenChange,
  value,
  onChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: Automation | null;
  onChange: (a: Automation) => void;
  onSave: () => void;
}) {
  if (!value) return null;

  const update = (patch: Partial<Automation>) => onChange({ ...value, ...patch });
  const updateNode = (id: string, patch: Partial<FlowNode>) =>
    update({ nodes: value.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) });
  const removeNode = (id: string) =>
    update({ nodes: value.nodes.filter((n) => n.id !== id) });
  const addNode = (type: NodeType) =>
    update({
      nodes: [
        ...value.nodes.slice(0, -1),
        { id: `n${Date.now()}`, type, label: NODE_META[type].label },
        ...value.nodes.slice(-1),
      ],
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0">
        <DialogHeader className="border-b border-border/60 p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" /> Editor de automação
          </DialogTitle>
          <DialogDescription>
            Configure gatilho, condições, ações e fallback. Salve como rascunho ou ative o fluxo.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="config" className="flex flex-col gap-4">
            <TabsList className="w-fit">
              <TabsTrigger value="config">Configuração</TabsTrigger>
              <TabsTrigger value="canvas">Canvas visual</TabsTrigger>
              <TabsTrigger value="test">Testar</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome da automação">
                  <Input value={value.name} onChange={(e) => update({ name: e.target.value })} placeholder="Ex.: Boas-vindas IA" />
                </Field>
                <Field label="Prioridade">
                  <Select value={value.priority} onValueChange={(v) => update({ priority: v as Automation["priority"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="média">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="Descrição">
                <Textarea value={value.description} onChange={(e) => update({ description: e.target.value })} rows={2} />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Gatilho">
                  <Select value={value.trigger} onValueChange={(v) => update({ trigger: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIGGERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="WhatsApp">
                  <Input value={value.session} onChange={(e) => update({ session: e.target.value })} />
                </Field>
                <Field label="Pool IA">
                  <Input value={value.pool} onChange={(e) => update({ pool: e.target.value })} />
                </Field>
                <Field label="Status">
                  <Select value={value.status} onValueChange={(v) => update({ status: v as Status })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="paused">Pausada</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Etapas do fluxo</div>
                    <div className="text-xs text-muted-foreground">Adicione condições, ações, atrasos e fallback.</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(["condition", "action", "delay", "fallback"] as NodeType[]).map((t) => (
                      <Button key={t} size="sm" variant="outline" className="gap-1" onClick={() => addNode(t)}>
                        <Plus className="h-3 w-3" /> {NODE_META[t].label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {value.nodes.map((n) => {
                    const m = NODE_META[n.type];
                    const Icon = m.icon;
                    const options =
                      n.type === "condition" ? CONDITIONS :
                      n.type === "action" ? ACTIONS.map((a) => a.label) :
                      n.type === "trigger" ? TRIGGERS : null;
                    return (
                      <div key={n.id} className={cn("flex items-center gap-2 rounded-md border p-2", m.class)}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <Badge variant="outline" className="shrink-0 border-current bg-transparent text-current">{m.label}</Badge>
                        {options ? (
                          <Select value={n.label} onValueChange={(v) => updateNode(n.id, { label: v })}>
                            <SelectTrigger className="h-8 flex-1 bg-background/60"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : n.type === "delay" ? (
                          <Input value={n.label} onChange={(e) => updateNode(n.id, { label: e.target.value })} placeholder="Ex.: 30 min" className="h-8 flex-1 bg-background/60" />
                        ) : (
                          <Input value={n.label} onChange={(e) => updateNode(n.id, { label: e.target.value })} className="h-8 flex-1 bg-background/60" />
                        )}
                        {n.type !== "trigger" && n.type !== "end" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeNode(n.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                <div className="text-sm font-medium">Fallback & Handoff</div>
                <p className="text-xs text-muted-foreground">Quando todas as ações falharem.</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Field label="Comportamento">
                    <Select defaultValue="human">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="human">Transferir para humano</SelectItem>
                        <SelectItem value="message">Enviar mensagem padrão</SelectItem>
                        <SelectItem value="webhook">Disparar webhook</SelectItem>
                        <SelectItem value="end">Encerrar fluxo</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Mensagem se sem atendente">
                    <Input defaultValue="Recebemos sua mensagem! Em breve um atendente irá te responder." />
                  </Field>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="canvas">
              <WorkflowCanvas nodes={value.nodes} />
            </TabsContent>

            <TabsContent value="test" className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                <div className="text-sm font-medium">Simulação do fluxo</div>
                <p className="text-xs text-muted-foreground">Envie um payload de teste para validar gatilho e ações.</p>
                <Textarea
                  rows={6}
                  className="mt-3 font-mono text-xs"
                  defaultValue={`{\n  "lead": "+55 11 99876-1234",\n  "origem": "Anúncio Meta",\n  "mensagem": "Quero saber mais"\n}`}
                />
                <Button className="mt-3 gap-2"><Play className="h-3.5 w-3.5" /> Executar teste</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="border-t border-border/60 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="outline" className="gap-2"><Play className="h-3.5 w-3.5" /> Testar automação</Button>
          <Button onClick={onSave} className="gap-2"><CheckCircle2 className="h-4 w-4" /> Salvar automação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function WorkflowCanvas({ nodes }: { nodes: FlowNode[] }) {
  return (
    <div className="rounded-xl border border-border/60 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:18px_18px] p-6">
      <div className="flex flex-col items-center gap-2">
        {nodes.map((n, i) => {
          const m = NODE_META[n.type];
          const Icon = m.icon;
          return (
            <div key={n.id} className="flex flex-col items-center">
              <div className={cn("min-w-[260px] rounded-xl border p-4 shadow-lg shadow-black/20 backdrop-blur", m.class)}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <Badge variant="outline" className="border-current bg-transparent text-current">{m.label}</Badge>
                </div>
                <div className="mt-2 text-sm font-medium text-foreground">{n.label}</div>
                {n.detail && <div className="text-xs text-muted-foreground">{n.detail}</div>}
              </div>
              {i < nodes.length - 1 && (
                <div className="flex h-8 flex-col items-center">
                  <div className="h-full w-px bg-border" />
                  <ArrowRight className="-mt-1 h-3 w-3 rotate-90 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
