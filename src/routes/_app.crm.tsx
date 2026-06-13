import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  MessageSquare,
  Bot,
  User,
  Calendar,
  Tag as TagIcon,
  TrendingUp,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  StickyNote,
  ListTodo,
  Workflow,
  ExternalLink,
  Activity,
  Zap,
  AlertTriangle,
  Trophy,
  Trash2,
  GitBranch,
  Timer,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/crm")({
  head: () => ({ meta: [{ title: "CRM — VEKTOR A.I" }] }),
  component: CrmPage,
});

type StageId =
  | "novo"
  | "qualificando"
  | "negociacao"
  | "proposta"
  | "pagamento"
  | "fechado"
  | "perdido";

type Priority = "baixa" | "media" | "alta";
type Source = "Anúncio Meta" | "Indicação" | "Site" | "WhatsApp" | "Orgânico";

interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  source: Source;
  value: number;
  lastMessage: string;
  nextAction: string;
  stage: StageId;
  priority: Priority;
  tags: string[];
  attendant: string;
  agent: string;
  followUp: string;
  lastInteraction: string;
}

const STAGES: { id: StageId; title: string; accent: string }[] = [
  { id: "novo", title: "Novo lead", accent: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { id: "qualificando", title: "Qualificando", accent: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  { id: "negociacao", title: "Em negociação", accent: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { id: "proposta", title: "Proposta enviada", accent: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  { id: "pagamento", title: "Aguardando pagamento", accent: "bg-yellow-500/15 text-yellow-200 border-yellow-500/30" },
  { id: "fechado", title: "Cliente fechado", accent: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { id: "perdido", title: "Perdido", accent: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
];

const PRIORITY_META: Record<Priority, { label: string; className: string; icon: typeof Flame }> = {
  alta: { label: "Alta", className: "text-rose-300 bg-rose-500/10 border-rose-500/30", icon: Flame },
  media: { label: "Média", className: "text-amber-300 bg-amber-500/10 border-amber-500/30", icon: TrendingUp },
  baixa: { label: "Baixa", className: "text-slate-300 bg-slate-500/10 border-slate-500/30", icon: Clock },
};

const SOURCE_COLORS: Record<Source, string> = {
  "Anúncio Meta": "bg-blue-500/10 text-blue-300 border-blue-500/30",
  "Indicação": "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  "Site": "bg-violet-500/10 text-violet-300 border-violet-500/30",
  "WhatsApp": "bg-green-500/10 text-green-300 border-green-500/30",
  "Orgânico": "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
};

const INITIAL_LEADS: Lead[] = [
  {
    id: "1", name: "Mariana Souza", whatsapp: "+55 11 98765-4321", source: "Anúncio Meta",
    value: 4800, lastMessage: "Tenho interesse no plano Premium", nextAction: "Enviar proposta",
    stage: "novo", priority: "alta", tags: ["Premium", "Quente"], attendant: "Carla",
    agent: "Vendas Pool", followUp: "Hoje, 16h", lastInteraction: "há 12 min",
  },
  {
    id: "2", name: "Rafael Lima", whatsapp: "+55 21 99123-4567", source: "Indicação",
    value: 12500, lastMessage: "Pode me ligar amanhã?", nextAction: "Agendar call",
    stage: "qualificando", priority: "alta", tags: ["Enterprise"], attendant: "João",
    agent: "Vendas IA 1", followUp: "Amanhã, 10h", lastInteraction: "há 1h",
  },
  {
    id: "3", name: "Beatriz Andrade", whatsapp: "+55 31 98888-1122", source: "Site",
    value: 2400, lastMessage: "Qual o prazo de implantação?", nextAction: "Responder dúvida",
    stage: "qualificando", priority: "media", tags: ["PME"], attendant: "Carla",
    agent: "Vendas IA 2", followUp: "Hoje, 18h", lastInteraction: "há 30 min",
  },
  {
    id: "4", name: "Diego Martins", whatsapp: "+55 47 97777-3344", source: "WhatsApp",
    value: 8900, lastMessage: "Vamos fechar a proposta", nextAction: "Enviar contrato",
    stage: "negociacao", priority: "alta", tags: ["VIP", "Recorrente"], attendant: "João",
    agent: "Vendas Backup", followUp: "Hoje, 20h", lastInteraction: "há 5 min",
  },
  {
    id: "5", name: "Luana Pires", whatsapp: "+55 11 96655-4433", source: "Anúncio Meta",
    value: 3200, lastMessage: "Recebi a proposta, vou analisar", nextAction: "Follow-up em 2 dias",
    stage: "proposta", priority: "media", tags: ["Premium"], attendant: "Carla",
    agent: "Vendas Pool", followUp: "Sex, 14h", lastInteraction: "há 3h",
  },
  {
    id: "6", name: "Eduardo Nogueira", whatsapp: "+55 51 95544-2211", source: "Indicação",
    value: 15600, lastMessage: "Aguardando boleto", nextAction: "Reenviar cobrança",
    stage: "pagamento", priority: "alta", tags: ["Enterprise", "Urgente"], attendant: "João",
    agent: "Cobrança IA", followUp: "Hoje, 14h", lastInteraction: "há 2h",
  },
  {
    id: "7", name: "Camila Rocha", whatsapp: "+55 81 94433-1100", source: "Site",
    value: 6700, lastMessage: "Pagamento confirmado, obrigada!", nextAction: "Iniciar onboarding",
    stage: "fechado", priority: "media", tags: ["Cliente novo"], attendant: "Carla",
    agent: "Suporte IA", followUp: "Seg, 9h", lastInteraction: "ontem",
  },
  {
    id: "8", name: "Felipe Aragão", whatsapp: "+55 62 93322-9988", source: "Orgânico",
    value: 1800, lastMessage: "Vou ficar com outro fornecedor", nextAction: "Arquivar",
    stage: "perdido", priority: "baixa", tags: ["Frio"], attendant: "João",
    agent: "Vendas Pool", followUp: "—", lastInteraction: "há 2 dias",
  },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<StageId | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (search && !l.name.toLowerCase().includes(search.toLowerCase()) &&
          !l.whatsapp.includes(search)) return false;
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (priorityFilter !== "all" && l.priority !== priorityFilter) return false;
      return true;
    });
  }, [leads, search, sourceFilter, priorityFilter]);

  const totals = useMemo(() => {
    const open = leads.filter((l) => l.stage !== "fechado" && l.stage !== "perdido");
    const won = leads.filter((l) => l.stage === "fechado");
    return {
      pipeline: open.reduce((s, l) => s + l.value, 0),
      won: won.reduce((s, l) => s + l.value, 0),
      openCount: open.length,
      wonCount: won.length,
    };
  }, [leads]);

  function handleDrop(stage: StageId) {
    if (!draggedId) return;
    setLeads((prev) => prev.map((l) => (l.id === draggedId ? { ...l, stage } : l)));
    setDraggedId(null);
    setDragOverStage(null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border/60 bg-background/60 px-6 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Sparkles className="h-5 w-5 text-primary" />
              Pipeline de Vendas
            </h1>
            <p className="text-sm text-muted-foreground">
              Gestão visual de leads integrada com WhatsApp e agentes IA
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-2 md:flex">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Pipeline aberto</div>
                <div className="text-sm font-semibold text-emerald-300">{formatCurrency(totals.pipeline)}</div>
              </div>
              <Separator orientation="vertical" className="h-9" />
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Fechado</div>
                <div className="text-sm font-semibold">{formatCurrency(totals.won)}</div>
              </div>
              <Separator orientation="vertical" className="h-9" />
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Leads ativos</div>
                <div className="text-sm font-semibold">{totals.openCount}</div>
              </div>
            </div>
            <Dialog open={newLeadOpen} onOpenChange={setNewLeadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" /> Novo lead
                </Button>
              </DialogTrigger>
              <NewLeadDialog
                onCreate={(lead) => {
                  setLeads((prev) => [{ ...lead, id: String(Date.now()) }, ...prev]);
                  setNewLeadOpen(false);
                }}
              />
            </Dialog>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou WhatsApp..."
              className="pl-9"
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas origens</SelectItem>
              <SelectItem value="Anúncio Meta">Anúncio Meta</SelectItem>
              <SelectItem value="Indicação">Indicação</SelectItem>
              <SelectItem value="Site">Site</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Orgânico">Orgânico</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px]">
              <Flame className="h-4 w-4" />
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas prioridades</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban */}
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full min-w-max gap-3 p-4">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage.id);
            const stageTotal = stageLeads.reduce((s, l) => s + l.value, 0);
            const isOver = dragOverStage === stage.id;
            return (
              <div
                key={stage.id}
                className={cn(
                  "flex w-[300px] shrink-0 flex-col rounded-xl border border-border/60 bg-card/30 transition-colors",
                  isOver && "border-primary/60 bg-primary/5",
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStage(stage.id);
                }}
                onDragLeave={() => setDragOverStage((s) => (s === stage.id ? null : s))}
                onDrop={() => handleDrop(stage.id)}
              >
                <div className="shrink-0 border-b border-border/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-md border px-2 py-0.5 text-[11px] font-medium", stage.accent)}>
                        {stage.title}
                      </span>
                      <span className="text-xs text-muted-foreground">{stageLeads.length}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {formatCurrency(stageTotal)}
                  </div>
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                  {stageLeads.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/50 p-6 text-center text-xs text-muted-foreground">
                      Arraste leads para cá
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onDragStart={() => setDraggedId(lead.id)}
                        onClick={() => setSelectedLead(lead)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Sheet open={!!selectedLead} onOpenChange={(o) => !o && setSelectedLead(null)}>
        {selectedLead && <LeadDetailsPanel lead={selectedLead} />}
      </Sheet>
    </div>
  );
}

function LeadCard({
  lead,
  onDragStart,
  onClick,
}: {
  lead: Lead;
  onDragStart: () => void;
  onClick: () => void;
}) {
  const PriorityIcon = PRIORITY_META[lead.priority].icon;
  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="cursor-pointer space-y-2 border-border/60 bg-card/70 p-3 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{lead.name}</div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span className="truncate">{lead.whatsapp}</span>
          </div>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]",
            PRIORITY_META[lead.priority].className,
          )}
        >
          <PriorityIcon className="h-3 w-3" />
          {PRIORITY_META[lead.priority].label}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <span className={cn("rounded border px-1.5 py-0.5 text-[10px]", SOURCE_COLORS[lead.source])}>
          {lead.source}
        </span>
        {lead.tags.slice(0, 2).map((t) => (
          <span key={t} className="rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {t}
          </span>
        ))}
      </div>

      <div className="rounded-md bg-muted/30 p-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider">
          <MessageSquare className="h-3 w-3" /> Última mensagem
        </div>
        <div className="mt-0.5 line-clamp-1 text-foreground/80">{lead.lastMessage}</div>
      </div>

      <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px]">
        <span className="font-semibold text-emerald-300">{formatCurrency(lead.value)}</span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" /> {lead.followUp}
        </span>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Bot className="h-3 w-3 text-primary" /> {lead.agent}
        </span>
        <span>{lead.lastInteraction}</span>
      </div>
    </Card>
  );
}

