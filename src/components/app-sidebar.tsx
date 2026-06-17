import {
  LayoutDashboard,
  MessagesSquare,
  Users,
  Kanban,
  Workflow,
  Bot,
  Layers,
  Smartphone,
  BarChart3,
  Settings,
  CreditCard,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand-logo";

const main = [
  { title: "Painel", url: "/dashboard", icon: LayoutDashboard },
  { title: "Conversas", url: "/conversations", icon: MessagesSquare },
  { title: "Contatos", url: "/contacts", icon: Users },
  { title: "CRM", url: "/crm", icon: Kanban },
];

const automation = [
  { title: "Automações", url: "/automations", icon: Workflow },
  { title: "Agentes IA", url: "/agents", icon: Bot },
  { title: "Pools IA", url: "/pools", icon: Layers },
  { title: "WhatsApp", url: "/whatsapp", icon: Smartphone },
];

const insights = [
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Financeiro", url: "/billing", icon: CreditCard },
  { title: "Workspace", url: "/workspace", icon: Briefcase },
  { title: "Configurações", url: "/settings", icon: Settings },
  { title: "Admin", url: "/admin", icon: ShieldCheck },
];

export function AppSidebar() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/dashboard";
  const isActive = (url: string) => pathname === url;
  const isConversations = pathname === "/conversations";

  const renderGroup = (label: string, items: typeof main) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <a href={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "border-r border-sidebar-border",
        isConversations && "h-[calc(100dvh-0px)] max-h-[calc(100dvh-0px)] overflow-hidden",
      )}
    >
      <SidebarHeader className="border-b border-sidebar-border p-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <BrandLogo />
      </SidebarHeader>
      <SidebarContent className={cn("gap-2 py-2", isConversations && "overflow-hidden")}>
        {renderGroup("Workspace", main)}
        {renderGroup("Automação", automation)}
        {renderGroup("Sistema", insights)}
      </SidebarContent>
    </Sidebar>
  );
}
