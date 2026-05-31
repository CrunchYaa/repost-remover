import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  subscriptionExpiresAt: string | null;
  tiktokUsername: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, fingerprint: string) => Promise<void>;
  register: (username: string, email: string, password: string, fingerprint: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function apiCall(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await apiCall("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string, fingerprint: string) => {
    const data = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, deviceFingerprint: fingerprint }),
    });
    setUser(data);
  };

  const register = async (username: string, email: string, password: string, fingerprint: string) => {
    const data = await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, deviceFingerprint: fingerprint }),
    });
    setUser(data);
  };

  const logout = async () => {
    await apiCall("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function hasActiveSubscription(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!user.subscriptionExpiresAt) return false;
  return new Date(user.subscriptionExpiresAt) > new Date();
}
