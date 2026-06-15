"use client";

import * as React from "react";
import type { PublicUser } from "@/lib/types";
import { syncOnLogin, setCloudEnabled, resetLocalTrips } from "@/lib/trip-store";

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: PublicUser | null) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<PublicUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user ?? null);
      // Returning visitor with a valid cookie — pull their cloud trips.
      if (data.user) await syncOnLogin();
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const signup = React.useCallback(
    async (email: string, password: string, fullName?: string) => {
      const data = await postJson("/api/auth/signup", { email, password, fullName });
      setUser(data.user);
      await syncOnLogin();
    },
    [],
  );

  const login = React.useCallback(async (email: string, password: string) => {
    const data = await postJson("/api/auth/login", { email, password });
    setUser(data.user);
    await syncOnLogin();
  }, []);

  const logout = React.useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setCloudEnabled(false);
    resetLocalTrips(); // clear local cache so the next user starts clean
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signup,
    login,
    logout,
    refresh,
    setUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
