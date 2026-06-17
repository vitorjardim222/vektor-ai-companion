// VEKTOR A.I — Frontend API client (prepared for real backend integration)
// Currently the UI is mock-driven. As backend endpoints come online, swap
// individual hooks/queries to call this client. No UI is changed by importing
// this file; it's a thin fetch wrapper used opt-in by future features.

const TOKEN_KEY = "vektor.auth.token";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 7000);

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  init.signal?.addEventListener("abort", () => controller.abort(), { once: true });

  let res: Response | null = null;
  let body: unknown;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, signal: controller.signal });
    const isJson = res.headers.get("content-type")?.includes("application/json");
    body = isJson ? await res.json().catch(() => null) : await res.text();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(408, "request_timeout", null);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res) throw new ApiError(0, "network_error", null);
  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `HTTP ${res.status}`;
    throw new ApiError(
      res.status,
      message,
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

// ---------- Analytics ----------
export type AnalyticsOverview = {
  kpis: {
    mensagensTotal: number;
    taxaResolucaoIA: number;
    taxaHandoffHumano: number;
    conversaoLeads: number;
    receitaMensal: number;
    cobrancasVencidas: number;
    renovacoesIptv: number;
    sessoesWhatsappAtivas: number;
    sucessoAutomacoes: number;
  };
  messagesPerDay: { date: string; enviadas: number; recebidas: number }[];
  leadsBySource: { source: string; value: number }[];
  funnel: { stage: string; value: number }[];
  revenueMonthly: { month: string; value: number }[];
  overdueBilling: { date: string; value: number }[];
  iptvRenewals: { date: string; renovados: number; vencidos: number }[];
  agentPerformance: { name: string; atendimentos: number; resolucao: number }[];
  poolPerformance: { name: string; conversas: number; sucesso: number }[];
  aiProviderUsage: { provider: string; tokens: number; cost: number }[];
  whatsappSessions: { name: string; status: string; uptime: number }[];
};

export const analyticsApi = {
  overview: (orgId: string) =>
    api<AnalyticsOverview>(`/organizations/${orgId}/analytics/overview`),
};

// ---------- WhatsApp ----------
export type WhatsAppStatus = "DISCONNECTED" | "CONNECTING" | "QR" | "CONNECTED" | "ERROR";

export type WhatsAppSession = {
  id: string;
  organizationId: string;
  name: string;
  phoneNumber: string | null;
  status: WhatsAppStatus;
  evolutionSessionId: string | null;
  qrCode: string | null;
  lastConnectionAt: string | null;
  lastMessageAt: string | null;
  assignedPoolId: string | null;
  assignedHumanId: string | null;
  autoReconnect: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export const whatsappApi = {
  list: (orgId: string) =>
    api<{ sessions: WhatsAppSession[]; evolutionConfigured: boolean }>(
      `/organizations/${orgId}/whatsapp/sessions`,
    ),
  create: (orgId: string, input: { name: string; phoneNumber?: string | null; autoReconnect?: boolean; assignedPoolId?: string | null; assignedHumanId?: string | null }) =>
    api<{ session: WhatsAppSession }>(`/organizations/${orgId}/whatsapp/sessions`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (orgId: string, id: string, input: Partial<WhatsAppSession>) =>
    api<{ session: WhatsAppSession }>(`/organizations/${orgId}/whatsapp/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (orgId: string, id: string) =>
    api<{ deleted: true }>(`/organizations/${orgId}/whatsapp/sessions/${id}`, { method: "DELETE" }),
  qrCode: (orgId: string, id: string) =>
    api<{ qrCode: string | null; status: WhatsAppStatus; configured?: boolean; error?: string }>(
      `/organizations/${orgId}/whatsapp/sessions/${id}/qrcode`,
    ),
  status: (orgId: string, id: string) =>
    api<{ session: WhatsAppSession }>(`/organizations/${orgId}/whatsapp/sessions/${id}/status`),
  connect: (orgId: string, id: string) =>
    api<{ qrCode: string | null; status: WhatsAppStatus }>(
      `/organizations/${orgId}/whatsapp/sessions/${id}/connect`,
      { method: "POST" },
    ),
  disconnect: (orgId: string, id: string) =>
    api<{ session: WhatsAppSession }>(
      `/organizations/${orgId}/whatsapp/sessions/${id}/disconnect`,
      { method: "POST" },
    ),
};
