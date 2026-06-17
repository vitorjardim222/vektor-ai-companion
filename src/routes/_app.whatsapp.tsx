import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Smartphone,
  Plus,
  QrCode,
  RefreshCw,
  Power,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Activity,
  Clock,
  MessageSquare,
  MoreVertical,
  Wifi,
  WifiOff,
  ShieldCheck,
  Trash2,
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
import { useAuth } from "@/lib/auth-context";
import { whatsappApi, type WhatsAppSession, type WhatsAppStatus } from "@/lib/api/client";

export const Route = createFileRoute("/_app/whatsapp")({
  head: () => ({ meta: [{ title: "WhatsApp — VEKTOR A.I" }] }),
  component: WhatsAppPage,
});

const STATUS_META: Record<WhatsAppStatus, { label: string; color: string; dot: string; icon: typeof Wifi }> = {
  CONNECTED: {
    label: "Conectado",
    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,.6)]",
    icon: Wifi,
  },
  CONNECTING: {
    label: "Conectando",
    color: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    dot: "bg-amber-400 animate-pulse",
    icon: Loader2,
  },
  QR: {
    label: "Aguardando QR",
    color: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    dot: "bg-sky-400 animate-pulse",
    icon: QrCode,
  },
  DISCONNECTED: {
    label: "Desconectado",
    color: "border-muted-foreground/20 bg-muted/30 text-muted-foreground",
    dot: "bg-muted-foreground/60",
    icon: WifiOff,
  },
  ERROR: {
    label: "Erro",
    color: "border-red-500/30 bg-red-500/10 text-red-400",
    dot: "bg-red-500 animate-pulse",
    icon: AlertTriangle,
  },
};

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `há ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function WhatsAppPage() {
  const { currentOrgId } = useAuth();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [qrSessionId, setQrSessionId] = useState<string | null>(null);

  const sessionsQuery = useQuery({
    queryKey: ["whatsapp", currentOrgId],
    queryFn: () => whatsappApi.list(currentOrgId!),
    enabled: !!currentOrgId,
    retry: false,
    staleTime: 30000,
  });

  const sessions = sessionsQuery.data?.sessions ?? [];
  const evolutionConfigured = sessionsQuery.data?.evolutionConfigured ?? false;

  const createMut = useMutation({
    mutationFn: () =>
      whatsappApi.create(currentOrgId!, {
        name: newName,
        phoneNumber: newPhone || null,
        autoReconnect,
      }),
    onSuccess: ({ session }) => {
      toast.success("Sessão criada");
      setAddOpen(false);
      setNewName("");
      setNewPhone("");
      setAutoReconnect(true);
      qc.invalidateQueries({ queryKey: ["whatsapp", currentOrgId] });
      setQrSessionId(session.id);
    },
    onError: () => toast.error("Backend indisponível. Verifique a API."),
  });

  const connectMut = useMutation({
    mutationFn: (id: string) => whatsappApi.connect(currentOrgId!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp", currentOrgId] }),
    onError: () => toast.error("Falha ao reconectar."),
  });

  const disconnectMut = useMutation({
    mutationFn: (id: string) => whatsappApi.disconnect(currentOrgId!, id),
    onSuccess: () => {
      toast("Sessão desconectada");
      qc.invalidateQueries({ queryKey: ["whatsapp", currentOrgId] });
    },
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => whatsappApi.remove(currentOrgId!, id),
    onSuccess: () => {
      toast("Sessão removida");
      qc.invalidateQueries({ queryKey: ["whatsapp", currentOrgId] });
    },
  });

  const toggleAutoMut = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      whatsappApi.update(currentOrgId!, id, { autoReconnect: value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp", currentOrgId] }),
  });

  const total = sessions.length;
  const connected = sessions.filter((s) => s.status === "CONNECTED").length;
  const todayCount = sessions.filter((s) => {
    if (!s.lastMessageAt) return false;
    const d = new Date(s.lastMessageAt);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  }).length;

  const summary = [
    { label: "Números conectados", value: `${connected} / ${total}`, icon: Smartphone, accent: "text-emerald-400" },
    { label: "Ativos hoje", value: todayCount.toString(), icon: MessageSquare, accent: "text-primary" },
    { label: "Evolution API", value: evolutionConfigured ? "Online" : "Não configurado", icon: Activity, accent: evolutionConfigured ? "text-emerald-400" : "text-amber-400" },
    { label: "Segurança", value: "TLS 1.3", icon: ShieldCheck, accent: "text-emerald-400" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Sessões de WhatsApp</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conexões reais via Evolution API. Status atualizado em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => sessionsQuery.refetch()}>
            <RefreshCw className={cn("h-4 w-4", sessionsQuery.isFetching && "animate-spin")} />
            Atualizar
          </Button>
          <Button className="cta-primary" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Adicionar número
          </Button>
        </div>
      </div>

      {!evolutionConfigured && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          Evolution API não configurada. Defina <code className="font-mono">EVOLUTION_API_URL</code> e <code className="font-mono">EVOLUTION_API_KEY</code> no backend para conectar números reais. As sessões serão criadas mas não conectarão.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl border border-border glass-panel p-5">
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

      {sessionsQuery.isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Backend indisponível. Verifique a API.
        </div>
      )}

      {sessionsQuery.isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((s) => {
            const meta = STATUS_META[s.status];
            const Icon = meta.icon;
            return (
              <div key={s.id} className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border glass-panel p-5 transition hover:border-primary/40">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Smartphone className="h-5 w-5" />
                      <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card", meta.dot)} />
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.phoneNumber ?? "Sem número vinculado"}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setQrSessionId(s.id)}>
                        <QrCode className="h-4 w-4" /> Ver QR Code
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => connectMut.mutate(s.id)}>
                        <RefreshCw className="h-4 w-4" /> Reconectar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => disconnectMut.mutate(s.id)}>
                        <Power className="h-4 w-4" /> Desconectar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => removeMut.mutate(s.id)} className="text-red-400 focus:text-red-400">
                        <Trash2 className="h-4 w-4" /> Remover sessão
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Badge variant="outline" className={cn("w-fit gap-1.5", meta.color)}>
                  <Icon className={cn("h-3 w-3", s.status === "CONNECTING" && "animate-spin")} />
                  {meta.label}
                </Badge>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-border bg-card/40 p-2.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3" /> Última conexão
                    </div>
                    <p className="mt-1 truncate text-sm font-medium">{timeAgo(s.lastConnectionAt)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card/40 p-2.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" /> Última msg
                    </div>
                    <p className="mt-1 truncate text-sm font-medium">{timeAgo(s.lastMessageAt)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={s.autoReconnect}
                      onCheckedChange={(v) => toggleAutoMut.mutate({ id: s.id, value: v })}
                      id={`auto-${s.id}`}
                    />
                    <Label htmlFor={`auto-${s.id}`} className="text-xs text-muted-foreground">Auto-reconexão</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {s.status !== "CONNECTED" ? (
                      <Button size="sm" variant="outline" onClick={() => { setQrSessionId(s.id); connectMut.mutate(s.id); }}>
                        <QrCode className="h-3.5 w-3.5" />
                        Conectar
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => disconnectMut.mutate(s.id)}>
                        <Power className="h-3.5 w-3.5" />
                        Encerrar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => setAddOpen(true)}
            className="group flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/20 p-6 text-center transition hover:border-primary/50 hover:bg-card/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-[var(--shadow-glow)] transition group-hover:scale-105">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display font-semibold">Adicionar novo WhatsApp</p>
              <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
                Conecte um número adicional ao workspace.
              </p>
            </div>
          </button>
        </div>
      )}

      <QrDialog
        sessionId={qrSessionId}
        onClose={() => setQrSessionId(null)}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo número de WhatsApp</DialogTitle>
            <DialogDescription>
              A sessão será criada no Evolution API e ficará pronta para escanear o QR Code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Apelido da sessão</Label>
              <Input id="name" placeholder="Ex.: Comercial SP" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Número (opcional)</Label>
              <Input id="phone" placeholder="+55 11 98765-4321" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card/40 p-3">
              <div>
                <p className="text-sm font-medium">Auto-reconexão</p>
                <p className="text-xs text-muted-foreground">Reconecta automaticamente em caso de queda.</p>
              </div>
              <Switch checked={autoReconnect} onCheckedChange={setAutoReconnect} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button
              className="cta-primary"
              disabled={!newName.trim() || createMut.isPending}
              onClick={() => createMut.mutate()}
            >
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
              Criar e gerar QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QrDialog({ sessionId, onClose }: { sessionId: string | null; onClose: () => void }) {
  const { currentOrgId } = useAuth();
  const qc = useQueryClient();
  const open = !!sessionId;

  const qrQuery = useQuery({
    queryKey: ["whatsapp-qr", currentOrgId, sessionId],
    queryFn: () => whatsappApi.qrCode(currentOrgId!, sessionId!),
    enabled: open && !!currentOrgId,
    retry: false,
    staleTime: 10000,
  });

  useEffect(() => {
    if (qrQuery.data?.status === "CONNECTED") {
      toast.success("WhatsApp conectado!");
      qc.invalidateQueries({ queryKey: ["whatsapp", currentOrgId] });
      onClose();
    }
  }, [qrQuery.data?.status, qc, currentOrgId, onClose]);

  const qr = qrQuery.data?.qrCode;
  const status = qrQuery.data?.status ?? "CONNECTING";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-accent" />
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code com o aparelho que receberá os atendimentos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-64 w-64 items-center justify-center rounded-2xl border border-border bg-white p-3">
            {qr ? (
              <img
                src={qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`}
                alt="QR Code"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs">Aguardando QR…</p>
              </div>
            )}
          </div>

          <div className="w-full space-y-2 rounded-xl border border-border bg-card/40 p-3 text-xs text-muted-foreground">
            <p className="flex gap-2"><span className="font-bold text-foreground">1.</span> Abra o WhatsApp no celular</p>
            <p className="flex gap-2"><span className="font-bold text-foreground">2.</span> Vá em <b className="text-foreground">Configurações → Aparelhos conectados</b></p>
            <p className="flex gap-2"><span className="font-bold text-foreground">3.</span> Toque em <b className="text-foreground">Conectar um aparelho</b> e escaneie</p>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-amber-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Status: {STATUS_META[status]?.label ?? status}
          </p>

          {qrQuery.data?.error && (
            <p className="text-xs text-red-400">Erro: {qrQuery.data.error}</p>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => qrQuery.refetch()}>
            <RefreshCw className="h-4 w-4" /> Atualizar
          </Button>
          <Button className="cta-primary" onClick={onClose}>
            <CheckCircle2 className="h-4 w-4" /> Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
