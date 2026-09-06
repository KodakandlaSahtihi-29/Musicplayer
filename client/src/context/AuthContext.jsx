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
    const demoUser = localStorage.getItem("demo_user");

    if (demoUser) {
      try {
        setUser(JSON.parse(demoUser));
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem("demo_user");
      }
    }

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

  const loginAsGuest = () => {
    const guest = {
      _id: "guest-demo-user",
      id: "guest-demo-user",
      username: "Guest Listener",
      email: "guest@musify.demo",
      isDemo: true,
    };
    localStorage.setItem("token", "demo-guest-token");
    localStorage.setItem("demo_user", JSON.stringify(guest));
    setUser(guest);
    return guest;
  };

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.removeItem("demo_user");
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

    localStorage.removeItem("demo_user");
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
    localStorage.removeItem("demo_user");
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, register, logout, loginAsGuest }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

