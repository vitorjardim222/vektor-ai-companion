import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/conversations")({
  head: () => ({ meta: [{ title: "Conversations — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={MessagesSquare}
      title="Conversations"
      description="Unified inbox for all WhatsApp sessions, with AI assist and human handoff."
    />
  ),
});
