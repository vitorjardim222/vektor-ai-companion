import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare, Bot, Users, TrendingUp, Smartphone, Activity } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Painel — VEKTOR A.I" }] }),
  component: Dashboard,
});

const stats = [
  { label: "Conversas hoje", value: "12.847", delta: "+18,2%", icon: MessagesSquare },
  { label: "Resolvidas pela IA", value: "92,4%", delta: "+3,1%", icon: Bot },
  { label: "Leads captados", value: "1.284", delta: "+24%", icon: Users },
  { label: "Taxa de conversão", value: "8,7%", delta: "+1,4%", icon: TrendingUp },
  { label: "WhatsApp conectados", value: "12 / 15", delta: "Saudável", icon: Smartphone },
  { label: "Mensagens enviadas", value: "284.109", delta: "+12%", icon: Activity },
];

const activity = [
  { who: "Agente Aurora", what: "resolveu 24 conversas", when: "há 2min" },
  { who: "Mariana", what: "assumiu um atendimento VIP", when: "há 12min" },
  { who: "Automação", what: "enviou 1,2 mil follow-ups", when: "há 1h" },
  { who: "WhatsApp #3", what: "reconectado com sucesso", when: "há 3h" },
  { who: "Agente Nova", what: "captou 18 novos leads", when: "há 5h" },
];

function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Veja o que está acontecendo no seu workspace agora.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border border-border glass-panel p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
                <p className="mt-1 text-xs text-accent">{s.delta}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border glass-panel p-6">
          <h3 className="font-display text-lg font-semibold">Engajamento</h3>
          <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          <div className="mt-6 flex h-48 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
            Gráfico em breve
          </div>
        </div>

        <div className="rounded-2xl border border-border glass-panel p-6">
          <h3 className="font-display text-lg font-semibold">Atividade recente</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {activity.map((a, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-3 border-b border-border/40 pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium">{a.who}</p>
                  <p className="text-xs text-muted-foreground">{a.what}</p>
                </div>
                <span className="text-xs text-muted-foreground">{a.when}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
