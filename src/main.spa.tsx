// =============================================================
// VEKTOR A.I — SPA entry point (for static/nginx VPS deploy)
// Used by vite.config.spa.ts. Bypasses TanStack Start SSR and
// mounts the router fully on the client.
// =============================================================
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();
const queryClient = (router.options.context as { queryClient: import("@tanstack/react-query").QueryClient }).queryClient;


const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root not found");

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
