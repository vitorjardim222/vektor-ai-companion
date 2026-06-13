import { createFileRoute } from "@tanstack/react-router";
import { Smartphone } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/whatsapp")({
  head: () => ({ meta: [{ title: "WhatsApp — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={Smartphone}
      title="Sessões de WhatsApp"
      description="Conecte números via QR Code, monitore status e gerencie caixas multi-sessão."
    />
  ),
});
