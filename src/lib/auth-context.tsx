// VEKTOR A.I — Auth context (real backend wiring)
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, getAuthToken, setAuthToken, type AuthOrg, type AuthUser, ApiError } from "./api/client";

const ORG_KEY = "vektor.auth.orgId";
const AUTH_BOOT_TIMEOUT_MS = 7000;

type AuthState = {
  ready: boolean;
  loading: boolean;
  user: AuthUser | null;
  organizations: AuthOrg[];
  currentOrgId: string | null;
  isAuthenticated: boolean;
  backendError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; organizationName: string }) => Promise<void>;
  logout: () => void;
  setCurrentOrgId: (id: string) => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organizations, setOrganizations] = useState<AuthOrg[]>([]);
  const [currentOrgId, setCurrentOrgIdState] = useState<string | null>(
    typeof window !== "undefined" ? window.localStorage.getItem(ORG_KEY) : null,
  );
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const setCurrentOrgId = useCallback((id: string) => {
    setCurrentOrgIdState(id);
    if (typeof window !== "undefined") window.localStorage.setItem(ORG_KEY, id);
  }, []);

  const applyMe = useCallback(
    (data: { user: AuthUser | null; organizations?: AuthOrg[] }) => {
      setUser(data.user);
      const orgs = data.organizations ?? [];
      setOrganizations(orgs);
      const saved = typeof window !== "undefined" ? window.localStorage.getItem(ORG_KEY) : null;
      const next = saved && orgs.some((o) => o.id === saved) ? saved : orgs[0]?.id ?? null;
      if (next) setCurrentOrgId(next);
      else setCurrentOrgIdState(null);
    },
    [setCurrentOrgId],
  );

  const refresh = useCallback(async () => {
    if (!getAuthToken()) {
      setUser(null);
      setOrganizations([]);
      setReady(true);
      return;
    }
    try {
      const me = await authApi.me();
      applyMe(me);
      setBackendError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthToken(null);
        setUser(null);
        setOrganizations([]);
      } else {
        setBackendError("Backend indisponível. Verifique a API.");
      }
    } finally {
      setReady(true);
    }
  }, [applyMe]);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      if (!active) return;
      setBackendError("Backend indisponível. Verifique a API.");
      setReady(true);
    }, AUTH_BOOT_TIMEOUT_MS);
    refresh().finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const r = await authApi.login({ email, password });
        setAuthToken(r.token);
        await refresh();
      } finally {
        setLoading(false);
      }
    },
    [refresh],
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string; organizationName: string }) => {
      setLoading(true);
      try {
        const r = await authApi.register(input);
        setAuthToken(r.token);
        applyMe({ user: r.user, organizations: r.organizations });
      } finally {
        setLoading(false);
      }
    },
    [applyMe],
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    if (typeof window !== "undefined") window.localStorage.removeItem(ORG_KEY);
    setUser(null);
    setOrganizations([]);
    setCurrentOrgIdState(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      loading,
      user,
      organizations,
      currentOrgId,
      isAuthenticated: !!user,
      backendError,
      login,
      register,
      logout,
      setCurrentOrgId,
      refresh,
    }),
    [ready, loading, user, organizations, currentOrgId, backendError, login, register, logout, setCurrentOrgId, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function useCurrentOrgId(): string | null {
  return useAuth().currentOrgId;
}
