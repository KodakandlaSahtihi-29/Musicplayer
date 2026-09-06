import { useState, useCallback, useRef } from "react";
import { API } from "../config/api";
import { DEMO_SONGS } from "../data/demoSongs";

export function useSearch() {
  const [results, setResults] = useState({ songs: [], albums: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const debounceRef = useRef(null);

  const search = useCallback((q, type = "all") => {
    setQuery(q);
    clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setResults({ songs: [], albums: [], artists: [] });
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/songs/search?q=${encodeURIComponent(q)}&type=${type}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        // Fallback filter over demo tracks + local songs for offline / GitHub Pages demo mode
        const lq = q.toLowerCase();
        const localSongs = JSON.parse(localStorage.getItem("local_songs") || "[]");
        const allSongs = [...localSongs, ...DEMO_SONGS];
        const matchedSongs = allSongs.filter(
          (s) =>
            s.title?.toLowerCase().includes(lq) ||
            s.artist?.toLowerCase().includes(lq) ||
            (s.album && s.album.toLowerCase().includes(lq))
        );
        setResults({ songs: matchedSongs, albums: [], artists: [] });
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  return { query, results, loading, search };
}
