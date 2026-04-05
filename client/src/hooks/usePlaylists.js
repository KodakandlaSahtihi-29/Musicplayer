import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export function usePlaylists() {
  const [playlists, setPlaylists] = useState([]);
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchPlaylists = async () => {
    const res = await fetch(`${API}/playlists/mine`, { headers });
    setPlaylists(await res.json());
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const createPlaylist = async (name, description = "") => {
    const res = await fetch(`${API}/playlists`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name, description }),
    });
    const newPl = await res.json();
    setPlaylists((prev) => [...prev, newPl]);
    return newPl;
  };

  const updatePlaylist = async (id, data) => {
    const res = await fetch(`${API}/playlists/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    setPlaylists((prev) => prev.map((p) => (p._id === id ? updated : p)));
  };

  const deletePlaylist = async (id) => {
    await fetch(`${API}/playlists/${id}`, { method: "DELETE", headers });
    setPlaylists((prev) => prev.filter((p) => p._id !== id));
  };

  const addSong = async (playlistId, songId) => {
    await fetch(`${API}/playlists/${playlistId}/songs`, {
      method: "POST",
      headers,
      body: JSON.stringify({ songId }),
    });
    fetchPlaylists();
  };

  const removeSong = async (playlistId, songId) => {
    await fetch(`${API}/playlists/${playlistId}/songs/${songId}`, {
      method: "DELETE",
      headers,
    });
    fetchPlaylists();
  };

  return { playlists, createPlaylist, updatePlaylist, deletePlaylist, addSong, removeSong };
}
