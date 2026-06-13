import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare, Bot, Users, TrendingUp, Smartphone, Activity } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — VEKTOR A.I" }] }),
  component: Dashboard,
});

const stats = [
  { label: "Conversations today", value: "12,847", delta: "+18.2%", icon: MessagesSquare },
  { label: "AI resolved", value: "92.4%", delta: "+3.1%", icon: Bot },
  { label: "Leads captured", value: "1,284", delta: "+24%", icon: Users },
  { label: "Conversion rate", value: "8.7%", delta: "+1.4%", icon: TrendingUp },
  { label: "WhatsApp connected", value: "12 / 15", delta: "Healthy", icon: Smartphone },
  { label: "Messages sent", value: "284,109", delta: "+12%", icon: Activity },
];

function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening across your workspace right now.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="group relative overflow-hidden rounded-2xl border border-border glass-panel p-5 transition hover:border-primary/40">
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
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl opacity-0 transition group-hover:opacity-100" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border glass-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Engagement</h3>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
          </div>
          <div className="flex h-64 items-end gap-2">
            {Array.from({ length: 30 }).map((_, i) => {
              const h = 25 + Math.abs(Math.sin(i * 0.6)) * 70 + (i % 5) * 4;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-primary/70 to-accent/70"
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border glass-panel p-6">
          <h3 className="font-display text-lg font-semibold">Recent activity</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              { who: "Agent Aurora", what: "resolved 24 conversations", when: "2m ago" },
              { who: "Mariana", what: "took over a VIP chat", when: "12m ago" },
              { who: "Automation", what: "sent 1.2k follow-ups", when: "1h ago" },
              { who: "WhatsApp #3", what: "reconnected successfully", when: "3h ago" },
              { who: "Agent Nova", what: "captured 18 new leads", when: "5h ago" },
            ].map((a, i) => (
              <li key={i} className="flex items-start justify-between gap-3 border-b border-border/40 pb-3 last:border-0">
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
