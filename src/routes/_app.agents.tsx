import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/agents")({
  head: () => ({ meta: [{ title: "AI Agents — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={Bot}
      title="AI Agents"
      description="Build and tune AI agents with prompts, memory, fallback and channel routing."
    />
  ),
});
