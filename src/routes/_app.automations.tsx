import { createFileRoute } from "@tanstack/react-router";
import { Workflow } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/automations")({
  head: () => ({ meta: [{ title: "Automations — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={Workflow}
      title="Automations"
      description="Visual flows, scheduled campaigns, triggers and rapid replies."
    />
  ),
});
