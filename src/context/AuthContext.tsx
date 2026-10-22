"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { ApiError, configureHttp } from "@/lib/api/http";
import { usersApi } from "@/lib/api/users";
import { decodeJwtPayload } from "@/lib/jwt";

const STORAGE_KEY = "futbol-admin-session";

/** Lo que persistimos del login. El backend no tiene refresh token. */
interface StoredSession {
  accessToken: string;
  /** ISO-8601 que devuelve el backend en `expiresAt`. */
  expiresAt: string;
  userId: string;
  email: string;
}

/** Usuario de la sesión. `roleNames` queda vacío si el rol no puede consultarlo. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roleNames: string[];
}

interface AuthContextValue {
  user: SessionUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** `true` mientras se rehidrata la sesión desde el storage. */
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** El login puede guardarse en localStorage ("mantener sesión") o solo en la pestaña. */
function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as StoredSession;
      if (parsed?.accessToken && parsed?.userId) return parsed;
    } catch {
      // Storage bloqueado o contenido corrupto: se ignora.
    }
  }

  return null;
}

function writeStoredSession(session: StoredSession, remember: boolean) {
  try {
    const target = remember ? window.localStorage : window.sessionStorage;
    const other = remember ? window.sessionStorage : window.localStorage;
    other.removeItem(STORAGE_KEY);
    target.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Sin storage la sesión vive solo en memoria hasta recargar.
  }
}

function clearStoredSession() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que limpiar.
  }
}

const isExpired = (expiresAt: string) => {
  const time = new Date(expiresAt).getTime();
  return Number.isFinite(time) ? time <= Date.now() : false;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<StoredSession | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // http.ts lee el token por referencia para no re-configurarse en cada render.
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = session?.accessToken ?? null;

  const logout = useCallback(() => {
    clearStoredSession();
    tokenRef.current = null;
    setSession(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  // El token dura 15 minutos y no hay refresh: un 401 cierra la sesión.
  useEffect(() => {
    configureHttp({
      getToken: () => tokenRef.current,
      onUnauthorized: () => {
        clearStoredSession();
        tokenRef.current = null;
        setSession(null);
        setUser(null);
      },
    });
  }, []);

  /**
   * El login solo devuelve el token, así que el usuario se arma con los claims
   * (`sub`, `email`) y se completa con el backend. `detail-with-roles` puede dar
   * 403 según el rol, y en ese caso se cae al endpoint simple.
   */
  const hydrateUser = useCallback(async (stored: StoredSession): Promise<SessionUser> => {
    const numericId = Number(stored.userId);

    try {
      const detail = await usersApi.findByIdWithRoles(numericId);
      return {
        id: String(detail.id),
        name: detail.name,
        email: detail.email,
        roleNames: detail.roles.map((link) => link.role.name),
      };
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) throw error;

      try {
        const basic = await usersApi.findById(numericId);
        return { id: String(basic.id), name: basic.name, email: basic.email, roleNames: [] };
      } catch (innerError) {
        if (innerError instanceof ApiError && innerError.isUnauthorized) throw innerError;
        // Sin permiso para leerse a sí mismo: la sesión sigue siendo válida.
        return { id: stored.userId, name: stored.email, email: stored.email, roleNames: [] };
      }
    }
  }, []);

  // Rehidratación al montar.
  useEffect(() => {
    let active = true;

    const stored = readStoredSession();
    if (!stored || isExpired(stored.expiresAt)) {
      clearStoredSession();
      setLoading(false);
      return;
    }

    tokenRef.current = stored.accessToken;
    setSession(stored);

    hydrateUser(stored)
      .then((hydrated) => {
        if (active) setUser(hydrated);
      })
      .catch(() => {
        if (!active) return;
        clearStoredSession();
        tokenRef.current = null;
        setSession(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [hydrateUser]);

  const login = useCallback(
    async (email: string, password: string, remember = true) => {
      const response = await authApi.login({ email, password });
      const claims = decodeJwtPayload(response.accessToken);

      const stored: StoredSession = {
        accessToken: response.accessToken,
        expiresAt: response.expiresAt,
        userId: claims?.sub ?? "",
        email: claims?.email ?? email,
      };

      tokenRef.current = stored.accessToken;
      writeStoredSession(stored, remember);
      setSession(stored);
      setUser(await hydrateUser(stored));
      setLoading(false);
    },
    [hydrateUser],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token: session?.accessToken ?? null,
      isAuthenticated: Boolean(session),
      loading,
      login,
      logout,
    }),
    [user, session, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
