import { useState, useEffect } from "react";
import { API } from "../config/api";

export function usePlaylists() {
  const [playlists, setPlaylists] = useState([]);
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const getLocalPlaylists = () => {
    try {
      return JSON.parse(localStorage.getItem("local_playlists") || "[]");
    } catch {
      return [];
    }
  };

  const saveLocalPlaylists = (list) => {
    localStorage.setItem("local_playlists", JSON.stringify(list));
    setPlaylists(list);
  };

  const fetchPlaylists = async () => {
    try {
      const res = await fetch(`${API}/playlists/mine`, { headers });
      if (!res.ok) throw new Error("Backend unavailable");
      const data = await res.json();
      setPlaylists(Array.isArray(data) ? data : getLocalPlaylists());
    } catch {
      setPlaylists(getLocalPlaylists());
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const createPlaylist = async (name, description = "") => {
    try {
      const res = await fetch(`${API}/playlists`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Failed");
      const newPl = await res.json();
      setPlaylists((prev) => [...prev, newPl]);
      return newPl;
    } catch {
      const newPl = {
        _id: "pl-" + Date.now(),
        name,
        description,
        songs: [],
        createdAt: new Date().toISOString(),
      };
      const updated = [...getLocalPlaylists(), newPl];
      saveLocalPlaylists(updated);
      return newPl;
    }
  };

  const updatePlaylist = async (id, data) => {
    try {
      const res = await fetch(`${API}/playlists/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setPlaylists((prev) => prev.map((p) => (p._id === id ? updated : p)));
    } catch {
      const updated = getLocalPlaylists().map((p) =>
        p._id === id ? { ...p, ...data } : p
      );
      saveLocalPlaylists(updated);
    }
  };

  const deletePlaylist = async (id) => {
    try {
      await fetch(`${API}/playlists/${id}`, { method: "DELETE", headers });
    } catch {
      // offline ignore
    }
    const updated = getLocalPlaylists().filter((p) => p._id !== id);
    saveLocalPlaylists(updated);
  };

  const addSong = async (playlistId, songId, songObj) => {
    try {
      await fetch(`${API}/playlists/${playlistId}/songs`, {
        method: "POST",
        headers,
        body: JSON.stringify({ songId }),
      });
      fetchPlaylists();
    } catch {
      const current = getLocalPlaylists();
      const updated = current.map((p) => {
        if (p._id === playlistId) {
          const songs = p.songs || [];
          if (!songs.some((s) => (s._id || s) === songId)) {
            return { ...p, songs: [...songs, songObj || songId] };
          }
        }
        return p;
      });
      saveLocalPlaylists(updated);
    }
  };

  const removeSong = async (playlistId, songId) => {
    try {
      await fetch(`${API}/playlists/${playlistId}/songs/${songId}`, {
        method: "DELETE",
        headers,
      });
      fetchPlaylists();
    } catch {
      const current = getLocalPlaylists();
      const updated = current.map((p) => {
        if (p._id === playlistId) {
          return {
            ...p,
            songs: (p.songs || []).filter((s) => (s._id || s) !== songId),
          };
        }
        return p;
      });
      saveLocalPlaylists(updated);
    }
  };

  return { playlists, createPlaylist, updatePlaylist, deletePlaylist, addSong, removeSong };
}
