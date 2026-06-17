import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterScreen() {
  console.log("[register] render");

  const nameRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("[register] submit");
    if (loading) return;

    const name = nameRef.current?.value.trim() ?? "";
    const company = companyRef.current?.value.trim() ?? "";
    const email = emailRef.current?.value.trim().toLowerCase() ?? "";
    const password = passwordRef.current?.value ?? "";

    setError(null);

    if (!name) return setError("Informe seu nome completo.");
    if (!company) return setError("Informe o nome da empresa.");
    if (!email) return setError("Informe um e-mail válido.");
    if (password.length < 8) return setError("A senha precisa de pelo menos 8 caracteres.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ name, email, password, organizationName: company }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message = (data && (data.message || data.error)) || `Erro HTTP ${res.status}`;
        setError(message);
        toast.error(message);
        return;
      }
      if (data?.token) {
        try {
          window.localStorage.setItem("vektor.auth.token", data.token);
        } catch {}
      }
      toast.success("Workspace criado");
      window.location.href = "/login";
    } catch (err) {
      console.error("[register] fetch error", err);
      const message = "Falha de rede. Verifique a API.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
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
          <div className="mb-8 lg:hidden">
            <BrandLogo />
          </div>
          <div className="rounded-2xl border border-border glass-panel p-8 shadow-[var(--shadow-elevated)]">
            <h1 className="font-display text-2xl font-bold">Crie sua conta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Comece seu teste grátis de 14 dias.</p>

            <form className="mt-6 space-y-4" noValidate onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" ref={nameRef} name="name" type="text" placeholder="Maria Silva" autoComplete="name" onChange={() => console.log("[register] name change")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input id="company" ref={companyRef} name="company" type="text" placeholder="Sua empresa" autoComplete="organization" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" ref={emailRef} name="email" type="email" placeholder="voce@empresa.com" autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" ref={passwordRef} name="password" type="password" placeholder="Mínimo de 8 caracteres" autoComplete="new-password" />
              </div>

              {error ? (
                <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <Button type="submit" disabled={loading} className="w-full cta-primary">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Criar workspace <ArrowRight className="ml-1.5 h-4 w-4" /></>}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Já tem uma conta? <a href="/login" className="text-accent hover:underline">Entrar</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}