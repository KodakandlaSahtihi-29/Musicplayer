import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePlaylists } from "../hooks/usePlaylists";

const API = "http://localhost:5000/api";

export default function Playlist() {
  const { id } = useParams();
  const { removeSong } = usePlaylists();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlaylist = async () => {
    try {
      const res = await fetch(`${API}/playlists/${id}`);
      const data = await res.json();
      setPlaylist(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  if (loading) {
    return <section>Loading playlist...</section>;
  }

  if (!playlist || playlist.error) {
    return <section>Playlist not found.</section>;
  }

  return (
    <section>
      <h1>{playlist.name}</h1>
      <p>{playlist.description || "No description"}</p>

      {playlist.songs?.length ? (
        playlist.songs.map((song) => (
          <div key={song._id}>
            <span>
              {song.title} - {song.artist}
            </span>
            <button
              onClick={async () => {
                await removeSong(playlist._id, song._id);
                fetchPlaylist();
              }}
            >
              Remove
            </button>
          </div>
        ))
      ) : (
        <p>No songs in this playlist yet.</p>
      )}
    </section>
  );
}

