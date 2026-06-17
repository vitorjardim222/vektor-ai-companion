// =============================================================
// VEKTOR A.I — SPA entry point (for static/nginx VPS deploy)
// Used by vite.config.spa.ts. Bypasses TanStack Start SSR and
// mounts the router fully on the client.
// =============================================================
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RegisterScreen } from "./components/register-screen";
import { Toaster } from "./components/ui/sonner";
import "./styles.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root not found");

if (window.location.pathname === "/register") {
  createRoot(rootEl).render(
    <>
      <RegisterScreen />
      <Toaster richColors closeButton position="top-right" />
    </>,
  );
} else {
  const [{ getRouter }, { RouterProvider }, { QueryClientProvider }] = await Promise.all([
    import("./router"),
    import("@tanstack/react-router"),
    import("@tanstack/react-query"),
  ]);
  const router = getRouter();
  const queryClient = (
    router.options.context as { queryClient: import("@tanstack/react-query").QueryClient }
  ).queryClient;

  createRoot(rootEl).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
