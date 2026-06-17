import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const isConversations = pathname === "/conversations";
  const { ready, isAuthenticated, backendError, refresh } = useAuth();
  const navigate = useNavigate();
  const hasToken = useMemo(
    () => typeof window !== "undefined" && !!window.localStorage.getItem("vektor.auth.token"),
    [],
  );

  useEffect(() => {
    if (ready && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [ready, isAuthenticated, navigate]);

  if (!ready || !isAuthenticated) {
    if (ready && hasToken && backendError) {
      return (
        <div className="flex h-[100dvh] items-center justify-center bg-background px-4 text-center">
          <div className="max-w-md space-y-4">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-300" />
            <h1 className="text-xl font-semibold text-foreground">Não foi possível carregar sua sessão</h1>
            <p className="text-sm text-muted-foreground">A API demorou para responder. Tente novamente sem travar a página.</p>
            <div className="flex justify-center gap-2">
              <Button onClick={() => refresh()}>Tentar novamente</Button>
              <Button variant="ghost" onClick={() => navigate({ to: "/login", replace: true })}>Ir para login</Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider className="min-h-0 overflow-hidden">
      <div
        className="flex w-full overflow-hidden bg-background"
        style={{ height: "100dvh", maxHeight: "100dvh" }}
      >
        <AppSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {!isConversations && <Topbar />}
          <main
            className={
              isConversations
                ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                : "min-h-0 min-w-0 flex-1 overflow-y-auto p-6"
            }
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
