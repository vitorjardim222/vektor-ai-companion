import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — VEKTOR A.I" },
      { name: "description", content: "Acesse seu workspace VEKTOR A.I." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="relative grid min-h-screen overflow-hidden lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-sidebar p-10 lg:flex">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
        <BrandLogo />
        <div className="space-y-4">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Automatize. Engaje. <span className="brand-gradient-text">Escale.</span>
          </h2>
          <p className="max-w-md text-muted-foreground">
            A plataforma enterprise de WhatsApp, agentes de IA e automações inteligentes.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} VEKTOR A.I</p>
      </div>

      <div className="relative flex items-center justify-center p-6">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><BrandLogo /></div>
          <div className="rounded-2xl border border-border glass-panel p-8 shadow-[var(--shadow-elevated)]">
            <h1 className="font-display text-2xl font-bold">Bem-vindo de volta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acesse seu workspace VEKTOR.</p>

            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="voce@empresa.com" autoComplete="email" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link to="/login" className="text-xs text-accent hover:underline">Esqueci a senha</Link>
                </div>
                <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" />
              </div>
              <Button asChild className="w-full bg-[var(--gradient-brand)] text-primary-foreground hover:opacity-90">
                <Link to="/dashboard">Entrar <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link to="/register" className="text-accent hover:underline">Criar agora</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
