import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { usePlaylists } from "../hooks/usePlaylists";

export default function Library() {
  const { playlists, createPlaylist, updatePlaylist, deletePlaylist } = usePlaylists();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createPlaylist(name);
    setName("");
    setShowForm(false);
  };

  return (
    <div>
      <button onClick={() => setShowForm(true)}>+ New Playlist</button>
      {showForm && (
        <form onSubmit={handleCreate}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Playlist name"
            autoFocus
          />
          <button type="submit">Create</button>
          <button type="button" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </form>
      )}
      {playlists.map((p) => (
        <div key={p._id}>
          <Link to={`/playlist/${p._id}`}>{p.name}</Link>
          <span>{p.songs.length} songs</span>
          <button
            onClick={() => {
              const nextName = window.prompt("New name", p.name);
              if (nextName && nextName.trim()) {
                updatePlaylist(p._id, { name: nextName.trim() });
              }
            }}
          >
            Edit
          </button>
          <button onClick={() => deletePlaylist(p._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

