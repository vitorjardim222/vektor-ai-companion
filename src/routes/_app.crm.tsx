import { createFileRoute } from "@tanstack/react-router";
import { Kanban } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/crm")({
  head: () => ({ meta: [{ title: "CRM Pipeline — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={Kanban}
      title="CRM Pipeline"
      description="Drag-and-drop pipeline with stages, tasks, follow-ups and revenue tracking."
    />
  ),
});
