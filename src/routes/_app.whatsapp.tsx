import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Smartphone,
  Plus,
  QrCode,
  RefreshCw,
  Power,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Bot,
  Activity,
  Clock,
  MessageSquare,
  MoreVertical,
  Wifi,
  WifiOff,
  ShieldCheck,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/whatsapp")({
  head: () => ({ meta: [{ title: "WhatsApp — VEKTOR A.I" }] }),
  component: WhatsAppPage,
});

type Status = "connected" | "disconnected" | "connecting" | "error";

interface Session {
  id: string;
  name: string;
  phone: string;
  status: Status;
  health: number;
  lastSync: string;
  messagesToday: number;
  agent: string;
  autoReconnect: boolean;
}

const SEED: Session[] = [
  {
    id: "1",
    name: "Atendimento Comercial",
    phone: "+55 11 98765-4321",
    status: "connected",
    health: 98,
    lastSync: "há 12 segundos",
    messagesToday: 1847,
    agent: "Vendas Pro",
    autoReconnect: true,
  },
  {
    id: "2",
    name: "Suporte Técnico",
    phone: "+55 11 91234-5678",
    status: "connected",
    health: 92,
    lastSync: "há 4 minutos",
    messagesToday: 624,
    agent: "Suporte IA",
    autoReconnect: true,
  },
  {
    id: "3",
    name: "Pós-Venda",
    phone: "+55 21 99887-7766",
    status: "connecting",
    health: 60,
    lastSync: "agora",
    messagesToday: 91,
    agent: "Atendimento Geral",
    autoReconnect: true,
  },
  {
    id: "4",
    name: "Recuperação Carrinho",
    phone: "+55 31 98555-1122",
    status: "error",
    health: 22,
    lastSync: "há 2 horas",
    messagesToday: 0,
    agent: "Remarketing IA",
    autoReconnect: false,
  },
  {
    id: "5",
    name: "Backup / Reserva",
    phone: "+55 11 90000-0000",
    status: "disconnected",
    health: 0,
    lastSync: "ontem 18:42",
    messagesToday: 0,
    agent: "—",
    autoReconnect: false,
  },
];

const STATUS_META: Record<Status, { label: string; color: string; dot: string; icon: typeof Wifi }> = {
  connected: {
    label: "Conectado",
    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,.6)]",
    icon: Wifi,
  },
  connecting: {
    label: "Conectando",
    color: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    dot: "bg-amber-400 animate-pulse",
    icon: Loader2,
  },
  disconnected: {
    label: "Desconectado",
    color: "border-muted-foreground/20 bg-muted/30 text-muted-foreground",
    dot: "bg-muted-foreground/60",
    icon: WifiOff,
  },
  error: {
    label: "Erro",
    color: "border-red-500/30 bg-red-500/10 text-red-400",
    dot: "bg-red-500 animate-pulse",
    icon: AlertTriangle,
  },
};

