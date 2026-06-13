import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Criar conta — VEKTOR A.I" },
      { name: "description", content: "Crie seu workspace VEKTOR A.I em minutos." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="relative grid min-h-screen overflow-hidden lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-sidebar p-10 lg:flex">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
        <BrandLogo />
        <div className="space-y-4">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Lance seu <span className="brand-gradient-text">workspace de IA</span> em minutos.
          </h2>
          <p className="max-w-md text-muted-foreground">
            14 dias de teste grátis. Sem cartão de crédito. Multi-tenant desde o dia um.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} VEKTOR A.I</p>
      </div>

      <div className="relative flex items-center justify-center p-6">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><BrandLogo /></div>
          <div className="rounded-2xl border border-border glass-panel p-8 shadow-[var(--shadow-elevated)]">
            <h1 className="font-display text-2xl font-bold">Crie sua conta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Comece seu teste grátis de 14 dias.</p>

            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" placeholder="Maria Silva" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" placeholder="Sua empresa" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail corporativo</Label>
                <Input id="email" type="email" placeholder="voce@empresa.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="Mínimo de 8 caracteres" />
              </div>
              <Button asChild className="w-full bg-[var(--gradient-brand)] text-primary-foreground hover:opacity-90">
                <Link to="/dashboard">Criar workspace <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-accent hover:underline">Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
