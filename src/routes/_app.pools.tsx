import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Layers,
  Plus,
  ShoppingCart,
  Headphones,
  Receipt,
  Calendar,
  Wand2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  Settings2,
  Bot,
  AlertTriangle,
  UserRoundCheck,
  Activity,
  Zap,
  Shield,
  MoreVertical,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/pools")({
  head: () => ({ meta: [{ title: "Pools IA — VEKTOR A.I" }] }),
  component: PoolsPage,
});

type Intent = "sales" | "support" | "billing" | "scheduling" | "custom";
type PoolStatus = "active" | "paused";
type AgentStatus = "active" | "inactive" | "error";
type CostMode = "low" | "balanced" | "premium";

interface PoolAgent {
  id: string;
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  tokenLimit: number;
  rateLimit: number;
  priority: number;
  costMode: CostMode;
  status: AgentStatus;
}

interface Pool {
  id: string;
  name: string;
  intent: Intent;
  status: PoolStatus;
  description: string;
  sessions: string[];
  keywords: string;
  handoffMessage: string;
  fallbackMessage: string;
  agents: PoolAgent[];
}

const INTENT_META: Record<Intent, { label: string; icon: any; color: string; ring: string }> = {
  sales: { label: "Vendas", icon: ShoppingCart, color: "text-emerald-400", ring: "ring-emerald-500/30" },
  support: { label: "Suporte", icon: Headphones, color: "text-sky-400", ring: "ring-sky-500/30" },
  billing: { label: "Cobrança", icon: Receipt, color: "text-amber-400", ring: "ring-amber-500/30" },
  scheduling: { label: "Agendamento", icon: Calendar, color: "text-violet-400", ring: "ring-violet-500/30" },
  custom: { label: "Personalizado", icon: Wand2, color: "text-pink-400", ring: "ring-pink-500/30" },
};

