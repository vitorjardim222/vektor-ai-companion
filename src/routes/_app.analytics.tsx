import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={BarChart3}
      title="Analytics"
      description="Conversão, tempo de resposta, resolução IA vs humano e atribuição de receita."
    />
  ),
});
