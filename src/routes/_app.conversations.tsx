import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/conversations")({
  head: () => ({ meta: [{ title: "Conversas — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={MessagesSquare}
      title="Conversas"
      description="Caixa de entrada unificada para todas as sessões de WhatsApp, com assistência por IA e transferência para humano."
    />
  ),
});