const COST_META: Record<CostMode, { label: string; badge: string }> = {
  low: { label: "Econômico", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  balanced: { label: "Balanceado", badge: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
  premium: { label: "Premium", badge: "bg-violet-500/10 text-violet-300 border-violet-500/30" },
};

const AGENT_STATUS: Record<AgentStatus, { label: string; dot: string }> = {
  active: { label: "Ativo", dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" },
  inactive: { label: "Inativo", dot: "bg-zinc-500" },
  error: { label: "Erro", dot: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" },
};

const INITIAL_POOLS: Pool[] = [
  {
    id: "p1",
    name: "Pool de Vendas",
    intent: "sales",
    status: "active",
    description: "Atende leads comerciais, qualifica e fecha pedidos.",
    sessions: ["Comercial SP", "Comercial RJ"],
    keywords: "comprar, preço, orçamento, catálogo, vendedor",
    handoffMessage: "Vou transferir você para um especialista humano agora.",
    fallbackMessage: "Estamos com alta demanda. Em breve um atendente humano falará com você.",
    agents: [
      { id: "a1", name: "Vendas IA 1", provider: "OpenRouter", model: "gpt-5.2", apiKey: "sk-***1234", tokenLimit: 800, rateLimit: 60, priority: 1, costMode: "balanced", status: "active" },
      { id: "a2", name: "Vendas IA 2", provider: "Gemini", model: "gemini-3-flash-preview", apiKey: "AI***ab12", tokenLimit: 1000, rateLimit: 90, priority: 2, costMode: "low", status: "active" },
      { id: "a3", name: "Vendas Backup", provider: "Groq", model: "llama-3.3-70b", apiKey: "gsk_***z9", tokenLimit: 600, rateLimit: 120, priority: 3, costMode: "low", status: "active" },
    ],
  },
  {
    id: "p2",
    name: "Pool de Suporte",
    intent: "support",
    status: "active",
    description: "Tira dúvidas, resolve problemas e abre tickets.",
    sessions: ["Suporte Geral"],
    keywords: "ajuda, erro, problema, suporte, dúvida",
    handoffMessage: "Vou conectar você com nosso suporte humano.",
    fallbackMessage: "Nosso suporte está fora do horário. Retornaremos em breve.",
    agents: [
      { id: "b1", name: "Suporte IA 1", provider: "OpenRouter", model: "gpt-5-mini", apiKey: "sk-***5678", tokenLimit: 700, rateLimit: 60, priority: 1, costMode: "balanced", status: "active" },
      { id: "b2", name: "Suporte IA 2", provider: "Gemini", model: "gemini-2.5-flash", apiKey: "AI***cd34", tokenLimit: 900, rateLimit: 90, priority: 2, costMode: "low", status: "active" },
      { id: "b3", name: "Suporte Backup", provider: "Pollinations", model: "openai", apiKey: "—", tokenLimit: 500, rateLimit: 30, priority: 3, costMode: "low", status: "inactive" },
    ],
  },
  {
    id: "p3",
    name: "Pool de Cobrança",
    intent: "billing",
    status: "active",
    description: "Lembretes de boletos, negociação e segunda via.",
    sessions: ["Financeiro"],
    keywords: "boleto, vencido, pagamento, negociar, fatura",
    handoffMessage: "Vou transferir para nossa equipe financeira.",
    fallbackMessage: "Nossa equipe financeira retornará em horário comercial.",
    agents: [
      { id: "c1", name: "Cobrança IA 1", provider: "OpenRouter", model: "gpt-5.2", apiKey: "sk-***9012", tokenLimit: 600, rateLimit: 60, priority: 1, costMode: "premium", status: "active" },
      { id: "c2", name: "Cobrança IA 2", provider: "Groq", model: "llama-3.3-70b", apiKey: "gsk_***k7", tokenLimit: 800, rateLimit: 120, priority: 2, costMode: "low", status: "active" },
    ],
  },
];

function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>(INITIAL_POOLS);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Pool | null>(null);

  const totals = {
    active: pools.filter((p) => p.status === "active").length,
    agents: pools.reduce((s, p) => s + p.agents.length, 0),
    activeAgents: pools.reduce((s, p) => s + p.agents.filter((a) => a.status === "active").length, 0),
    sessions: pools.reduce((s, p) => s + p.sessions.length, 0),
  };

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (p: Pool) => {
    setEditing(p);
    setEditorOpen(true);
  };
  const togglePool = (id: string) =>
    setPools((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === "active" ? "paused" : "active" } : p)),
    );
  const remove = (id: string) => setPools((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Layers className="h-6 w-6 text-primary" />
            Pools de Agentes IA
          </h1>
          <p className="text-sm text-muted-foreground">
            Agrupe múltiplos agentes por departamento com roteamento por intenção e fallback automático.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Novo pool
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Layers} label="Pools ativos" value={`${totals.active}/${pools.length}`} accent="text-emerald-400" />
        <Stat icon={Bot} label="Agentes no total" value={`${totals.activeAgents}/${totals.agents}`} accent="text-sky-400" />
        <Stat icon={Activity} label="Sessões vinculadas" value={totals.sessions.toString()} accent="text-violet-400" />
        <Stat icon={Shield} label="Fallback humano" value="Ativo" accent="text-amber-400" />
      </div>

      {/* Routing flow */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur">
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Fluxo de roteamento</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <FlowStep label="Mensagem recebida" />
          <FlowArrow />
          <FlowStep label="Detecta intenção" />
          <FlowArrow />
          <FlowStep label="Seleciona pool" />
          <FlowArrow />
          <FlowStep label="Tenta agente por prioridade" />
          <FlowArrow />
          <FlowStep label="Falha? Próximo agente" tone="warn" />
          <FlowArrow />
          <FlowStep label="Todos falharam? Humano" tone="danger" />
          <FlowArrow />
          <FlowStep label="Sem humano? Fallback" tone="muted" />
        </div>
      </div>

      {/* Pools grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {pools.map((p) => (
          <PoolCard
            key={p.id}
            pool={p}
            onEdit={() => openEdit(p)}
            onToggle={() => togglePool(p.id)}
            onDelete={() => remove(p.id)}
          />
        ))}
        <button
          onClick={openNew}
          className="group flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-card/30 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 hover:text-foreground"
        >
          <div className="rounded-full border border-border/60 bg-background/50 p-3 transition-colors group-hover:border-primary/60">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">Criar novo pool</span>
          <span className="text-xs">Agrupe agentes por departamento</span>
        </button>
      </div>

      <PoolEditorDialog open={editorOpen} onOpenChange={setEditorOpen} pool={editing} />
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", accent)} />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function FlowStep({ label, tone }: { label: string; tone?: "warn" | "danger" | "muted" }) {
  const cls =
    tone === "warn"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : tone === "danger"
        ? "border-red-500/30 bg-red-500/10 text-red-200"
        : tone === "muted"
          ? "border-border/60 bg-background/40 text-muted-foreground"
          : "border-primary/30 bg-primary/10 text-primary-foreground/90";
  return <span className={cn("rounded-full border px-3 py-1", cls)}>{label}</span>;
}

function FlowArrow() {
  return <span className="text-muted-foreground/50">→</span>;
}

function PoolCard({
  pool,
  onEdit,
  onToggle,
  onDelete,
}: {
  pool: Pool;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const intent = INTENT_META[pool.intent];
  const Icon = intent.icon;
  const sorted = [...pool.agents].sort((a, b) => a.priority - b.priority);
  const activeCount = pool.agents.filter((a) => a.status === "active").length;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn("rounded-lg border border-border/60 bg-background/60 p-2.5 ring-1", intent.color, intent.ring)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold leading-tight">{pool.name}</h3>
              <Badge
                variant="outline"
                className={
                  pool.status === "active"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }
              >
                <span
                  className={cn(
                    "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                    pool.status === "active" ? "bg-emerald-400" : "bg-amber-400",
                  )}
                />
                {pool.status === "active" ? "Ativo" : "Pausado"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {intent.label} · {activeCount}/{pool.agents.length} agentes ativos
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Settings2 className="mr-2 h-4 w-4" /> Editar pool
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggle}>
              <Power className="mr-2 h-4 w-4" />
              {pool.status === "active" ? "Pausar" : "Ativar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-sm text-muted-foreground">{pool.description}</p>

      {/* Fallback order */}
      <div className="rounded-lg border border-border/60 bg-background/30 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Ordem de fallback
          </span>
          <span className="text-[10px] text-muted-foreground">prioridade ↓</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {sorted.map((a, idx) => (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded-md border border-border/40 bg-card/40 px-2.5 py-1.5"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {idx + 1}
              </span>
              <span className={cn("h-1.5 w-1.5 rounded-full", AGENT_STATUS[a.status].dot)} />
              <span className="flex-1 truncate text-sm font-medium">{a.name}</span>
              <Badge variant="outline" className="border-border/60 text-[10px] text-muted-foreground">
                {a.provider}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px]", COST_META[a.costMode].badge)}>
                {COST_META[a.costMode].label}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
          <UserRoundCheck className="h-3 w-3" />
          Se todos falharem → transfere para humano
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span className="truncate">
          Sessões: {pool.sessions.length > 0 ? pool.sessions.join(", ") : "—"}
        </span>
        <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1.5">
          <Settings2 className="h-3.5 w-3.5" /> Configurar
        </Button>
      </div>
    </div>
  );
}

function PoolEditorDialog({
  open,
  onOpenChange,
  pool,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pool: Pool | null;
}) {
  const [name, setName] = useState(pool?.name ?? "");
  const [intent, setIntent] = useState<Intent>(pool?.intent ?? "sales");
  const [description, setDescription] = useState(pool?.description ?? "");
  const [keywords, setKeywords] = useState(pool?.keywords ?? "");
  const [handoffMessage, setHandoffMessage] = useState(
    pool?.handoffMessage ?? "Vou transferir você para um atendente humano.",
  );
  const [fallbackMessage, setFallbackMessage] = useState(
    pool?.fallbackMessage ?? "Estamos indisponíveis no momento. Retornaremos em breve.",
  );
  const [active, setActive] = useState((pool?.status ?? "active") === "active");
  const [agents, setAgents] = useState<PoolAgent[]>(pool?.agents ?? []);

  const addAgent = () => {
    setAgents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `Agente ${prev.length + 1}`,
        provider: "OpenRouter",
        model: "gpt-5.2",
        apiKey: "",
        tokenLimit: 800,
        rateLimit: 60,
        priority: prev.length + 1,
        costMode: "balanced",
        status: "active",
      },
    ]);
  };

  const updateAgent = (id: string, patch: Partial<PoolAgent>) =>
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const removeAgent = (id: string) => setAgents((prev) => prev.filter((a) => a.id !== id));

  const move = (id: string, dir: -1 | 1) => {
    setAgents((prev) => {
      const sorted = [...prev].sort((a, b) => a.priority - b.priority);
      const idx = sorted.findIndex((a) => a.id === id);
      const target = idx + dir;
      if (target < 0 || target >= sorted.length) return prev;
      const tmp = sorted[idx].priority;
      sorted[idx].priority = sorted[target].priority;
      sorted[target].priority = tmp;
      return [...sorted];
    });
  };

  const sorted = [...agents].sort((a, b) => a.priority - b.priority);
  const IntentIcon = INTENT_META[intent].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            {pool ? "Editar pool" : "Novo pool de agentes"}
          </DialogTitle>
          <DialogDescription>
            Configure roteamento por intenção, ordem de fallback e parâmetros de cada agente.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="routing">Roteamento</TabsTrigger>
              <TabsTrigger value="agents">Agentes & Fallback</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome do pool">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Pool de Vendas" />
                </Field>
                <Field label="Departamento / Intenção">
                  <Select value={intent} onValueChange={(v) => setIntent(v as Intent)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INTENT_META).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Descrição">
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              </Field>
              <div className="flex items-center gap-3 rounded-md border border-input px-3 py-2">
                <Switch checked={active} onCheckedChange={setActive} />
                <div className="flex-1">
                  <Label className="text-sm">Pool ativo</Label>
                  <p className="text-xs text-muted-foreground">
                    Quando inativo, este pool não receberá novas conversas.
                  </p>
                </div>
                <Badge variant="outline" className={cn("gap-1", INTENT_META[intent].color)}>
                  <IntentIcon className="h-3 w-3" />
                  {INTENT_META[intent].label}
                </Badge>
              </div>
            </TabsContent>

            <TabsContent value="routing" className="mt-5 space-y-4">
              <Field label="Palavras-chave / gatilhos de intenção">
                <Textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  rows={3}
                  placeholder="comprar, preço, orçamento..."
                />
              </Field>
              <Field label="Mensagem ao transferir para humano">
                <Textarea
                  value={handoffMessage}
                  onChange={(e) => setHandoffMessage(e.target.value)}
                  rows={2}
                />
              </Field>
              <Field label="Mensagem de fallback (sem humano disponível)">
                <Textarea
                  value={fallbackMessage}
                  onChange={(e) => setFallbackMessage(e.target.value)}
                  rows={2}
                />
              </Field>
              <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <strong className="font-medium">Lógica de fallback:</strong> se um agente falhar, atingir limite,
                  estourar timeout ou o provedor estiver indisponível, o próximo agente da lista é acionado
                  automaticamente. Se todos falharem, a conversa é transferida para um humano.
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agents" className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Ordene os agentes por prioridade. O agente #1 é tentado primeiro.
                </p>
                <Button size="sm" variant="outline" onClick={addAgent} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Adicionar agente
                </Button>
              </div>

              <div className="space-y-2">
                {sorted.length === 0 && (
                  <div className="rounded-md border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                    Nenhum agente neste pool ainda. Clique em "Adicionar agente".
                  </div>
                )}
                {sorted.map((a, idx) => (
                  <AgentRow
                    key={a.id}
                    agent={a}
                    index={idx}
                    isFirst={idx === 0}
                    isLast={idx === sorted.length - 1}
                    onChange={(patch) => updateAgent(a.id, patch)}
                    onRemove={() => removeAgent(a.id)}
                    onMoveUp={() => move(a.id, -1)}
                    onMoveDown={() => move(a.id, 1)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="border-t border-border/60 px-6 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onOpenChange(false)} className="gap-2">
            <Layers className="h-4 w-4" /> Salvar pool
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AgentRow({
  agent,
  index,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  agent: PoolAgent;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<PoolAgent>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border/60 bg-card/40">
      <div className="flex items-center gap-2 px-3 py-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/50" />
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {index + 1}
        </span>
        <span className={cn("h-2 w-2 rounded-full", AGENT_STATUS[agent.status].dot)} />
        <Input
          value={agent.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="h-8 max-w-[200px] border-transparent bg-transparent px-1 font-medium focus-visible:bg-background"
        />
        <Badge variant="outline" className="border-border/60 text-[10px] text-muted-foreground">
          {agent.provider} · {agent.model}
        </Badge>
        <Badge variant="outline" className={cn("text-[10px]", COST_META[agent.costMode].badge)}>
          {COST_META[agent.costMode].label}
        </Badge>
        <div className="ml-auto flex items-center gap-1">
          <Switch
            checked={agent.status === "active"}
            onCheckedChange={(v) => onChange({ status: v ? "active" : "inactive" })}
          />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMoveUp} disabled={isFirst}>
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMoveDown} disabled={isLast}>
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setOpen((v) => !v)}>
            {open ? "Fechar" : "Editar"}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="grid grid-cols-2 gap-3 border-t border-border/60 p-3 lg:grid-cols-3">
          <Field label="Provedor">
            <Select value={agent.provider} onValueChange={(v) => onChange({ provider: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OpenRouter">OpenRouter</SelectItem>
                <SelectItem value="Gemini">Gemini</SelectItem>
                <SelectItem value="Groq">Groq</SelectItem>
                <SelectItem value="Pollinations">Pollinations</SelectItem>
                <SelectItem value="Custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Modelo">
            <Input value={agent.model} onChange={(e) => onChange({ model: e.target.value })} />
          </Field>
          <Field label="API Key">
            <Input
              value={agent.apiKey}
              onChange={(e) => onChange({ apiKey: e.target.value })}
              placeholder="sk-..."
              type="password"
            />
          </Field>
          <Field label="Limite de tokens">
            <Input
              type="number"
              value={agent.tokenLimit}
              onChange={(e) => onChange({ tokenLimit: Number(e.target.value) })}
            />
          </Field>
          <Field label="Rate limit (req/min)">
            <Input
              type="number"
              value={agent.rateLimit}
              onChange={(e) => onChange({ rateLimit: Number(e.target.value) })}
            />
          </Field>
          <Field label="Modo de custo">
            <Select value={agent.costMode} onValueChange={(v) => onChange({ costMode: v as CostMode })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Econômico</SelectItem>
                <SelectItem value="balanced">Balanceado</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      )}
    </div>
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
