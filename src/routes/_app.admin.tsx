import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Super Admin — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={ShieldCheck}
      title="Super Admin"
      description="Tenants, consumo, limites, faturamento e monitoramento global do sistema."
    />
  ),
});
