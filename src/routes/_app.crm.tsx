import { createFileRoute } from "@tanstack/react-router";
import { Kanban } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/crm")({
  head: () => ({ meta: [{ title: "CRM — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={Kanban}
      title="Pipeline de Vendas"
      description="Funil drag-and-drop com etapas, tarefas, follow-ups e acompanhamento de receita."
    />
  ),
});
