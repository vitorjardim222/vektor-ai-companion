import { createFileRoute } from "@tanstack/react-router";
import { Smartphone } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/whatsapp")({
  head: () => ({ meta: [{ title: "WhatsApp Sessions — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={Smartphone}
      title="WhatsApp Sessions"
      description="Connect numbers via QR code, monitor status and manage multi-session inboxes."
    />
  ),
});