function WhatsAppPage() {
  const [sessions, setSessions] = useState<Session[]>(SEED);
  const [qrOpen, setQrOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const openQR = (s?: Session) => {
    setActiveSession(s ?? null);
    setQrOpen(true);
  };

  const toggleAuto = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, autoReconnect: !s.autoReconnect } : s)),
    );
  };

  const reconnect = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "connecting" } : s)),
    );
    toast.success("Reconectando sessão...");
  };

  const disconnect = (id: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "disconnected", health: 0, messagesToday: 0 } : s,
      ),
    );
    toast("Sessão desconectada");
  };

  const total = sessions.length;
  const connected = sessions.filter((s) => s.status === "connected").length;
  const messages = sessions.reduce((acc, s) => acc + s.messagesToday, 0);
  const avgHealth = Math.round(
    sessions.filter((s) => s.status === "connected").reduce((a, s) => a + s.health, 0) /
      Math.max(connected, 1),
  );

  const summary = [
    { label: "Números conectados", value: `${connected} / ${total}`, icon: Smartphone, accent: "text-emerald-400" },
    { label: "Mensagens hoje", value: messages.toLocaleString("pt-BR"), icon: MessageSquare, accent: "text-primary" },
    { label: "Saúde média", value: `${avgHealth}%`, icon: Activity, accent: "text-accent" },
    { label: "Segurança", value: "TLS 1.3", icon: ShieldCheck, accent: "text-emerald-400" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Sessões de WhatsApp</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie conexões multi-número, status em tempo real e agentes de IA associados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast("Status atualizado")}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button className="cta-primary" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Adicionar número
          </Button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border border-border glass-panel p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10", s.accent)}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Quick connect */}
      <div className="relative overflow-hidden rounded-2xl border border-border glass-panel p-6">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-[var(--shadow-glow)]">
              <QrCode className="h-6 w-6 text-accent" />
            </div>
            <div className="max-w-xl">
              <h3 className="font-display text-lg font-semibold">Conectar novo WhatsApp</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Gere um QR Code seguro e escaneie pelo aparelho. A sessão fica vinculada
                ao seu workspace e roda 24/7 com auto-reconexão.
              </p>
            </div>
          </div>
          <Button className="cta-primary" onClick={() => openQR()}>
            <QrCode className="h-4 w-4" />
            Gerar QR Code
          </Button>
        </div>
      </div>

      {/* SESSIONS GRID */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sessions.map((s) => {
          const meta = STATUS_META[s.status];
          const Icon = meta.icon;
          return (
            <div
              key={s.id}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border glass-panel p-5 transition hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Smartphone className="h-5 w-5" />
                    <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card", meta.dot)} />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.phone}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => openQR(s)}>
                      <QrCode className="h-4 w-4" /> Reescanear QR
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => reconnect(s.id)}>
                      <RefreshCw className="h-4 w-4" /> Reconectar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => disconnect(s.id)} className="text-red-400 focus:text-red-400">
                      <Power className="h-4 w-4" /> Desconectar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Badge variant="outline" className={cn("w-fit gap-1.5", meta.color)}>
                <Icon className={cn("h-3 w-3", s.status === "connecting" && "animate-spin")} />
                {meta.label}
              </Badge>

              {/* Health */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Saúde da sessão</span>
                  <span className="font-medium">{s.health}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      s.health > 70 ? "bg-emerald-500" : s.health > 40 ? "bg-amber-500" : "bg-red-500",
                    )}
                    style={{ width: `${s.health}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-border bg-card/40 p-2.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare className="h-3 w-3" /> Mensagens hoje
                  </div>
                  <p className="mt-1 font-display text-base font-bold">
                    {s.messagesToday.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card/40 p-2.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3 w-3" /> Última sync
                  </div>
                  <p className="mt-1 truncate text-sm font-medium">{s.lastSync}</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-card/40 p-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                  Agente IA
                </div>
                <span className="font-medium">{s.agent}</span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={s.autoReconnect}
                    onCheckedChange={() => toggleAuto(s.id)}
                    id={`auto-${s.id}`}
                  />
                  <Label htmlFor={`auto-${s.id}`} className="text-xs text-muted-foreground">
                    Auto-reconexão
                  </Label>
                </div>
                <div className="flex items-center gap-1.5">
                  {s.status !== "connected" && (
                    <Button size="sm" variant="outline" onClick={() => reconnect(s.id)}>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Reconectar
                    </Button>
                  )}
                  {s.status === "connected" && (
                    <Button size="sm" variant="outline" onClick={() => disconnect(s.id)}>
                      <Power className="h-3.5 w-3.5" />
                      Encerrar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add card */}
        <button
          onClick={() => setAddOpen(true)}
          className="group flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/20 p-6 text-center transition hover:border-primary/50 hover:bg-card/40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-[var(--shadow-glow)] transition group-hover:scale-105">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display font-semibold">Adicionar novo WhatsApp</p>
            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
              Conecte um número adicional ao workspace e escale seu atendimento.
            </p>
          </div>
        </button>
      </div>

      {/* QR DIALOG */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-accent" />
              Conectar WhatsApp
            </DialogTitle>
            <DialogDescription>
              {activeSession
                ? `Reescaneie o QR Code para reconectar ${activeSession.name}.`
                : "Escaneie o QR Code com o aparelho que receberá os atendimentos."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <div className="relative rounded-2xl border border-border bg-white p-4">
              {/* Fake QR placeholder */}
              <div
                className="h-56 w-56"
                style={{
                  backgroundImage:
                    "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)",
                  backgroundSize: "14px 14px",
                  maskImage:
                    "radial-gradient(circle at 50% 50%, black 70%, transparent 72%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg">
                  <Smartphone className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="w-full space-y-2 rounded-xl border border-border bg-card/40 p-3 text-xs text-muted-foreground">
              <p className="flex gap-2"><span className="font-bold text-foreground">1.</span> Abra o WhatsApp no celular</p>
              <p className="flex gap-2"><span className="font-bold text-foreground">2.</span> Vá em <b className="text-foreground">Configurações → Aparelhos conectados</b></p>
              <p className="flex gap-2"><span className="font-bold text-foreground">3.</span> Toque em <b className="text-foreground">Conectar um aparelho</b> e escaneie</p>
            </div>

            <p className="flex items-center gap-1.5 text-xs text-amber-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Aguardando leitura do QR Code...
            </p>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => toast("Novo QR gerado")}>
              <RefreshCw className="h-4 w-4" /> Gerar novo
            </Button>
            <Button className="cta-primary" onClick={() => setQrOpen(false)}>
              <CheckCircle2 className="h-4 w-4" /> Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD NUMBER DIALOG */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo número de WhatsApp</DialogTitle>
            <DialogDescription>
              Configure o apelido da sessão e o agente de IA responsável.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Apelido da sessão</Label>
              <Input id="name" placeholder="Ex.: Comercial SP" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agent">Agente IA</Label>
              <Input id="agent" placeholder="Selecione um agente" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card/40 p-3">
              <div>
                <p className="text-sm font-medium">Auto-reconexão</p>
                <p className="text-xs text-muted-foreground">Reconecta automaticamente em caso de queda.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <Copy className="h-3.5 w-3.5" />
              Webhook: <code className="font-mono text-foreground">api.vektor.ai/wh/whatsapp</code>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button
              className="cta-primary"
              onClick={() => {
                setAddOpen(false);
                openQR();
              }}
            >
              <QrCode className="h-4 w-4" /> Avançar para QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
