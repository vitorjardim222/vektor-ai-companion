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

// ---------- IPTV Plans ----------
export type IptvPlan = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  durationDays: number;
  price: number | string;
  currency: string;
  connectionsLimit: number;
  trialEnabled: boolean;
  trialDurationHours: number;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type IptvRenewalRule = {
  id: string;
  organizationId: string;
  planId: string | null;
  reminderDaysBefore: number[];
  overdueDaysAfter: number[];
  assignedAiPoolId: string | null;
  messageTemplate: string | null;
  active: boolean;
};

export const iptvApi = {
  listPlans: (orgId: string) =>
    api<{ plans: IptvPlan[] }>(`/organizations/${orgId}/iptv-plans`),
  createPlan: (orgId: string, input: Partial<IptvPlan>) =>
    api<{ plan: IptvPlan }>(`/organizations/${orgId}/iptv-plans`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updatePlan: (orgId: string, id: string, input: Partial<IptvPlan>) =>
    api<{ plan: IptvPlan }>(`/organizations/${orgId}/iptv-plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deletePlan: (orgId: string, id: string) =>
    api<{ deleted?: boolean; disabled?: boolean; plan?: IptvPlan }>(
      `/organizations/${orgId}/iptv-plans/${id}`,
      { method: "DELETE" },
    ),
  reorderPlans: (orgId: string, items: { id: string; sortOrder: number }[]) =>
    api<{ ok: true }>(`/organizations/${orgId}/iptv-plans/reorder`, {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
  listRenewalRules: (orgId: string) =>
    api<{ rules: IptvRenewalRule[] }>(`/organizations/${orgId}/iptv-renewal-rules`),
  createRenewalRule: (orgId: string, input: Partial<IptvRenewalRule>) =>
    api<{ rule: IptvRenewalRule }>(`/organizations/${orgId}/iptv-renewal-rules`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateRenewalRule: (orgId: string, id: string, input: Partial<IptvRenewalRule>) =>
    api<{ rule: IptvRenewalRule }>(`/organizations/${orgId}/iptv-renewal-rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};

// ---------- Contacts ----------
export type Contact = {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  source: string | null;
  status: string;
  tags: string[];
  notes: string | null;
  leadStage: string | null;
  assignedUserId: string | null;
  assignedAiPoolId: string | null;
  iptvPlanId: string | null;
  iptvExpiresAt: string | null;
  lastInteractionAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const contactApi = {
  list: (orgId: string, params?: { q?: string; tag?: string; status?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => v) as [string, string][],
    ).toString();
    return api<{ contacts: Contact[] }>(
      `/organizations/${orgId}/contacts${qs ? `?${qs}` : ""}`,
    );
  },
  create: (orgId: string, input: Partial<Contact>) =>
    api<{ contact: Contact }>(`/organizations/${orgId}/contacts`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (orgId: string, id: string, input: Partial<Contact>) =>
    api<{ contact: Contact }>(`/organizations/${orgId}/contacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (orgId: string, id: string) =>
    api<{ deleted: true }>(`/organizations/${orgId}/contacts/${id}`, { method: "DELETE" }),
};
