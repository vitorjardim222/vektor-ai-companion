import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const isConversations = pathname === "/conversations";
  const { ready, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [ready, isAuthenticated, navigate]);

  if (!ready || !isAuthenticated) {
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
