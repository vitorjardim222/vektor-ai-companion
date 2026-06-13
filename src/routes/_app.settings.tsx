import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={Settings}
      title="Settings"
      description="API keys, webhooks, integrations, notifications and white-label branding."
    />
  ),
});
