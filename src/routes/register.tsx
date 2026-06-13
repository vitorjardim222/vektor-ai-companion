import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Criar conta — VEKTOR A.I" },
      { name: "description", content: "Crie seu workspace VEKTOR A.I em minutos." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !organizationName) return;
    if (password.length < 8) {
      toast.error("A senha precisa de pelo menos 8 caracteres.");
      return;
    }
    setSubmitting(true);
    try {
      await register({ name, email, password, organizationName });
      toast.success("Workspace criado!");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 409
            ? "E-mail já cadastrado."
            : err.status >= 500
              ? "Backend indisponível. Verifique a API."
              : "Dados inválidos."
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

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Maria Silva" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Sua empresa" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail corporativo</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" required />
              </div>
              <Button type="submit" disabled={submitting} className="w-full cta-primary">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Criar workspace <ArrowRight className="ml-1.5 h-4 w-4" /></>}
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
