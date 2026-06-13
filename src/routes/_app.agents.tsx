import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/agents")({
  head: () => ({ meta: [{ title: "Agentes IA — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={Bot}
      title="Agentes IA"
      description="Crie e ajuste agentes de IA com prompts, memória, fallback e roteamento por canal."
    />
  ),
});
