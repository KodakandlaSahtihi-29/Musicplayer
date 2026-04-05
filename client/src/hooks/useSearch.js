import { useState, useCallback, useRef } from "react";

const API = "http://localhost:5000/api";

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
        setResults(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  return { query, results, loading, search };
}
