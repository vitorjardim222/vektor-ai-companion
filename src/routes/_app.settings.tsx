import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Configurações — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={Settings}
      title="Configurações"
      description="Chaves de API, webhooks, integrações, notificações e branding white-label."
    />
  ),
});
