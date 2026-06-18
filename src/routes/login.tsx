import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/brand-logo";
import { BackendStatusBanner } from "@/components/backend-status-banner";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — VEKTOR A.I" },
      { name: "description", content: "Acesse seu workspace VEKTOR A.I." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sempre que a tela de login monta, limpamos qualquer sessão anterior
  // para evitar o "vai direto" sem pedir e-mail/senha.
  useEffect(() => {
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Login realizado");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 401
            ? "E-mail ou senha inválidos."
            : err.status >= 500
              ? "Backend indisponível. Verifique a API."
              : "Não foi possível entrar."
          : "Backend indisponível. Verifique a API.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
            <BackendStatusBanner />
            <h1 className="font-display text-2xl font-bold">Bem-vindo de volta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acesse seu workspace VEKTOR.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="voce@empresa.com" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <button type="button" onClick={() => navigate({ to: "/login" })} className="text-xs text-accent hover:underline">Esqueci a senha</button>
                </div>
                <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={submitting} className="w-full cta-primary">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Entrar <ArrowRight className="ml-1.5 h-4 w-4" /></>}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Ainda não tem conta?{" "}
              <button type="button" onClick={() => navigate({ to: "/register" })} className="text-accent hover:underline">Criar agora</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
