import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../api/client";

export type Role = "candidate" | "recruiter" | "admin";
export interface CurrentUser {
  id: string;
  email: string;
  roles: Role[];
  profileVersion: number;
}

interface AuthCtx {
  user: CurrentUser | null;
  loading: boolean;
  hasRole: (r: Role) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const { data } = await api.get<CurrentUser>("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    setUser({ ...data, profileVersion: 1 });
  }

  async function register(email: string, password: string) {
    const { data } = await api.post("/auth/register", { email, password });
    setUser({ ...data, profileVersion: 1 });
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  function hasRole(r: Role) {
    return !!user && (user.roles.includes(r) || user.roles.includes("admin"));
  }

  return (
    <Ctx.Provider value={{ user, loading, hasRole, login, register, logout }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
