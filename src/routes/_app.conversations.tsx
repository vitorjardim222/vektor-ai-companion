import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bot,
  CheckCheck,
  ChevronDown,
  Filter,
  Image as ImageIcon,
  Mic,
  MoreHorizontal,
  Paperclip,
  Phone,
  Pin,
  Play,
  Search,
  Send,
  Smile,
  Sparkles,
  Star,
  Tag,
  UserPlus,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/conversations")({
  head: () => ({ meta: [{ title: "Conversas — VEKTOR A.I" }] }),
  component: ConversationsPage,
});

type Status = "novo" | "qualificado" | "negociacao" | "ganho" | "perdido";
type Channel = "whatsapp" | "instagram";
type MsgType = "text" | "audio" | "image" | "system" | "ai";

interface Message {
  id: string;
  type: MsgType;
  from: "client" | "agent" | "ai" | "system";
  text?: string;
  durationSec?: number;
  time: string;
  read?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  initials: string;
  phone: string;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
  pinned?: boolean;
  channel: Channel;
  tags: string[];
  assignee: string;
  status: Status;
  aiActive: boolean;
  typing?: boolean;
  aiResponding?: boolean;
  source: string;
  notes: string;
  lastInteractions: { label: string; time: string }[];
  automations: { label: string; time: string }[];
  messages: Message[];
}

const STATUS_LABEL: Record<Status, string> = {
  novo: "Novo lead",
  qualificado: "Qualificado",
  negociacao: "Em negociação",
  ganho: "Ganho",
  perdido: "Perdido",
};

