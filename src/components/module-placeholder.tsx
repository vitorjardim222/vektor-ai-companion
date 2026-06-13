import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: string;
}

export function ModulePlaceholder({ icon: Icon, title, description, cta = "Em breve" }: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button className="cta-primary">
          {cta}
        </Button>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border glass-panel min-h-[420px]">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-32 left-1/2 h-64 w-[480px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-[var(--shadow-glow)]">
            <Icon className="h-6 w-6 text-accent" />
          </div>
          <h3 className="font-display text-lg font-semibold">Módulo pronto para evolução</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta tela já está integrada ao núcleo da VEKTOR. As regras de negócio, integrações
            e fluxos de dados reais serão conectados na próxima fase.
          </p>
        </div>
      </div>
    </div>
  );
}
