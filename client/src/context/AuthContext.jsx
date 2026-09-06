import React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { API } from "../config/api";

const AuthCtx = createContext();

async function parseApiResponse(res) {
  const raw = await res.text();

  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    if (raw && (raw.includes("<html") || raw.includes("405 Not Allowed") || raw.includes("404 Not Found"))) {
      return { error: `Server unavailable (${res.status}). Switching to local demo mode.` };
    }
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

    // If it's a local/demo token, no need to call backend
    if (token.startsWith("local-") || token.startsWith("demo-")) {
      setLoading(false);
      return;
    }

    fetch(`${API}/auth/me`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (u) setUser(u);
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

  const loginLocally = (email, password) => {
    const localUsers = JSON.parse(localStorage.getItem("local_users") || "[]");
    const existing = localUsers.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    const userObj = existing || {
      _id: "local-" + Date.now(),
      id: "local-" + Date.now(),
      username: email.split("@")[0] || "Listener",
      email: email,
      isLocal: true,
    };

    if (!existing) {
      localUsers.push({ ...userObj, password });
      localStorage.setItem("local_users", JSON.stringify(localUsers));
    }

    localStorage.setItem("token", "local-token-" + Date.now());
    localStorage.setItem("demo_user", JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const registerLocally = (username, email, password) => {
    const localUsers = JSON.parse(localStorage.getItem("local_users") || "[]");
    const userObj = {
      _id: "local-" + Date.now(),
      id: "local-" + Date.now(),
      username: username?.trim() || email.split("@")[0] || "Listener",
      email: email,
      isLocal: true,
    };

    localUsers.push({ ...userObj, password });
    localStorage.setItem("local_users", JSON.stringify(localUsers));

    localStorage.setItem("token", "local-token-" + Date.now());
    localStorage.setItem("demo_user", JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (res.status === 405 || res.status === 404 || contentType.includes("text/html")) {
        return loginLocally(email, password);
      }

      const data = await parseApiResponse(res);
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.removeItem("demo_user");
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      // Fall back to offline/local login if backend is unavailable on static host
      if (
        err.message?.includes("405") ||
        err.message?.includes("Failed to fetch") ||
        err.name === "TypeError"
      ) {
        return loginLocally(email, password);
      }
      throw err;
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (res.status === 405 || res.status === 404 || contentType.includes("text/html")) {
        return registerLocally(username, email, password);
      }

      const data = await parseApiResponse(res);
      if (!res.ok) throw new Error(data.error || "Registration failed");

      localStorage.removeItem("demo_user");
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      // Fall back to offline/local register if backend is unavailable on static host
      if (
        err.message?.includes("405") ||
        err.message?.includes("Failed to fetch") ||
        err.name === "TypeError"
      ) {
        return registerLocally(username, email, password);
      }
      throw err;
    }
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

