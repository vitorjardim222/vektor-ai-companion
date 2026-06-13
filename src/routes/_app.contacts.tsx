import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/contacts")({
  head: () => ({ meta: [{ title: "Contacts — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={Users}
      title="Contacts"
      description="All contacts across every connected channel, segmented and enriched."
    />
  ),
});
