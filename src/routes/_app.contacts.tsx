import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Plus,
  Search,
  MessageSquare,
  CreditCard,
  Kanban,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Tv,
  Tag as TagIcon,
  Bot,
  UserRound,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { ApiError, contactApi, iptvApi, type Contact, type IptvPlan } from "@/lib/api/client";

export const Route = createFileRoute("/_app/contacts")({
  ssr: false,
  head: () => ({ meta: [{ title: "Contatos — VEKTOR A.I" }] }),
  component: ContactsPage,
});

type ContactStatus = "ativo" | "inativo" | "bloqueado" | "lead";

type ContactDraft = {
  id?: string;
  name: string;
  phone: string;
  email?: string | null;
  source?: string | null;
  status: ContactStatus;
  tags: string[];
  notes?: string | null;
  leadStage?: string | null;
  assignedUserId?: string | null;
  assignedAiPoolId?: string | null;
  iptvPlanId?: string | null;
  iptvExpiresAt?: string | null;
};

const POOLS = ["Vendas Pool", "Cobrança Pool", "Suporte Pool", "Renovação Pool"];
const USERS = ["Lucas Almeida", "Mariana Souza", "Ricardo Tavares", "Camila Reis"];
const SOURCES = ["WhatsApp", "Instagram", "Site", "Indicação", "Anúncio", "Manual"];
const LEAD_STAGES = ["Novo", "Qualificado", "Proposta", "Negociação", "Ganho", "Perdido"];

const STATUS_META: Record<ContactStatus, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  inativo: { label: "Inativo", className: "bg-white/5 text-muted-foreground border-white/10" },
  bloqueado: { label: "Bloqueado", className: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  lead: { label: "Lead", className: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
};

const relTime = (iso?: string | null) => {
  if (!iso) return "—";
  const diff = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (diff < 1 && diff > -1) return "hoje";
  if (diff >= 1 && diff < 30) return `há ${Math.floor(diff)}d`;
  if (diff <= -1 && diff > -30) return `em ${Math.ceil(-diff)}d`;
  return new Date(iso).toLocaleDateString("pt-BR");
};

function backendErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Sessão expirada. Entre novamente.";
    if (err.status === 403) return "Sem permissão para esta operação.";
    if (err.status === 400) return "Dados inválidos.";
  }
  return "Backend indisponível. Verifique a API.";
}

