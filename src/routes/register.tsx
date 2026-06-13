import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/brand-logo";
import { BackendStatusBanner } from "@/components/backend-status-banner";
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
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      organizationName: organizationName.trim(),
    };
    if (!payload.name) return toast.error("Informe seu nome completo.");
    if (!payload.organizationName) return toast.error("Informe o nome da empresa.");
    if (!payload.email) return toast.error("Informe um e-mail válido.");
    if (password.length < 8) return toast.error("A senha precisa de pelo menos 8 caracteres.");

    if (import.meta.env.DEV) {
      console.debug("[register] payload keys:", Object.keys(payload));
    }

    setSubmitting(true);
    try {
      await register(payload);
      toast.success("Workspace criado!");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      let msg = "Backend indisponível. Verifique a API.";
      if (err instanceof ApiError) {
        if (import.meta.env.DEV) {
          console.debug("[register] error status:", err.status, "data:", err.data);
        }
        const data = err.data as
          | { error?: string; message?: string; details?: { fieldErrors?: Record<string, string[]> } }
          | null;
        if (err.status === 409) msg = "E-mail já cadastrado.";
        else if (err.status >= 500) msg = "Backend indisponível. Verifique a API.";
        else if (err.status === 400 && data?.details?.fieldErrors) {
          const fields = data.details.fieldErrors;
          const labels: Record<string, string> = {
            name: "Nome",
            email: "E-mail",
            password: "Senha",
            organizationName: "Empresa",
          };
          const parts = Object.entries(fields)
            .filter(([, v]) => Array.isArray(v) && v.length)
            .map(([k, v]) => `${labels[k] ?? k}: ${v![0]}`);
          msg = parts.length ? parts.join(" • ") : data?.message || data?.error || "Dados inválidos.";
        } else {
          msg = data?.message || data?.error || "Não foi possível criar o workspace.";
        }
      }
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
