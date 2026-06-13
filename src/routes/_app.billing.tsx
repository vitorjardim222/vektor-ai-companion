import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({ meta: [{ title: "Billing — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={CreditCard}
      title="Billing"
      description="Plan, invoices, usage and payment methods for your workspace."
    />
  ),
});
