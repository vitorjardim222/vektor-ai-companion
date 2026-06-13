import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/contacts")({
  head: () => ({ meta: [{ title: "Contatos — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={Users}
      title="Contatos"
      description="Todos os contatos dos seus canais, segmentados e enriquecidos."
    />
  ),
});
