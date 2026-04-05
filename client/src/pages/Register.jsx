import React from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [username, setUsername] = useState("");
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
      await register(username, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-art">
          <div>
            <p className="hero-subtitle">Get started</p>
            <h2>Create your own music space.</h2>
            <p className="auth-subtitle">
              Add your account, upload tracks, and control playback from a cleaner interface.
            </p>
          </div>

          <div className="auth-stats">
            <div className="chip">Upload songs</div>
            <div className="chip">Save playlists</div>
            <div className="chip">Smooth controls</div>
          </div>
        </div>

        <div className="auth-card">
          <div>
            <h1>Create Account</h1>
            <p className="auth-subtitle">Use a username, email, and a strong password.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <div className="auth-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Register"}
              </button>
              <p className="auth-link">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </div>
          </form>

          {error && <p className="auth-error">{error}</p>}
        </div>
      </div>
    </section>
  );
}

