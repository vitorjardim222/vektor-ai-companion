import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const isConversations = pathname === "/conversations";

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

