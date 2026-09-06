import React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import SongCard from "../components/SongCard/SongCard";
import { API } from "../config/api";
import { DEMO_SONGS } from "../data/demoSongs";

function Home() {
  const { user } = useAuth();
  const { currentSong, clearSong } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSongs = async () => {
      let serverSongs = [];
      try {
        const res = await fetch(`${API}/songs`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            serverSongs = data;
          }
        }
      } catch {
        // static host or offline mode
      }

      const localSongs = JSON.parse(localStorage.getItem("local_songs") || "[]");
      if (serverSongs.length > 0) {
        setSongs([...localSongs, ...serverSongs]);
      } else {
        setSongs([...localSongs, ...DEMO_SONGS]);
      }
      setLoading(false);
    };

    loadSongs();
  }, []);

  const handleRemove = async (songId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/upload/song/${songId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Keep UI responsive even if delete fails; user can retry.
    }
    const localSongs = JSON.parse(localStorage.getItem("local_songs") || "[]");
    const updatedLocal = localSongs.filter((s) => s._id !== songId);
    localStorage.setItem("local_songs", JSON.stringify(updatedLocal));

    setSongs((prev) => prev.filter((song) => song._id !== songId));
    if (currentSong?._id === songId) {
      clearSong();
    }
  };

  return (
    <section>
      <div className="section-card home-hero">
        <div>
          <p className="hero-subtitle">Music Player</p>
          <h1>Discover your library, instantly.</h1>
          <p className="hero-subtitle hero-subtitle-soft">
            Stream what you uploaded, jump between tracks, and control playback from a polished desktop layout.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric">
            <strong>{songs.length}</strong>
            <span>Tracks available</span>
          </div>
          <div className="metric">
            <strong>Now Playing</strong>
            <span>Bottom player bar</span>
          </div>
        </div>
      </div>

      {loading && <p className="muted">Loading songs...</p>}

      {!loading && songs.length === 0 && <p className="muted">No songs yet. Upload your first track.</p>}

      <div className="section-header">
        <div>
          <h2>Recently uploaded</h2>
          <p>Your latest tracks are listed below.</p>
        </div>
        <div className="section-chip">Fresh library view</div>
      </div>

      <div className="songs-grid">
        {songs.map((song) => (
          <SongCard
            key={song._id}
            song={song}
            onRemove={String(song.uploadedBy) === String(user?.id) ? () => handleRemove(song._id) : undefined}
          />
        ))}
      </div>
    </section>
  );
}

export default Home;

