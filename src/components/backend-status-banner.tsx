// VEKTOR A.I — Banner de status do backend (oculto quando saudável)
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api/client";

type Status = "checking" | "ok" | "down";

export function BackendStatusBanner() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
        const ct = res.headers.get("content-type") || "";
        if (cancelled) return;
        setStatus(res.ok && ct.includes("application/json") ? "ok" : "down");
      } catch {
        if (!cancelled) setStatus("down");
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status !== "down") return null;

  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
      <p className="leading-relaxed">
        Backend não configurado. Para login e cadastro reais, defina{" "}
        <code className="rounded bg-amber-500/20 px-1 py-0.5 text-[0.8em]">VITE_API_BASE_URL</code>{" "}
        apontando para a API Fastify.
      </p>
    </div>
  );
}
