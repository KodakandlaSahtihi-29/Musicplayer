import React from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-art">
          <div>
            <p className="hero-subtitle">Welcome back</p>
            <h2>Listen. Control. Build your collection.</h2>
            <p className="auth-subtitle">
              Log in to manage your uploads, playlists, and playback in one place.
            </p>
          </div>

          <div className="auth-stats">
            <div className="chip">Fast playback</div>
            <div className="chip">Volume control</div>
            <div className="chip">Playlist management</div>
          </div>
        </div>

        <div className="auth-card">
          <div>
            <h1>Login</h1>
            <p className="auth-subtitle">Use the email and password from your account.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="auth-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? "Signing in..." : "Login"}
              </button>
              <p className="auth-link">
                Need an account? <Link to="/register">Register</Link>
              </p>
            </div>
          </form>

          {error && <p className="auth-error">{error}</p>}
        </div>
      </div>
    </section>
  );
}

