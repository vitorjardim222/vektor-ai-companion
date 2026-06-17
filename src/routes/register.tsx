import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
  console.log("[register] render");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[register] submit");
    setError("");

    if (!name.trim()) return setError("Informe seu nome completo.");
    if (!company.trim()) return setError("Informe o nome da empresa.");
    if (!email.trim()) return setError("Informe um e-mail válido.");
    if (password.length < 8) return setError("A senha precisa de pelo menos 8 caracteres.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          organizationName: company.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError((data && (data.message || data.error)) || `Erro HTTP ${res.status}`);
        setLoading(false);
        return;
      }
      if (data?.token) {
        try {
          window.localStorage.setItem("vektor.auth.token", data.token);
        } catch {}
      }
      window.location.href = "/login";
    } catch (err) {
      console.error("[register] fetch error", err);
      setError("Falha de rede. Verifique a API.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#0a0a0a", color: "#fff" }}>
      <div style={{ width: "100%", maxWidth: 420, border: "1px solid #222", borderRadius: 12, padding: 24, background: "#111" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Crie sua conta</h1>
        <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>Comece seu teste grátis de 14 dias.</p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 13 }}>Nome completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              console.log("[register] name change");
              setName(e.target.value);
            }}
            placeholder="Maria Silva"
            style={inputStyle}
          />

          <label style={{ fontSize: 13 }}>Empresa</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Sua empresa"
            style={inputStyle}
          />

          <label style={{ fontSize: 13 }}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            style={inputStyle}
          />

          <label style={{ fontSize: 13 }}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo de 8 caracteres"
            style={inputStyle}
          />

          {error && (
            <div style={{ color: "#f87171", fontSize: 13, marginTop: 4 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: loading ? "#0891b2" : "#06b6d4",
              color: "#000",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Criando…" : "Criar workspace"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 13, color: "#888", textAlign: "center" }}>
          Já tem uma conta? <a href="/login" style={{ color: "#22d3ee" }}>Entrar</a>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#0a0a0a",
  color: "#fff",
  fontSize: 14,
  outline: "none",
};
