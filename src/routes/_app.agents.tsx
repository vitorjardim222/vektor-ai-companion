import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bot,
  Plus,
  Play,
  Pause,
  FileText,
  Settings2,
  MessageSquare,
  Activity,
  Clock,
  TrendingUp,
  UserRoundCheck,
  Sparkles,
  Send,
  Smartphone,
  MoreVertical,
  Copy,
  Trash2,
  Headphones,
  ShoppingCart,
  Calendar,
  Receipt,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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

export const Route = createFileRoute("/_app/agents")({
  head: () => ({ meta: [{ title: "Agentes IA — VEKTOR A.I" }] }),
  component: AgentsPage,
});

type AgentStatus = "active" | "paused" | "draft";
type AgentType = "sales" | "support" | "billing" | "scheduling" | "custom";

interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  status: AgentStatus;
  sessions: string[];
  conversationsToday: number;
  resolutionRate: number;
  avgResponse: string;
  escalationRate: number;
  provider: string;
  model: string;
}

const TYPE_META: Record<AgentType, { label: string; icon: any; color: string }> = {
  sales: { label: "Vendas", icon: ShoppingCart, color: "text-emerald-400" },
  support: { label: "Suporte", icon: Headphones, color: "text-sky-400" },
  billing: { label: "Cobrança", icon: Receipt, color: "text-amber-400" },
  scheduling: { label: "Agendamento", icon: Calendar, color: "text-violet-400" },
  custom: { label: "Personalizado", icon: Wand2, color: "text-pink-400" },
};

