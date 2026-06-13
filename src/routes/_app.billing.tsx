import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({ meta: [{ title: "Financeiro — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={CreditCard}
      title="Financeiro"
      description="Plano, faturas, consumo e métodos de pagamento do seu workspace."
    />
  ),
});
