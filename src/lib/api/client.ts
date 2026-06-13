// VEKTOR A.I — Frontend API client (prepared for real backend integration)
// Currently the UI is mock-driven. As backend endpoints come online, swap
// individual hooks/queries to call this client. No UI is changed by importing
// this file; it's a thin fetch wrapper used opt-in by future features.

const TOKEN_KEY = "vektor.auth.token";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) {
    throw new ApiError(
      res.status,
      (body && typeof body === "object" && "error" in body && String(body.error)) ||
        `HTTP ${res.status}`,
      body,
    );
  }
  return body as T;
}

// ---------- Auth ----------
export type AuthUser = { id: string; email: string; name: string | null; avatarUrl?: string | null };
export type AuthOrg = { id: string; name: string; slug: string; role: string };

export const authApi = {
  register: (input: { name: string; email: string; password: string; organizationName: string }) =>
    api<{ token: string; user: AuthUser; organizations: AuthOrg[] }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  login: (input: { email: string; password: string }) =>
    api<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  me: () => api<{ user: AuthUser | null; organizations?: AuthOrg[] }>("/auth/me"),
};

// ---------- Organizations ----------
export const orgApi = {
  list: () => api<{ organizations: AuthOrg[] }>("/organizations"),
  create: (input: { name: string; slug: string }) =>
    api<{ organization: { id: string; name: string; slug: string } }>("/organizations", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  get: (id: string) => api(`/organizations/${id}`),
};

// ---------- Health ----------
export const healthApi = {
  ping: () => api<{ status: string; service: string; time: string }>("/health"),
  db: () => api<{ status: string; db: string }>("/health/db"),
};