function ContactsPage() {
  const { currentOrgId, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [editing, setEditing] = useState<ContactDraft | null>(null);
  const [open, setOpen] = useState(false);

  const enabled = ready && isAuthenticated && !!currentOrgId;

  const contactsQuery = useQuery({
    queryKey: ["contacts", currentOrgId],
    enabled,
    queryFn: () => contactApi.list(currentOrgId!).then((r) => r.contacts),
  });

  const plansQuery = useQuery({
    queryKey: ["iptv-plans", currentOrgId],
    enabled,
    queryFn: () => iptvApi.listPlans(currentOrgId!).then((r) => r.plans),
  });

  const contacts = contactsQuery.data ?? [];
  const plans = plansQuery.data ?? [];
  const planNameById = useMemo(
    () => Object.fromEntries(plans.map((p) => [p.id, p.name])),
    [plans],
  );

  const allTags = useMemo(
    () => Array.from(new Set(contacts.flatMap((c) => c.tags))).sort(),
    [contacts],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (tagFilter !== "all" && !c.tags.includes(tagFilter)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [contacts, search, statusFilter, tagFilter]);
  const visibleContacts = filtered.slice(0, 100);

  const stats = useMemo(() => {
    const expSoon = contacts.filter((c) => {
      if (!c.iptvExpiresAt) return false;
      const d = (new Date(c.iptvExpiresAt).getTime() - Date.now()) / 86400000;
      return d >= 0 && d <= 7;
    }).length;
    return {
      total: contacts.length,
      ativos: contacts.filter((c) => c.status === "ativo").length,
      leads: contacts.filter((c) => c.status === "lead").length,
      expSoon,
    };
  }, [contacts]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["contacts", currentOrgId] });

  const createMut = useMutation({
    mutationFn: (input: ContactDraft) => contactApi.create(currentOrgId!, input as Partial<Contact>),
    onSuccess: () => {
      toast.success("Contato criado.");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (err) => toast.error(backendErrorMessage(err)),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ContactDraft }) =>
      contactApi.update(currentOrgId!, id, input as Partial<Contact>),
    onSuccess: () => {
      toast.success("Contato atualizado.");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (err) => toast.error(backendErrorMessage(err)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => contactApi.remove(currentOrgId!, id),
    onSuccess: () => {
      toast.success("Contato removido.");
      invalidate();
    },
    onError: (err) => toast.error(backendErrorMessage(err)),
  });

  const saving = createMut.isPending || updateMut.isPending;
  const handleSave = (c: ContactDraft) => {
    if (c.id) updateMut.mutate({ id: c.id, input: c });
    else createMut.mutate(c);
  };

  const openNew = () => {
    setEditing({ name: "", phone: "", source: "WhatsApp", status: "lead", tags: [] });
    setOpen(true);
  };
  const openEdit = (c: Contact) => {
    setEditing({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      source: c.source,
      status: (c.status as ContactStatus) ?? "ativo",
      tags: c.tags ?? [],
      notes: c.notes,
      leadStage: c.leadStage,
      assignedUserId: c.assignedUserId,
      assignedAiPoolId: c.assignedAiPoolId,
      iptvPlanId: c.iptvPlanId,
      iptvExpiresAt: c.iptvExpiresAt,
    });
    setOpen(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Contatos
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Base de clientes</h1>
          <p className="text-sm text-muted-foreground">
            Todos os contatos da sua operação — WhatsApp, CRM, IPTV e cobrança em um só lugar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nome, telefone, email, tag…"
              className="w-80 pl-8"
            />
          </div>
          <Button onClick={openNew} className="gap-1" disabled={!currentOrgId}>
            <Plus className="h-4 w-4" /> Novo contato
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total" value={stats.total} tone="sky" />
        <StatCard label="Ativos" value={stats.ativos} tone="emerald" />
        <StatCard label="Leads" value={stats.leads} tone="amber" />
        <StatCard label="IPTV vencendo (7d)" value={stats.expSoon} tone="rose" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
            <SelectItem value="bloqueado">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Tag" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas tags</SelectItem>
            {allTags.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <Card className="border-white/5 bg-white/[0.02]">
          {contactsQuery.isError ? (
            <div className="flex items-center gap-2 p-6 text-sm text-rose-300">
              <AlertTriangle className="h-4 w-4" /> Backend indisponível. Verifique a API.
              <Button size="sm" variant="ghost" onClick={() => contactsQuery.refetch()}>Tentar de novo</Button>
            </div>
          ) : contactsQuery.isLoading ? (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando contatos…
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>IPTV</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Atribuído</TableHead>
                  <TableHead>Última interação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleContacts.map((c) => {
                  const expDays = c.iptvExpiresAt
                    ? Math.ceil((new Date(c.iptvExpiresAt).getTime() - Date.now()) / 86400000)
                    : null;
                  const expTone =
                    expDays == null
                      ? "border-white/10 bg-white/5 text-muted-foreground"
                      : expDays < 0
                        ? "border-rose-500/30 bg-rose-500/15 text-rose-300"
                        : expDays <= 7
                          ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
                          : "border-emerald-500/30 bg-emerald-500/15 text-emerald-300";
                  const planName = c.iptvPlanId ? planNameById[c.iptvPlanId] : null;
                  return (
                    <TableRow key={c.id} className="border-white/5">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs">
                            {c.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium">{c.name}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" /> {c.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border", STATUS_META[(c.status as ContactStatus) ?? "ativo"].className)}>
                          {STATUS_META[(c.status as ContactStatus) ?? "ativo"].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(!c.tags || c.tags.length === 0) && (<span className="text-xs text-muted-foreground">—</span>)}
                          {c.tags?.map((t) => (
                            <Badge key={t} variant="outline" className="border-white/10 text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {planName ? (
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Tv className="h-3 w-3 text-sky-300" />{planName}
                          </span>
                        ) : (<span className="text-xs text-muted-foreground">—</span>)}
                      </TableCell>
                      <TableCell>
                        {c.iptvExpiresAt ? (
                          <Badge className={cn("border text-[11px]", expTone)}>
                            {expDays! < 0 ? `vencido há ${-expDays!}d` : expDays === 0 ? "vence hoje" : `${expDays}d`}
                          </Badge>
                        ) : (<span className="text-xs text-muted-foreground">—</span>)}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {c.assignedUserId && (<div className="flex items-center gap-1"><UserRound className="h-3 w-3 text-muted-foreground" /> {c.assignedUserId}</div>)}
                          {c.assignedAiPoolId && (<div className="flex items-center gap-1 text-muted-foreground"><Bot className="h-3 w-3" /> {c.assignedAiPoolId}</div>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{relTime(c.lastInteractionAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="gap-1" onClick={() => navigate({ to: "/conversations" })}><MessageSquare className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="gap-1" onClick={() => navigate({ to: "/billing" })}><CreditCard className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="gap-1" onClick={() => navigate({ to: "/crm" })}><Kanban className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button
                            size="sm" variant="ghost"
                            disabled={deleteMut.isPending}
                            onClick={() => { if (confirm(`Remover ${c.name}?`)) deleteMut.mutate(c.id); }}
                            className="text-rose-300 hover:text-rose-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      Nenhum contato encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.length > visibleContacts.length && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-4 text-center text-xs text-muted-foreground">
                      Mostrando os 100 primeiros contatos. Use a busca ou filtros para refinar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <ContactDialog
        open={open}
        onOpenChange={(b) => { if (!saving) setOpen(b); }}
        value={editing}
        onSave={handleSave}
        saving={saving}
        plans={plans}
      />
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "sky" | "emerald" | "amber" | "rose" }) {
  const tones = {
    sky: "text-sky-300 bg-sky-500/10",
    emerald: "text-emerald-300 bg-emerald-500/10",
    amber: "text-amber-300 bg-amber-500/10",
    rose: "text-rose-300 bg-rose-500/10",
  };
  return (
    <Card className="border-white/5 bg-white/[0.02]">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
        <div className={cn("rounded-lg p-2", tones[tone])}><Users className="h-5 w-5" /></div>
      </CardContent>
    </Card>
  );
}

function ContactDialog({
  open, onOpenChange, value, onSave, saving, plans,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  value: ContactDraft | null;
  onSave: (c: ContactDraft) => void;
  saving: boolean;
  plans: IptvPlan[];
}) {
  const [draft, setDraft] = useState<ContactDraft | null>(value);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => { setDraft(value); setTagInput(""); }, [value]);

  if (!draft) return null;
  const set = <K extends keyof ContactDraft>(k: K, v: ContactDraft[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || draft.tags.includes(t)) return;
    set("tags", [...draft.tags, t]);
    setTagInput("");
  };
  const removeTag = (t: string) => set("tags", draft.tags.filter((x) => x !== t));

  const expValue = draft.iptvExpiresAt ? draft.iptvExpiresAt.slice(0, 10) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-sky-300" />
            {draft.id ? "Editar contato" : "Novo contato"}
          </DialogTitle>
          <DialogDescription>
            Dados completos do cliente para WhatsApp, CRM, IPTV e cobrança.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <Input value={draft.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone / WhatsApp</Label>
              <Input value={draft.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+55 11 99999-0000" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-8" value={draft.email ?? ""} onChange={(e) => set("email", e.target.value || null)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Origem</Label>
              <Select value={draft.source ?? "WhatsApp"} onValueChange={(v) => set("source", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => set("status", v as ContactStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estágio (CRM)</Label>
              <Select value={draft.leadStage ?? "none"} onValueChange={(v) => set("leadStage", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {LEAD_STAGES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1 rounded-md border border-input bg-background/40 p-2">
              {draft.tags.map((t) => (
                <Badge key={t} variant="outline" className="cursor-pointer border-white/10 text-xs" onClick={() => removeTag(t)}>
                  <TagIcon className="mr-1 h-3 w-3" />{t} ✕
                </Badge>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Adicionar tag e Enter"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-lg border border-white/5 bg-background/40 p-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Plano IPTV</Label>
              <Select value={draft.iptvPlanId ?? "none"} onValueChange={(v) => set("iptvPlanId", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Sem plano" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem plano</SelectItem>
                  {plans.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
              {plans.length === 0 && (
                <p className="text-[11px] text-muted-foreground">Crie planos em Financeiro → Planos IPTV.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Data de vencimento</Label>
              <Input
                type="date"
                value={expValue}
                onChange={(e) => set("iptvExpiresAt", e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Atribuído a (humano)</Label>
              <Select value={draft.assignedUserId ?? "none"} onValueChange={(v) => set("assignedUserId", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Ninguém" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguém</SelectItem>
                  {USERS.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Pool de IA</Label>
              <Select value={draft.assignedAiPoolId ?? "none"} onValueChange={(v) => set("assignedAiPoolId", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Sem pool" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem pool</SelectItem>
                  {POOLS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notas internas</Label>
            <Textarea rows={3} value={draft.notes ?? ""} onChange={(e) => set("notes", e.target.value || null)} />
          </div>
        </div>

        <DialogFooter className="border-t border-white/5 pt-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button
            onClick={() => draft && onSave(draft)}
            disabled={saving || !draft.name.trim() || !draft.phone.trim()}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar contato"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