const STATUS_COLOR: Record<Status, string> = {
  novo: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  qualificado: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  negociacao: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  ganho: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  perdido: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Mariana Costa",
    initials: "MC",
    phone: "+55 11 98421-7733",
    preview: "Perfeito! Posso fechar pelo Pix ainda hoje?",
    time: "agora",
    unread: 3,
    online: true,
    pinned: true,
    channel: "whatsapp",
    tags: ["Plano Pro", "Pix"],
    assignee: "Você",
    status: "negociacao",
    aiActive: true,
    aiResponding: true,
    source: "Anúncio Meta — Campanha Black",
    notes:
      "Cliente já demonstrou alta intenção. Solicitar dados de faturamento antes do envio do link.",
    lastInteractions: [
      { label: "Visitou /planos", time: "há 12 min" },
      { label: "Abriu o checkout", time: "há 8 min" },
      { label: "Respondeu ao IA", time: "há 1 min" },
    ],
    automations: [
      { label: "Boas-vindas WhatsApp", time: "10:42" },
      { label: "Qualificação por IA", time: "10:45" },
      { label: "Envio de proposta", time: "11:02" },
    ],
    messages: [
      { id: "m1", type: "system", from: "system", text: "Conversa atribuída a Você", time: "10:40" },
      { id: "m2", type: "text", from: "client", text: "Oi! Vi o anúncio sobre automação no WhatsApp.", time: "10:41" },
      { id: "m3", type: "ai", from: "ai", text: "Oi, Mariana! Sou o assistente da VEKTOR. Posso te explicar como funciona em 1 minuto?", time: "10:41" },
      { id: "m4", type: "text", from: "client", text: "Pode sim, e quero saber sobre integração com meu CRM.", time: "10:43" },
      { id: "m5", type: "audio", from: "client", durationSec: 32, time: "10:44" },
      { id: "m6", type: "ai", from: "ai", text: "Integramos nativamente com HubSpot, RD, Pipedrive e Salesforce. Quer ver uma demo?", time: "10:45" },
      { id: "m7", type: "text", from: "agent", text: "Oi Mariana, aqui é o time da VEKTOR. Posso enviar a proposta personalizada agora mesmo.", time: "11:01", read: true },
      { id: "m8", type: "text", from: "client", text: "Perfeito! Posso fechar pelo Pix ainda hoje?", time: "11:02" },
    ],
  },
  {
    id: "2",
    name: "Rafael Andrade",
    initials: "RA",
    phone: "+55 21 99812-4410",
    preview: "Mensagem de voz",
    time: "5 min",
    unread: 1,
    online: true,
    channel: "whatsapp",
    tags: ["Enterprise"],
    assignee: "Júlia Reis",
    status: "qualificado",
    aiActive: false,
    typing: true,
    source: "Indicação parceiro",
    notes: "Solicitou contrato com SLA enterprise e SSO via Azure AD.",
    lastInteractions: [
      { label: "Agendou reunião", time: "ontem" },
      { label: "Recebeu proposta", time: "hoje 09:11" },
    ],
    automations: [{ label: "Follow-up D+1", time: "09:00" }],
    messages: [
      { id: "m1", type: "text", from: "client", text: "Bom dia, podemos avançar com o contrato?", time: "09:10" },
      { id: "m2", type: "audio", from: "client", durationSec: 18, time: "09:11" },
    ],
  },
  {
    id: "3",
    name: "Loja Bela Moda",
    initials: "LB",
    phone: "+55 31 98777-1029",
    preview: "Vocês têm plano para múltiplas lojas?",
    time: "12 min",
    unread: 0,
    online: false,
    channel: "instagram",
    tags: ["Varejo", "Multi-loja"],
    assignee: "Lucas Prado",
    status: "novo",
    aiActive: true,
    source: "Instagram Direct",
    notes: "",
    lastInteractions: [{ label: "Primeira mensagem", time: "12 min" }],
    automations: [{ label: "Qualificação por IA", time: "agora" }],
    messages: [
      { id: "m1", type: "text", from: "client", text: "Vocês têm plano para múltiplas lojas?", time: "agora" },
    ],
  },
  {
    id: "4",
    name: "Carlos Henrique",
    initials: "CH",
    phone: "+55 11 91122-8844",
    preview: "Fechado! Obrigado pelo atendimento.",
    time: "1 h",
    unread: 0,
    online: false,
    channel: "whatsapp",
    tags: ["Pix pago"],
    assignee: "Você",
    status: "ganho",
    aiActive: false,
    source: "Google Ads",
    notes: "Pagamento confirmado. Onboarding agendado para quinta.",
    lastInteractions: [{ label: "Pagamento aprovado", time: "1 h" }],
    automations: [{ label: "Envio de NF-e", time: "automático" }],
    messages: [
      { id: "m1", type: "text", from: "client", text: "Fechado! Obrigado pelo atendimento.", time: "13:20" },
    ],
  },
  {
    id: "5",
    name: "Aline Vasques",
    initials: "AV",
    phone: "+55 47 98821-3344",
    preview: "Vou pensar e te retorno semana que vem.",
    time: "3 h",
    unread: 0,
    online: false,
    channel: "whatsapp",
    tags: ["Frio"],
    assignee: "Não atribuído",
    status: "perdido",
    aiActive: true,
    source: "Landing page /pro",
    notes: "Sem orçamento aprovado para o trimestre.",
    lastInteractions: [{ label: "Encerrou conversa", time: "3 h" }],
    automations: [{ label: "Nutrição em 30 dias", time: "agendado" }],
    messages: [
      { id: "m1", type: "text", from: "client", text: "Vou pensar e te retorno semana que vem.", time: "10:01" },
    ],
  },
  {
    id: "6",
    name: "Studio Yoga Zen",
    initials: "SY",
    phone: "+55 11 95566-7788",
    preview: "Imagem recebida",
    time: "ontem",
    unread: 0,
    online: false,
    channel: "whatsapp",
    tags: ["Bem-estar"],
    assignee: "Júlia Reis",
    status: "qualificado",
    aiActive: true,
    source: "Indicação cliente",
    notes: "Interessado em white-label.",
    lastInteractions: [{ label: "Enviou logo", time: "ontem 18:40" }],
    automations: [],
    messages: [
      { id: "m1", type: "image", from: "client", text: "logo-studio.png", time: "ontem" },
    ],
  },
];

const FILTERS = ["Todas", "Não lidas", "Atribuídas a mim", "IA ativa", "Sem resposta"];

function ChannelDot({ channel }: { channel: Channel }) {
  return (
    <span
      className={cn(
        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar",
        channel === "whatsapp" ? "bg-emerald-400" : "bg-pink-400",
      )}
    />
  );
}

