import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Palette,
  Users,
  Shield,
  Bell,
  Plug,
  Bot,
  CreditCard,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Key,
  Globe,
  Smartphone,
  History,
  MapPin,
  Pencil,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — VEKTOR A.I" },
      { name: "description", content: "Configurações do workspace, branding, equipe, provedores de IA e integrações." },
    ],
  }),
  component: SettingsPage,
});

type Role = "Master" | "Admin" | "Gerente" | "Suporte" | "Vendas" | "Financeiro" | "Visualizador";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  online: boolean;
  lastSeen: string;
  sectors: string[];
}

interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  model: string;
  hasKey: boolean;
  pool?: string;
  daily?: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  status: "connected" | "disconnected" | "error";
  category: string;
}

const ROLES: Role[] = ["Master", "Admin", "Gerente", "Suporte", "Vendas", "Financeiro", "Visualizador"];

const ROLE_META: Record<Role, { color: string }> = {
  Master: { color: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/30" },
  Admin: { color: "bg-sky-500/15 text-sky-300 border-sky-400/30" },
  Gerente: { color: "bg-violet-500/15 text-violet-300 border-violet-400/30" },
  Suporte: { color: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30" },
  Vendas: { color: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
  Financeiro: { color: "bg-amber-500/15 text-amber-300 border-amber-400/30" },
  Visualizador: { color: "bg-zinc-500/15 text-zinc-300 border-zinc-400/30" },
};

const INITIAL_TEAM: TeamMember[] = [
  { id: "u1", name: "Carolina Mendes", email: "carolina@vektor.ai", role: "Master", online: true, lastSeen: "agora", sectors: ["Geral"] },
  { id: "u2", name: "Rafael Souza", email: "rafael@vektor.ai", role: "Admin", online: true, lastSeen: "há 2 min", sectors: ["Vendas", "Suporte"] },
  { id: "u3", name: "Juliana Prado", email: "juliana@vektor.ai", role: "Vendas", online: false, lastSeen: "há 1h", sectors: ["Vendas"] },
  { id: "u4", name: "Lucas Almeida", email: "lucas@vektor.ai", role: "Suporte", online: true, lastSeen: "agora", sectors: ["Suporte"] },
  { id: "u5", name: "Beatriz Lima", email: "bia@vektor.ai", role: "Financeiro", online: false, lastSeen: "ontem", sectors: ["Financeiro"] },
];

const INITIAL_PROVIDERS: AIProvider[] = [
  { id: "openrouter", name: "OpenRouter", enabled: true, model: "anthropic/claude-3.5-sonnet", hasKey: true, pool: "Vendas Pool", daily: "R$ 50,00" },
  { id: "openai", name: "OpenAI", enabled: true, model: "gpt-4o-mini", hasKey: true, pool: "Suporte Pool", daily: "R$ 30,00" },
  { id: "gemini", name: "Google Gemini", enabled: true, model: "gemini-1.5-flash", hasKey: true, pool: "Cobrança Pool", daily: "R$ 20,00" },
  { id: "groq", name: "Groq", enabled: false, model: "llama-3.1-70b", hasKey: false },
  { id: "claude", name: "Anthropic Claude", enabled: true, model: "claude-3-haiku", hasKey: true, pool: "Vendas Pool", daily: "R$ 40,00" },
  { id: "deepseek", name: "DeepSeek", enabled: false, model: "deepseek-chat", hasKey: false },
  { id: "ollama", name: "Ollama (local)", enabled: false, model: "llama3", hasKey: false },
  { id: "custom", name: "Endpoint customizado", enabled: false, model: "—", hasKey: false },
];

const INTEGRATIONS: Integration[] = [
  { id: "evolution", name: "Evolution API", description: "Gateway WhatsApp não-oficial multi-sessão.", status: "connected", category: "WhatsApp" },
  { id: "mp", name: "Mercado Pago", description: "Cobrança via Pix e link de pagamento.", status: "connected", category: "Pagamentos" },
  { id: "asaas", name: "Asaas", description: "Régua de cobrança e boletos.", status: "disconnected", category: "Pagamentos" },
  { id: "sigma", name: "Sigma", description: "ISP — provedores de internet.", status: "disconnected", category: "ERP" },
  { id: "supabase", name: "Supabase", description: "Banco de dados, auth e storage.", status: "connected", category: "Infra" },
  { id: "webhooks", name: "Webhooks", description: "Disparos HTTP para sistemas externos.", status: "connected", category: "Dev" },
  { id: "smtp", name: "SMTP", description: "Envio de e-mails transacionais.", status: "error", category: "E-mail" },
  { id: "gcal", name: "Google Calendar", description: "Agendamentos sincronizados.", status: "disconnected", category: "Agenda" },
];

const PERMISSIONS = [
  "Visualizar conversas",
  "Responder conversas",
  "Gerenciar contatos",
  "Editar CRM",
  "Gerenciar automações",
  "Gerenciar agentes IA",
  "Gerenciar pools",
  "Gerenciar WhatsApp",
  "Acessar financeiro",
  "Gerenciar equipe",
  "Configurações do workspace",
];

const ROLE_PERMS: Record<Role, boolean[]> = {
  Master:       [true, true, true, true, true, true, true, true, true, true, true],
  Admin:        [true, true, true, true, true, true, true, true, true, true, false],
  Gerente:      [true, true, true, true, true, false, false, true, true, false, false],
  Suporte:      [true, true, true, false, false, false, false, false, false, false, false],
  Vendas:       [true, true, true, true, false, false, false, false, false, false, false],
  Financeiro:   [false, false, false, false, false, false, false, false, true, false, false],
  Visualizador: [true, false, false, false, false, false, false, false, false, false, false],
};

const STATUS_META: Record<Integration["status"], { label: string; color: string; dot: string }> = {
  connected:    { label: "Conectado",    color: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30", dot: "bg-emerald-400" },
  disconnected: { label: "Desconectado", color: "bg-zinc-500/15 text-zinc-300 border-zinc-400/30",         dot: "bg-zinc-500" },
  error:        { label: "Erro",         color: "bg-rose-500/15 text-rose-300 border-rose-400/30",         dot: "bg-rose-400" },
};

function SettingsPage() {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [providers, setProviders] = useState<AIProvider[]>(INITIAL_PROVIDERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState<AIProvider | null>(null);
  const [removeBrand, setRemoveBrand] = useState(false);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie workspace, branding, equipe, provedores de IA e integrações.
          </p>
        </div>
        <Badge variant="outline" className="border-white/10 bg-white/5 text-xs">
          <SettingsIcon className="mr-1 h-3 w-3" /> Workspace ativo
        </Badge>
      </div>

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-white/[0.03] p-1">
          <TabsTrigger value="workspace"><Building2 className="mr-1.5 h-3.5 w-3.5" />Workspace</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="mr-1.5 h-3.5 w-3.5" />Branding</TabsTrigger>
          <TabsTrigger value="team"><Users className="mr-1.5 h-3.5 w-3.5" />Equipe</TabsTrigger>
          <TabsTrigger value="roles"><Shield className="mr-1.5 h-3.5 w-3.5" />Permissões</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1.5 h-3.5 w-3.5" />Notificações</TabsTrigger>
          <TabsTrigger value="integrations"><Plug className="mr-1.5 h-3.5 w-3.5" />Integrações</TabsTrigger>
          <TabsTrigger value="ai"><Bot className="mr-1.5 h-3.5 w-3.5" />Provedores IA</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="mr-1.5 h-3.5 w-3.5" />Billing</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-1.5 h-3.5 w-3.5" />Segurança</TabsTrigger>
          <TabsTrigger value="whitelabel"><Sparkles className="mr-1.5 h-3.5 w-3.5" />White Label</TabsTrigger>
        </TabsList>

        {/* WORKSPACE */}
        <TabsContent value="workspace" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Empresa</CardTitle>
              <CardDescription>Dados principais do workspace.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Nome da empresa" defaultValue="VEKTOR A.I" />
              <Field label="Razão social" defaultValue="Vektor Tecnologia LTDA" />
              <Field label="CNPJ" defaultValue="12.345.678/0001-90" />
              <Field label="E-mail principal" defaultValue="contato@vektor.ai" />
              <div className="md:col-span-2">
                <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Logo</Label>
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-xl border border-white/10 bg-white/5 text-xs text-muted-foreground">LOGO</div>
                  <Button variant="outline" size="sm">Enviar logo</Button>
                  <Button variant="ghost" size="sm">Enviar favicon</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localização & operação</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <SelectField label="Fuso horário" value="America/Sao_Paulo" options={["America/Sao_Paulo", "America/Manaus", "America/Belem", "UTC"]} />
              <SelectField label="Idioma" value="Português (Brasil)" options={["Português (Brasil)", "English (US)", "Español"]} />
              <SelectField label="Moeda" value="BRL — Real" options={["BRL — Real", "USD — Dólar", "EUR — Euro"]} />
              <Field label="Horário de funcionamento" defaultValue="08:00 — 20:00 (Seg-Sex)" />
            </CardContent>
            <CardContent className="flex justify-end gap-2 pt-0">
              <Button variant="ghost">Cancelar</Button>
              <Button className="cta-primary">Salvar alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BRANDING */}
        <TabsContent value="branding" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cores & identidade</CardTitle>
              <CardDescription>Usadas em e-mails, relatórios e dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <ColorField label="Cor primária" value="#3D8BFF" />
              <ColorField label="Cor secundária" value="#00D9FF" />
              <ColorField label="Cor de destaque" value="#7C3AED" />
              <ColorField label="Cor de fundo" value="#05080D" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recursos visuais</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <UploadBox label="Logo claro" />
              <UploadBox label="Logo escuro" />
              <UploadBox label="Favicon" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEAM */}
        <TabsContent value="team" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{team.length} membros · {team.filter(t => t.online).length} online</p>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button className="cta-primary"><Plus className="mr-2 h-4 w-4" />Convidar usuário</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Convidar para o workspace</DialogTitle>
                  <DialogDescription>O usuário receberá um e-mail com link de acesso.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Field label="E-mail" defaultValue="" placeholder="nome@empresa.com" />
                  <div>
                    <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Papel</Label>
                    <Select defaultValue="Suporte">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Field label="Setores (separados por vírgula)" defaultValue="Vendas, Suporte" />
                </div>
                <DialogFooter className="pt-4">
                  <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancelar</Button>
                  <Button className="cta-primary" onClick={() => setInviteOpen(false)}>Enviar convite</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Setores</TableHead>
                    <TableHead>Último acesso</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarFallback className="bg-white/5 text-xs">{m.name.split(" ").map(n => n[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                          <div>
                            <div className="text-sm font-medium">{m.name}</div>
                            <div className="text-xs text-muted-foreground">{m.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className={ROLE_META[m.role].color}>{m.role}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.sectors.join(", ")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.lastSeen}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <CircleDot className={`h-3 w-3 ${m.online ? "text-emerald-400" : "text-zinc-500"}`} />
                          {m.online ? "Online" : "Offline"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-300" onClick={() => setTeam(t => t.filter(x => x.id !== m.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLES */}
        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de permissões</CardTitle>
              <CardDescription>Defina o que cada papel pode acessar.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permissão</TableHead>
                    {ROLES.map(r => <TableHead key={r} className="text-center text-xs">{r}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PERMISSIONS.map((perm, i) => (
                    <TableRow key={perm}>
                      <TableCell className="text-sm">{perm}</TableCell>
                      {ROLES.map(r => (
                        <TableCell key={r} className="text-center">
                          {ROLE_PERMS[r][i] ? (
                            <Check className="mx-auto h-4 w-4 text-emerald-400" />
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications" className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle>Notificações do sistema</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ToggleRow label="Nova mensagem recebida" desc="Notifica em todos os dispositivos conectados." defaultChecked />
              <ToggleRow label="IA falhou em responder" desc="Alerta administradores em tempo real." defaultChecked />
              <ToggleRow label="Lead novo no CRM" desc="Notifica responsáveis do pipeline." defaultChecked />
              <ToggleRow label="Cobrança vencida" desc="Notifica time financeiro." defaultChecked />
              <ToggleRow label="Sessão WhatsApp caiu" desc="Alerta crítico para reconexão." defaultChecked />
              <ToggleRow label="Resumo diário por e-mail" desc="Enviado às 08:00 todos os dias úteis." />
            </CardContent>
          </Card>
        </TabsContent>

        {/* INTEGRATIONS */}
        <TabsContent value="integrations" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {INTEGRATIONS.map(int => (
              <Card key={int.id} className="border-white/10 transition hover:border-white/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{int.name}</CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">{int.category}</p>
                    </div>
                    <Badge variant="outline" className={STATUS_META[int.status].color}>
                      <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${STATUS_META[int.status].dot}`} />
                      {STATUS_META[int.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{int.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      {int.status === "connected" ? "Configurar" : "Conectar"}
                    </Button>
                    {int.status === "connected" && (
                      <Button size="sm" variant="ghost">Desconectar</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI PROVIDERS */}
        <TabsContent value="ai" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure provedores de IA usados pelos pools. Use cost protection para evitar gastos inesperados.
          </p>
          <div className="grid gap-3">
            {providers.map(p => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                      <Bot className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{p.name}</span>
                        {p.hasKey ? (
                          <Badge variant="outline" className="border-emerald-400/30 bg-emerald-500/10 text-[10px] text-emerald-300">
                            <Key className="mr-1 h-2.5 w-2.5" /> API key
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-zinc-500/30 bg-zinc-500/10 text-[10px] text-zinc-400">Sem chave</Badge>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {p.model} {p.pool && `· ${p.pool}`} {p.daily && `· Limite ${p.daily}/dia`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={p.enabled}
                      onCheckedChange={(v) => setProviders(prev => prev.map(x => x.id === p.id ? { ...x, enabled: v } : x))}
                    />
                    <Button size="sm" variant="outline" onClick={() => setProviderOpen(p)}>Configurar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={!!providerOpen} onOpenChange={(v) => !v && setProviderOpen(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Configurar {providerOpen?.name}</DialogTitle>
                <DialogDescription>Defina chave, modelo padrão e proteção de custos.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Field label="API Key" defaultValue="sk-•••••••••••••••" />
                <Field label="Modelo padrão" defaultValue={providerOpen?.model || ""} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Max tokens" defaultValue="2048" />
                  <Field label="Temperature" defaultValue="0.7" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Limite diário (R$)" defaultValue="50,00" />
                  <SelectField label="Pool" value={providerOpen?.pool || "Nenhum"} options={["Nenhum", "Vendas Pool", "Suporte Pool", "Cobrança Pool"]} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <div>
                    <div className="text-sm font-medium">Cost protection</div>
                    <div className="text-xs text-muted-foreground">Bloqueia chamadas ao atingir o limite diário.</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button variant="ghost" onClick={() => setProviderOpen(null)}>Cancelar</Button>
                <Button className="cta-primary" onClick={() => setProviderOpen(null)}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* BILLING */}
        <TabsContent value="billing" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plano atual</CardTitle>
              <CardDescription>VEKTOR Business — 10 sessões WhatsApp, IA ilimitada.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold brand-gradient-text">R$ 497,00<span className="text-base text-muted-foreground">/mês</span></div>
                <div className="mt-1 text-xs text-muted-foreground">Próxima cobrança em 28/06/2026</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Trocar plano</Button>
                <Button variant="ghost" className="text-rose-300">Cancelar</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Método de pagamento</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-cyan-300" />
                <div>
                  <div className="text-sm">Visa •••• 4242</div>
                  <div className="text-xs text-muted-foreground">Expira em 09/28</div>
                </div>
              </div>
              <Button variant="outline" size="sm">Alterar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security" className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle>Autenticação</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ToggleRow label="Autenticação em 2 fatores (2FA)" desc="Exige código do app autenticador no login." defaultChecked />
              <ToggleRow label="Forçar 2FA para toda equipe" desc="Bloqueia usuários sem 2FA configurado." />
              <ToggleRow label="Expirar sessões após 12h" desc="Renova automaticamente após login." defaultChecked />
              <ToggleRow label="Bloquear novos IPs sem confirmação" desc="Envia e-mail antes de liberar acesso." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Smartphone className="h-4 w-4" />Dispositivos ativos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { device: "MacBook Pro · Chrome", ip: "187.45.10.22", loc: "São Paulo, BR", now: true },
                { device: "iPhone 15 · Safari",  ip: "187.45.10.22", loc: "São Paulo, BR", now: false },
                { device: "Windows · Edge",       ip: "200.10.55.91", loc: "Curitiba, BR", now: false },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <div>
                    <div className="text-sm">{d.device} {d.now && <Badge variant="outline" className="ml-2 border-emerald-400/30 bg-emerald-500/10 text-[10px] text-emerald-300">Esta sessão</Badge>}</div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" />{d.ip}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{d.loc}</span>
                    </div>
                  </div>
                  {!d.now && <Button size="sm" variant="ghost" className="text-rose-300">Encerrar</Button>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="h-4 w-4" />Histórico de login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                { t: "Hoje, 09:14", ip: "187.45.10.22", loc: "São Paulo, BR", ok: true },
                { t: "Ontem, 22:01", ip: "187.45.10.22", loc: "São Paulo, BR", ok: true },
                { t: "12/06, 07:33", ip: "200.10.55.91", loc: "Curitiba, BR", ok: true },
                { t: "10/06, 03:12", ip: "45.231.88.10", loc: "Desconhecido", ok: false },
              ].map((h, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <CircleDot className={`h-3 w-3 ${h.ok ? "text-emerald-400" : "text-rose-400"}`} />
                    <span className="text-muted-foreground">{h.t}</span>
                  </div>
                  <div className="text-muted-foreground">{h.ip} · {h.loc}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WHITE LABEL */}
        <TabsContent value="whitelabel" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>White label</CardTitle>
              <CardDescription>Apresente o produto com sua própria marca.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Nome customizado do app" defaultValue="VEKTOR A.I" />
              <Field label="Domínio / subdomínio" defaultValue="app.minhaempresa.com.br" />
              <Field label="Assinatura de rodapé WhatsApp" defaultValue="— Enviado por MinhaEmpresa" />
              <Field label="E-mail remetente" defaultValue="no-reply@minhaempresa.com.br" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recursos visuais white label</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <UploadBox label="Logo de login" />
              <UploadBox label="Logo da sidebar" />
              <UploadBox label="Favicon customizado" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Tema</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <ColorField label="Cor primária (tema)" value="#3D8BFF" />
              <ColorField label="Cor secundária (tema)" value="#00D9FF" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-medium">Remover marca VEKTOR</div>
                <div className="text-xs text-muted-foreground">Oculta toda referência à VEKTOR em e-mails, login e rodapé.</div>
              </div>
              <Switch checked={removeBrand} onCheckedChange={setRemoveBrand} />
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="ghost">Cancelar</Button>
            <Button className="cta-primary">Aplicar white label</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, defaultValue, placeholder }: { label: string; defaultValue?: string; placeholder?: string }) {
  return (
    <div>
      <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input defaultValue={defaultValue} placeholder={placeholder} />
    </div>
  );
}

function SelectField({ label, value, options }: { label: string; value: string; options: string[] }) {
  return (
    <div>
      <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Select defaultValue={value}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function ColorField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 shrink-0 rounded-md border border-white/10" style={{ background: value }} />
        <Input defaultValue={value} />
      </div>
    </div>
  );
}

function UploadBox({ label }: { label: string }) {
  return (
    <div>
      <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <button type="button" className="flex h-28 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-xs text-muted-foreground transition hover:border-white/30 hover:bg-white/[0.04]">
        <Plus className="h-4 w-4" />
        Clique para enviar
      </button>
    </div>
  );
}

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