function LeadDetailsPanel({ lead }: { lead: Lead }) {
  return (
    <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
      <SheetHeader className="shrink-0 border-b border-border/60 p-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border border-border/60">
            <AvatarFallback className="bg-primary/10 text-primary">
              {lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate">{lead.name}</SheetTitle>
            <SheetDescription className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {lead.whatsapp}
            </SheetDescription>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className={cn("rounded border px-1.5 py-0.5 text-[10px]", SOURCE_COLORS[lead.source])}>
                {lead.source}
              </span>
              <span className={cn("rounded border px-1.5 py-0.5 text-[10px]", PRIORITY_META[lead.priority].className)}>
                {PRIORITY_META[lead.priority].label}
              </span>
            </div>
          </div>
        </div>
      </SheetHeader>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <Tabs defaultValue="dados">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4">
            <InfoRow icon={TrendingUp} label="Valor estimado" value={formatCurrency(lead.value)} />
            <InfoRow icon={Calendar} label="Próximo follow-up" value={lead.followUp} />
            <InfoRow icon={Clock} label="Última interação" value={lead.lastInteraction} />
            <InfoRow icon={User} label="Atendente responsável" value={lead.attendant} />
            <InfoRow icon={Bot} label="Agente IA / Pool" value={lead.agent} />
            <InfoRow icon={ArrowRight} label="Próxima ação" value={lead.nextAction} />
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <TagIcon className="h-3 w-3" /> Tags
              </div>
              <div className="flex flex-wrap gap-1">
                {lead.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Workflow className="h-3 w-3" /> Automações ativas
              </div>
              <div className="space-y-1.5">
                <AutomationRow name="Boas-vindas WhatsApp" active />
                <AutomationRow name="Follow-up 48h" active />
                <AutomationRow name="Reativação 7 dias" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="historico" className="space-y-3">
            {[
              { who: "Lead", msg: lead.lastMessage, when: lead.lastInteraction },
              { who: "IA", msg: "Posso te ajudar com mais informações sobre o plano?", when: "há 14 min" },
              { who: "Lead", msg: "Sim, qual o valor mensal?", when: "há 20 min" },
              { who: "IA", msg: "Olá! Vi seu interesse pelo nosso serviço.", when: "há 25 min" },
            ].map((m, i) => (
              <div key={i} className={cn("rounded-lg p-3 text-sm", m.who === "IA" ? "bg-primary/5 border border-primary/20" : "bg-muted/30")}>
                <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {m.who === "IA" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {m.who}
                  </span>
                  <span>{m.when}</span>
                </div>
                {m.msg}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="notas" className="space-y-3">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
              <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <StickyNote className="h-3 w-3" /> Carla • há 2h
              </div>
              Cliente pediu desconto. Aprovado até 10% pelo gestor.
            </div>
            <Textarea placeholder="Adicionar nova nota interna..." rows={4} />
            <Button size="sm" className="w-full">Salvar nota</Button>
          </TabsContent>

          <TabsContent value="tarefas" className="space-y-2">
            {[
              { t: "Enviar proposta personalizada", done: true },
              { t: "Ligar para confirmar interesse", done: false },
              { t: "Agendar reunião de fechamento", done: false },
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 p-2.5 text-sm">
                {task.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <ListTodo className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={cn(task.done && "line-through text-muted-foreground")}>{task.t}</span>
              </div>
            ))}
            <Button size="sm" variant="outline" className="w-full">
              <Plus className="h-4 w-4" /> Nova tarefa
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      <div className="sticky bottom-0 z-10 flex shrink-0 gap-2 border-t border-border/60 bg-background p-4">
        <Button variant="outline" className="flex-1">
          <XCircle className="h-4 w-4" /> Marcar perdido
        </Button>
        <Button className="flex-1">
          <ExternalLink className="h-4 w-4" /> Abrir conversa
        </Button>
      </div>
    </SheetContent>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-card/30 px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function AutomationRow({ name, active }: { name: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/40 bg-card/30 px-3 py-1.5 text-xs">
      <span>{name}</span>
      <span className={cn(
        "rounded px-1.5 py-0.5 text-[10px]",
        active ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : "bg-muted/40 text-muted-foreground",
      )}>
        {active ? "Ativa" : "Pausada"}
      </span>
    </div>
  );
}

function NewLeadDialog({ onCreate }: { onCreate: (lead: Omit<Lead, "id">) => void }) {
  const [form, setForm] = useState<Omit<Lead, "id">>({
    name: "", whatsapp: "", source: "WhatsApp", value: 0,
    lastMessage: "", nextAction: "Primeiro contato", stage: "novo",
    priority: "media", tags: [], attendant: "Carla", agent: "Vendas Pool",
    followUp: "Hoje", lastInteraction: "agora",
  });

  return (
    <DialogContent className="max-w-lg p-0">
      <DialogHeader className="p-6 pb-2">
        <DialogTitle>Novo lead</DialogTitle>
        <DialogDescription>Cadastre um novo lead no pipeline de vendas</DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-4">
        <div className="space-y-1.5">
          <Label>Nome</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
        </div>
        <div className="space-y-1.5">
          <Label>WhatsApp</Label>
          <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+55 11 90000-0000" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Origem</Label>
            <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v as Source })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Anúncio Meta">Anúncio Meta</SelectItem>
                <SelectItem value="Indicação">Indicação</SelectItem>
                <SelectItem value="Site">Site</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Orgânico">Orgânico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Prioridade</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Valor estimado (R$)</Label>
          <Input type="number" value={form.value || ""} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Última mensagem</Label>
          <Textarea rows={2} value={form.lastMessage} onChange={(e) => setForm({ ...form, lastMessage: e.target.value })} placeholder="Resumo da última interação" />
        </div>
      </div>
      <DialogFooter className="border-t border-border/60 px-6 py-4">
        <Button onClick={() => onCreate(form)} disabled={!form.name || !form.whatsapp}>
          Criar lead
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
