import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Super Admin — VEKTOR A.I" }] }),
  component: () => (
    <ModulePlaceholder
      icon={ShieldCheck}
      title="Super Admin"
      description="Tenants, usage, limits, billing and global system monitoring."
    />
  ),
});