function ConversationsPage() {
  const [activeId, setActiveId] = useState(CONVERSATIONS[0].id);
  const [filter, setFilter] = useState("Todas");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const filtered = useMemo(() => {
    return CONVERSATIONS.filter((c) => {
      if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (filter === "Não lidas") return c.unread > 0;
      if (filter === "Atribuídas a mim") return c.assignee === "Você";
      if (filter === "IA ativa") return c.aiActive;
      if (filter === "Sem resposta") return c.messages.at(-1)?.from === "client";
      return true;
    });
  }, [filter, query]);

  const active = CONVERSATIONS.find((c) => c.id === activeId) ?? CONVERSATIONS[0];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="-m-6 flex h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
        {/* LEFT — conversation list */}
        <aside className="flex w-[340px] shrink-0 flex-col border-r border-border bg-sidebar/40">
          <div className="space-y-3 border-b border-border px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-lg font-semibold tracking-tight">Inbox</h1>
                <p className="text-xs text-muted-foreground">
                  {CONVERSATIONS.reduce((a, c) => a + c.unread, 0)} não lidas ·{" "}
                  {CONVERSATIONS.length} conversas
                </p>
              </div>
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Filtros avançados</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nova conversa</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar contato, tag, telefone…"
                className="h-9 pl-8"
              />
            </div>

            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="h-8 w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
                {FILTERS.map((f) => (
                  <TabsTrigger
                    key={f}
                    value={f}
                    className="h-7 rounded-full border border-transparent px-3 text-xs data-[state=active]:border-border data-[state=active]:bg-muted"
                  >
                    {f}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            <ul className="px-2 py-2">
              {filtered.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setActiveId(c.id)}
                      className={cn(
                        "group relative flex w-full gap-3 rounded-xl px-2.5 py-2.5 text-left transition",
                        isActive
                          ? "bg-muted/70 ring-1 ring-border"
                          : "hover:bg-muted/40",
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-primary/40 to-accent/40 text-xs font-semibold">
                            {c.initials}
                          </AvatarFallback>
                        </Avatar>
                        {c.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-emerald-400" />
                        )}
                        {!c.online && <ChannelDot channel={c.channel} />}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 truncate text-sm font-medium">
                            {c.pinned && <Pin className="h-3 w-3 text-accent" />}
                            {c.name}
                          </span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">{c.time}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                            {c.aiResponding && (
                              <Sparkles className="h-3 w-3 shrink-0 text-accent" />
                            )}
                            {c.typing ? (
                              <span className="text-accent">digitando…</span>
                            ) : (
                              <span className="truncate">{c.preview}</span>
                            )}
                          </span>
                          {c.unread > 0 && (
                            <Badge className="h-5 min-w-5 rounded-full border-0 bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground">
                              {c.unread}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-1">
                          {c.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </aside>

        {/* CENTER — active chat */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* chat header */}
          <header className="flex items-center justify-between gap-3 border-b border-border bg-card/40 px-5 py-3 backdrop-blur">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary/40 to-accent/40 text-xs font-semibold">
                    {active.initials}
                  </AvatarFallback>
                </Avatar>
                {active.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-display text-base font-semibold">{active.name}</h2>
                  <Badge variant="outline" className={cn("h-5 border px-1.5 text-[10px]", STATUS_COLOR[active.status])}>
                    {STATUS_LABEL[active.status]}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {active.phone} ·{" "}
                  {active.online ? (
                    <span className="text-emerald-400">online</span>
                  ) : (
                    <span>visto por último há pouco</span>
                  )}{" "}
                  · atribuído a <span className="text-foreground">{active.assignee}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div className="mr-2 flex items-center gap-2 rounded-full border border-border bg-muted/40 px-2.5 py-1">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs text-muted-foreground">IA</span>
                <Switch defaultChecked={active.aiActive} className="scale-75" />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ligar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Vídeo</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5">
                    <Users className="h-4 w-4" />
                    Transferir
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Passar para humano</TooltipContent>
              </Tooltip>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* messages */}
          <ScrollArea className="flex-1">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-8 py-8 2xl:max-w-5xl">
              <div className="self-center rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground">
                Hoje
              </div>

              {active.messages.map((m) => {
                if (m.type === "system") {
                  return (
                    <div key={m.id} className="self-center text-[11px] text-muted-foreground">
                      — {m.text} · {m.time} —
                    </div>
                  );
                }

                const isMine = m.from === "agent" || m.from === "ai";
                const isAI = m.from === "ai";

                return (
                  <div
                    key={m.id}
                    className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[72%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm",
                        isAI
                          ? "border border-accent/30 bg-accent/10 text-foreground"
                          : isMine
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-card text-foreground",
                      )}
                    >
                      {isAI && (
                        <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-accent">
                          <Sparkles className="h-3 w-3" />
                          Resposta automática · Agente IA
                        </div>
                      )}

                      {m.type === "text" && <p className="leading-relaxed">{m.text}</p>}

                      {m.type === "ai" && <p className="leading-relaxed">{m.text}</p>}

                      {m.type === "audio" && (
                        <div className="flex items-center gap-3 py-1">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-background/20 hover:bg-background/30"
                          >
                            <Play className="h-4 w-4 fill-current" />
                          </Button>
                          <div className="flex h-6 items-end gap-0.5">
                            {Array.from({ length: 22 }).map((_, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "w-0.5 rounded-full",
                                  isMine ? "bg-primary-foreground/60" : "bg-foreground/40",
                                )}
                                style={{ height: `${20 + Math.sin(i * 1.3) * 60 + Math.random() * 20}%` }}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] opacity-70">0:{String(m.durationSec).padStart(2, "0")}</span>
                        </div>
                      )}

                      {m.type === "image" && (
                        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-xs">
                          <ImageIcon className="h-4 w-4" />
                          {m.text ?? "imagem.png"}
                        </div>
                      )}

                      <div
                        className={cn(
                          "mt-1 flex items-center justify-end gap-1 text-[10px]",
                          isMine ? "text-primary-foreground/70" : "text-muted-foreground",
                          isAI && "text-muted-foreground",
                        )}
                      >
                        {m.time}
                        {isMine && !isAI && <CheckCheck className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {active.aiResponding && (
                <div className="flex items-center gap-2 self-start rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs text-accent">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  Agente IA respondendo…
                </div>
              )}
              {active.typing && (
                <div className="flex items-center gap-2 self-start rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                  </span>
                  {active.name.split(" ")[0]} está digitando
                </div>
              )}
            </div>
          </ScrollArea>

          {/* composer */}
          <div className="border-t border-border bg-card/40 px-5 py-3 backdrop-blur">
            <div className="mb-2 flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-full text-xs">
                <Zap className="h-3.5 w-3.5 text-accent" />
                Respostas rápidas
              </Button>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-full text-xs">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Sugerir resposta IA
              </Button>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-full text-xs">
                <Tag className="h-3.5 w-3.5" />
                Adicionar tag
              </Button>
            </div>

            <div className="flex items-end gap-2 rounded-2xl border border-border bg-background/60 px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Mensagem para ${active.name.split(" ")[0]}…`}
                rows={1}
                className="min-h-[36px] resize-none border-0 bg-transparent p-1.5 text-sm shadow-none focus-visible:ring-0"
              />
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <Mic className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-9 w-9 shrink-0 cta-primary">
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <p className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-2">
                <Bot className="h-3 w-3 text-accent" />
                Nota interna desativada — esta mensagem será enviada ao contato
              </span>
              <span>Enter para enviar · Shift+Enter quebra linha</span>
            </p>
          </div>
        </section>

        {/* RIGHT — context */}
        <aside className="hidden w-[300px] shrink-0 flex-col border-l border-border bg-sidebar/40 lg:flex 2xl:w-[340px]">
          <ScrollArea className="flex-1">
            <div className="space-y-5 p-5">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-primary/40 to-accent/40 text-base font-semibold">
                    {active.initials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-3 font-display text-base font-semibold">{active.name}</h3>
                <p className="text-xs text-muted-foreground">{active.phone}</p>
                <div className="mt-3 flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                    <Star className="h-3 w-3" /> Favoritar
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                    <UserPlus className="h-3 w-3" /> Atribuir
                  </Button>
                </div>
              </div>

              <Separator />

              <Section title="Status do lead">
                <button className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs", STATUS_COLOR[active.status])}>
                    {STATUS_LABEL[active.status]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {(["novo", "qualificado", "negociacao", "ganho", "perdido"] as Status[]).map(
                    (s, i, arr) => {
                      const activeIdx = arr.indexOf(active.status);
                      return (
                        <div
                          key={s}
                          className={cn(
                            "h-1.5 rounded-full",
                            i <= activeIdx ? "bg-gradient-to-r from-primary to-accent" : "bg-muted",
                          )}
                        />
                      );
                    },
                  )}
                </div>
              </Section>

              <Section title="Tags">
                <div className="flex flex-wrap gap-1.5">
                  {active.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] text-accent"
                    >
                      {t}
                    </span>
                  ))}
                  <button className="rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted/40">
                    + adicionar
                  </button>
                </div>
              </Section>

              <Section title="Origem do lead">
                <p className="text-sm text-foreground">{active.source}</p>
              </Section>

              <Section title="Notas internas">
                <Textarea
                  defaultValue={active.notes}
                  placeholder="Escreva uma nota visível apenas para o time…"
                  className="min-h-[80px] resize-none text-sm"
                />
              </Section>

              <Section title="Últimas interações">
                <ul className="space-y-2">
                  {active.lastInteractions.map((i, k) => (
                    <li key={k} className="flex items-start gap-2 text-xs">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <div className="flex-1">
                        <p className="text-foreground">{i.label}</p>
                        <p className="text-muted-foreground">{i.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Histórico de automações">
                <ul className="space-y-2">
                  {active.automations.map((a, k) => (
                    <li
                      key={k}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs"
                    >
                      <span className="flex items-center gap-2 text-foreground">
                        <Zap className="h-3 w-3 text-accent" />
                        {a.label}
                      </span>
                      <span className="text-muted-foreground">{a.time}</span>
                    </li>
                  ))}
                  {active.automations.length === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma automação executada.</p>
                  )}
                </ul>
              </Section>
            </div>
          </ScrollArea>
        </aside>
      </div>
    </TooltipProvider>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}