const STATUS_META: Record<AgentStatus, { label: string; dot: string; badge: string }> = {
  active: {
    label: "Ativo",
    dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  paused: {
    label: "Pausado",
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  draft: {
    label: "Rascunho",
    dot: "bg-zinc-500",
    badge: "bg-zinc-500/10 text-zinc-300 border-zinc-500/30",
  },
};

const INITIAL_AGENTS: Agent[] = [
  {
    id: "1",
    name: "Vektor Vendas",
    description: "Qualifica leads, envia catálogo e fecha pedidos no WhatsApp.",
    type: "sales",
    status: "active",
    sessions: ["Comercial SP", "Comercial RJ"],
    conversationsToday: 184,
    resolutionRate: 87,
    avgResponse: "4s",
    escalationRate: 12,
    provider: "OpenRouter",
    model: "gpt-5.2",
  },
  {
    id: "2",
    name: "Suporte Nível 1",
    description: "Atende dúvidas frequentes e abre tickets quando necessário.",
    type: "support",
    status: "active",
    sessions: ["Suporte Geral"],
    conversationsToday: 92,
    resolutionRate: 74,
    avgResponse: "6s",
    escalationRate: 22,
    provider: "Gemini",
    model: "gemini-3-flash-preview",
  },
  {
    id: "3",
    name: "Régua de Cobrança",
    description: "Lembretes amigáveis de boletos vencendo e renegociação.",
    type: "billing",
    status: "paused",
    sessions: ["Financeiro"],
    conversationsToday: 0,
    resolutionRate: 68,
    avgResponse: "5s",
    escalationRate: 18,
    provider: "Groq",
    model: "llama-3.3-70b",
  },
  {
    id: "4",
    name: "Agenda Clínica",
    description: "Agenda, confirma e remarca consultas automaticamente.",
    type: "scheduling",
    status: "draft",
    sessions: [],
    conversationsToday: 0,
    resolutionRate: 0,
    avgResponse: "—",
    escalationRate: 0,
    provider: "OpenRouter",
    model: "gpt-5-mini",
  },
];

function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);

  const totals = {
    active: agents.filter((a) => a.status === "active").length,
    convs: agents.reduce((s, a) => s + a.conversationsToday, 0),
    resolution: Math.round(
      agents.filter((a) => a.resolutionRate > 0).reduce((s, a) => s + a.resolutionRate, 0) /
        Math.max(1, agents.filter((a) => a.resolutionRate > 0).length),
    ),
    escalation: Math.round(
      agents.filter((a) => a.escalationRate > 0).reduce((s, a) => s + a.escalationRate, 0) /
        Math.max(1, agents.filter((a) => a.escalationRate > 0).length),
    ),
  };

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (a: Agent) => {
    setEditing(a);
    setEditorOpen(true);
  };
  const toggleStatus = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "active" ? "paused" : "active" }
          : a,
      ),
    );
  };
  const duplicate = (a: Agent) => {
    setAgents((prev) => [
      ...prev,
      { ...a, id: crypto.randomUUID(), name: `${a.name} (cópia)`, status: "draft" },
    ]);
  };
  const remove = (id: string) => setAgents((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Bot className="h-6 w-6 text-primary" />
            Agentes IA
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie, configure e monitore agentes inteligentes da VEKTOR A.I.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Novo agente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Activity}
          label="Agentes ativos"
          value={`${totals.active}/${agents.length}`}
          accent="text-emerald-400"
        />
        <StatCard
          icon={MessageSquare}
          label="Conversas hoje"
          value={totals.convs.toString()}
          accent="text-sky-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Taxa de resolução"
          value={`${totals.resolution}%`}
          accent="text-violet-400"
        />
        <StatCard
          icon={UserRoundCheck}
          label="Escalonamento médio"
          value={`${totals.escalation}%`}
          accent="text-amber-400"
        />
      </div>

      {/* Agents grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((a) => (
          <AgentCard
            key={a.id}
            agent={a}
            onEdit={() => openEdit(a)}
            onToggle={() => toggleStatus(a.id)}
            onDuplicate={() => duplicate(a)}
            onDelete={() => remove(a.id)}
          />
        ))}
        <button
          onClick={openNew}
          className="group flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-card/30 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 hover:text-foreground"
        >
          <div className="rounded-full border border-border/60 bg-background/50 p-3 transition-colors group-hover:border-primary/60">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">Criar novo agente</span>
          <span className="text-xs">Use um template ou comece do zero</span>
        </button>
      </div>

      <AgentEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        agent={editing}
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
    <div className="rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", accent)} />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function AgentCard({
  agent,
  onEdit,
  onToggle,
  onDuplicate,
  onDelete,
}: {
  agent: Agent;
  onEdit: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const type = TYPE_META[agent.type];
  const status = STATUS_META[agent.status];
  const TypeIcon = type.icon;

  return (
    <div className="group relative flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn("rounded-lg border border-border/60 bg-background/60 p-2", type.color)}>
            <TypeIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold leading-tight">{agent.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{type.label}</p>
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
              <Settings2 className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggle}>
              {agent.status === "active" ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pausar
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Ativar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" /> Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{agent.description}</p>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={status.badge}>
          <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", status.dot)} />
          {status.label}
        </Badge>
        <Badge variant="outline" className="border-border/60 text-muted-foreground">
          {agent.provider} · {agent.model}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-3 text-sm">
        <Metric icon={MessageSquare} label="Conversas" value={agent.conversationsToday} />
        <Metric icon={TrendingUp} label="Resolução" value={`${agent.resolutionRate}%`} />
        <Metric icon={Clock} label="Resposta" value={agent.avgResponse} />
        <Metric icon={UserRoundCheck} label="Escalonamento" value={`${agent.escalationRate}%`} />
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Smartphone className="h-3.5 w-3.5" />
          {agent.sessions.length > 0 ? agent.sessions.join(", ") : "Nenhuma sessão vinculada"}
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1.5">
          <Settings2 className="h-3.5 w-3.5" /> Configurar
        </Button>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}

function AgentEditorDialog({
  open,
  onOpenChange,
  agent,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agent: Agent | null;
}) {
  const [name, setName] = useState(agent?.name ?? "");
  const [description, setDescription] = useState(agent?.description ?? "");
  const [personality, setPersonality] = useState("Cordial, objetivo e proativo.");
  const [objective, setObjective] = useState("Qualificar e converter leads em vendas.");
  const [systemPrompt, setSystemPrompt] = useState(
    "Você é um agente de vendas da VEKTOR A.I. Atenda no WhatsApp de forma humana, breve e empática.",
  );
  const [rules, setRules] = useState("- Sempre confirmar nome e cidade\n- Oferecer demonstração\n- Encaminhar para humano em > R$ 5.000");
  const [forbidden, setForbidden] = useState("Política, religião, preços de concorrentes.");
  const [handoff, setHandoff] = useState("Quando cliente pedir humano, mencionar reclamação ou ANS.");
  const [hoursStart, setHoursStart] = useState("08:00");
  const [hoursEnd, setHoursEnd] = useState("20:00");
  const [delay, setDelay] = useState([3]);
  const [provider, setProvider] = useState(agent?.provider ?? "OpenRouter");
  const [model, setModel] = useState(agent?.model ?? "gpt-5.2");
  const [temperature, setTemperature] = useState([0.6]);
  const [maxTokens, setMaxTokens] = useState([800]);
  const [active, setActive] = useState(agent?.status === "active");
  const [type, setType] = useState<AgentType>(agent?.type ?? "sales");

  // test chat
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState<{ role: "user" | "agent"; text: string }[]>([
    { role: "agent", text: "Olá! Sou o agente VEKTOR. Em que posso ajudar hoje?" },
  ]);

  const sendTest = () => {
    if (!testInput.trim()) return;
    const userMsg = testInput.trim();
    setTestMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setTestInput("");
    setTimeout(() => {
      setTestMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: "Entendi! (resposta simulada — conecte um provedor para respostas reais.)",
        },
      ]);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {agent ? "Editar agente" : "Novo agente"}
          </DialogTitle>
          <DialogDescription>
            Configure personalidade, regras de negócio e provedor de IA.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[70vh] grid-cols-1 overflow-hidden lg:grid-cols-[1fr_360px]">
          {/* Editor */}
          <div className="overflow-y-auto p-6">
            <Tabs defaultValue="identity" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="identity">Identidade</TabsTrigger>
                <TabsTrigger value="behavior">Comportamento</TabsTrigger>
                <TabsTrigger value="rules">Regras</TabsTrigger>
                <TabsTrigger value="model">Modelo</TabsTrigger>
              </TabsList>

              <TabsContent value="identity" className="mt-5 space-y-4">
                <Field label="Nome do agente">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Vektor Vendas" />
                </Field>
                <Field label="Descrição">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Resumo curto do que o agente faz"
                    rows={2}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tipo">
                    <Select value={type} onValueChange={(v) => setType(v as AgentType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(TYPE_META).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Status">
                    <div className="flex h-9 items-center gap-2 rounded-md border border-input px-3">
                      <Switch checked={active} onCheckedChange={setActive} />
                      <span className="text-sm">{active ? "Ativo" : "Pausado"}</span>
                    </div>
                  </Field>
                </div>
                <Field label="Personalidade">
                  <Textarea value={personality} onChange={(e) => setPersonality(e.target.value)} rows={2} />
                </Field>
                <Field label="Objetivo principal">
                  <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={2} />
                </Field>
              </TabsContent>

              <TabsContent value="behavior" className="mt-5 space-y-4">
                <Field label="System prompt">
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={8}
                    className="font-mono text-xs"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Início do expediente">
                    <Input type="time" value={hoursStart} onChange={(e) => setHoursStart(e.target.value)} />
                  </Field>
                  <Field label="Fim do expediente">
                    <Input type="time" value={hoursEnd} onChange={(e) => setHoursEnd(e.target.value)} />
                  </Field>
                </div>
                <Field label={`Simulação de delay de resposta: ${delay[0]}s`}>
                  <Slider value={delay} onValueChange={setDelay} min={0} max={15} step={1} />
                </Field>
              </TabsContent>

              <TabsContent value="rules" className="mt-5 space-y-4">
                <Field label="Regras de negócio">
                  <Textarea value={rules} onChange={(e) => setRules(e.target.value)} rows={5} />
                </Field>
                <Field label="Tópicos proibidos">
                  <Textarea value={forbidden} onChange={(e) => setForbidden(e.target.value)} rows={3} />
                </Field>
                <Field label="Regras de transferência para humano">
                  <Textarea value={handoff} onChange={(e) => setHandoff(e.target.value)} rows={3} />
                </Field>
              </TabsContent>

              <TabsContent value="model" className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Provedor">
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-5.2" />
                  </Field>
                </div>
                <Field label={`Temperatura: ${temperature[0].toFixed(2)}`}>
                  <Slider value={temperature} onValueChange={setTemperature} min={0} max={1} step={0.05} />
                </Field>
                <Field label={`Máximo de tokens: ${maxTokens[0]}`}>
                  <Slider value={maxTokens} onValueChange={setMaxTokens} min={100} max={4000} step={100} />
                </Field>
              </TabsContent>
            </Tabs>
          </div>

          {/* Test panel */}
          <div className="flex min-h-0 flex-col border-t border-border/60 bg-background/40 lg:border-l lg:border-t-0">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Testar agente</span>
              <Badge variant="outline" className="ml-auto border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                Preview
              </Badge>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {testMessages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-card border border-border/60",
                  )}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border/60 p-3">
              <Input
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendTest()}
                placeholder="Digite uma mensagem de teste..."
              />
              <Button size="icon" onClick={sendTest}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 px-6 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" /> Salvar rascunho
          </Button>
          <Button className="gap-2" onClick={() => onOpenChange(false)}>
            <Sparkles className="h-4 w-4" /> Salvar agente
          </Button>
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
