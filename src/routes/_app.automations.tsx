import { createFileRoute } from "@tanstack/react-router";
import { Workflow } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/automations")({
  head: () => ({ meta: [{ title: "Automações — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={Workflow}
      title="Automações"
      description="Fluxos visuais, campanhas agendadas, gatilhos e respostas rápidas."
    />
  ),
});
