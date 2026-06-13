import { Bell, LogOut, Search, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";

export function Topbar() {
  const { user, organizations, currentOrgId, logout } = useAuth();
  const navigate = useNavigate();
  const currentOrg = organizations.find((o) => o.id === currentOrgId);
  const initials = (user?.name || user?.email || "VK")
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "VK";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl">
      <SidebarTrigger className="text-muted-foreground" />
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar conversas, contatos, agentes…"
          className="h-9 border-border/60 bg-secondary/50 pl-9 text-sm"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        {currentOrg && (
          <Badge variant="outline" className="hidden gap-1.5 border-border/60 bg-secondary/40 text-foreground sm:inline-flex">
            {currentOrg.name}
          </Badge>
        )}
        <Badge variant="outline" className="hidden gap-1.5 border-accent/30 bg-accent/10 text-accent sm:inline-flex">
          <Sparkles className="h-3 w-3" />
          Teste · 14 dias
        </Badge>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>
        <Avatar className="h-9 w-9 border border-border">
          <AvatarFallback className="bg-[var(--gradient-brand)] text-xs font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          title="Sair"
          onClick={() => {
            logout();
            navigate({ to: "/login", replace: true });
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
