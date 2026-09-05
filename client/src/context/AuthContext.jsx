import React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { API } from "../config/api";

const AuthCtx = createContext();

async function parseApiResponse(res) {
  const raw = await res.text();

  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return { error: raw || "Unexpected server response" };
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API}/auth/me`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (username, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error(data.error || "Registration failed");

    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors and clear local auth state anyway.
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

