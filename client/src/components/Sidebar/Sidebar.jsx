import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <p className="section-kicker">Musify</p>
        <h2>Music Player</h2>
        <p>Upload, queue, and listen from one clean workspace.</p>
      </div>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/library">Library</NavLink>
        <NavLink to="/upload">Upload</NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div>
            <strong>{user?.username || "Guest"}</strong>
            <span className="sidebar-meta">Your account</span>
          </div>
          <div className="user-pill">{(user?.username || "G")[0].toUpperCase()}</div>
        </div>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

