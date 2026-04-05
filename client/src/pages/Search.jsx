import React from "react";
import { useState } from "react";
import { useSearch } from "../hooks/useSearch";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

export default function Search() {
  const { query, results, loading, search } = useSearch();
  const { user } = useAuth();
  const { playSong, currentSong, clearSong } = usePlayer();
  const [tab, setTab] = useState("all");
  const API = "http://localhost:5000/api";

  const handleRemove = async (songId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/upload/song/${songId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      search(query, tab);
      if (currentSong?._id === songId) {
        clearSong();
      }
    } catch {
      // no-op
    }
  };

  return (
    <div className="search-page">
      <div className="search-header section-card">
        <div>
          <p className="search-intro">Explore</p>
          <h1>Search your library</h1>
          <p>Find songs, albums, and artists with live filtering.</p>
        </div>
        <div className="section-chip">{query ? `${results.songs?.length || 0} results` : "Browse mode"}</div>
      </div>

      <div className="section-card">
        <input
          type="text"
          className="search-input"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => search(e.target.value, tab)}
          autoFocus
        />
      </div>

      {query && (
        <div className="tabs">
          {["all", "songs", "albums", "artists"].map((t) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => {
                setTab(t);
                search(query, t);
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}

      {loading && <Spinner />}

      {!query && <BrowseCategories />}

      {query && results.songs?.length > 0 && (tab === "all" || tab === "songs") && (
        <section>
          <h2>Songs</h2>
          {results.songs.map((song) => (
            <SongRow
              key={song._id}
              song={song}
              onPlay={() => playSong(song)}
              onRemove={String(song.uploadedBy) === String(user?.id) ? () => handleRemove(song._id) : undefined}
            />
          ))}
        </section>
      )}

      {query && results.albums?.length > 0 && (tab === "all" || tab === "albums") && (
        <section>
          <h2>Albums</h2>
          <div className="cards-grid">
            {results.albums.map((album) => (
              <AlbumCard key={album._id} album={album} />
            ))}
          </div>
        </section>
      )}

      {query && results.artists?.length > 0 && (tab === "all" || tab === "artists") && (
        <section>
          <h2>Artists</h2>
          <div className="cards-grid">
            {results.artists.map((artist) => (
              <ArtistCard key={artist._id} artist={artist} />
            ))}
          </div>
        </section>
      )}

      {query &&
        !loading &&
        !results.songs?.length &&
        !results.albums?.length &&
        !results.artists?.length && <EmptyState query={query} />}
    </div>
  );
}

function Spinner() {
  return <p className="muted">Searching your library...</p>;
}

function BrowseCategories() {
  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2>Browse</h2>
          <p>Jump into popular moods and genres.</p>
        </div>
        <div className="section-chip">Quick picks</div>
      </div>
      <div className="cards-grid">
        {["Pop", "Hip-Hop", "Rock", "Mood", "Workout", "Focus"].map((category) => (
          <div key={category} className="search-card">
            <strong>{category}</strong>
            <p className="muted">Open this mood instantly.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SongRow({ song, onPlay, onRemove }) {
  return (
    <div className="search-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
      <div>
        <strong>{song.title}</strong>
        <p className="muted">{song.artist}</p>
        <small className="muted">{song.album || "Single"}</small>
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={onPlay}>Play</button>
        {onRemove && (
          <button type="button" className="ghost-button" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function AlbumCard({ album }) {
  return (
    <div className="search-card">
      <strong>{album.title}</strong>
      <p className="muted">{album.artist}</p>
      <div className="section-chip">Album</div>
    </div>
  );
}

function ArtistCard({ artist }) {
  return (
    <div className="search-card">
      <strong>{artist.name}</strong>
      <p className="muted">Artist profile</p>
    </div>
  );
}

function EmptyState({ query }) {
  return (
    <div className="empty-state section-card">
      <h2>No results found</h2>
      <p>Try a different spelling or switch to songs, albums, or artists.</p>
      <div className="section-chip">{query}</div>
    </div>
  );
}

