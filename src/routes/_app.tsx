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
    <SidebarProvider open={isConversations ? false : undefined}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {!isConversations && <Topbar />}
          <main className={isConversations ? "flex min-w-0 flex-1 flex-col overflow-hidden" : "flex min-w-0 flex-1 flex-col p-6"}>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
