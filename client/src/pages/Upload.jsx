import React from "react";
import { useMemo, useState } from "react";
import { useUpload } from "../hooks/useUpload";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function titleFromFilename(name) {
  return (name || "")
    .replace(/\.[^/.]+$/, "")
    .replace(/[._-]+/g, " ")
    .trim();
}

export default function Upload() {
  const { uploadSong, progress, status, stage, error, reset } = useUpload();
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");
  const [message, setMessage] = useState("");

  const stageLabel = useMemo(() => {
    if (status === "success") return "Completed";
    if (status === "error") return "Failed";
    if (stage === "preparing") return "Preparing files";
    if (stage === "uploading") return "Uploading to cloud";
    if (stage === "processing") return "Processing metadata";
    return "Idle";
  }, [stage, status]);

  const onAudioChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAudioFile(file);
    if (file && !title.trim()) {
      setTitle(titleFromFilename(file.name));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!audioFile || !title.trim() || !artist.trim()) {
      setMessage("Audio, title, and artist are required.");
      return;
    }

    try {
      const song = await uploadSong({ audioFile, coverFile, title, artist, album, genre });
      setMessage(`Uploaded: ${song.title}`);
    } catch {
      setMessage("Upload failed.");
    }
  };

  return (
    <section>
      <div className="upload-header section-card">
        <div>
          <p className="upload-intro">Studio</p>
          <h1 className="upload-title">Upload a track</h1>
          <p>Pick files, auto-fill the title, and watch progress in stages.</p>
        </div>
        <div className="section-chip">{stageLabel}</div>
      </div>

      <form onSubmit={handleSubmit} className="upload-form upload-card">
        <div className="cards-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <label className="search-card">
            <strong>Audio file</strong>
            <p className="muted">MP3, WAV, FLAC, or OGG</p>
            <input type="file" accept=".mp3,.wav,.flac,.ogg,audio/*" onChange={onAudioChange} />
          </label>

          <label className="search-card">
            <strong>Cover image</strong>
            <p className="muted">Optional artwork</p>
            <input type="file" accept=".jpg,.jpeg,.png,.webp,image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div className="upload-meta">
          <div className="metric">
            <strong>{formatBytes(audioFile?.size)}</strong>
            <span>Audio size</span>
          </div>
          <div className="metric">
            <strong>{formatBytes(coverFile?.size)}</strong>
            <span>Cover size</span>
          </div>
          <div className="metric">
            <strong>{status}</strong>
            <span>Upload state</span>
          </div>
        </div>

        <div className="cards-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist" />
          <input value={album} onChange={(e) => setAlbum(e.target.value)} placeholder="Album" />
          <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Genre" />
        </div>

        <div className="upload-progress-wrap">
          <div className="upload-progress-track">
            <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="muted">
            {stageLabel} - {progress}%
          </p>
        </div>

        <div className="upload-actions">
          <button type="submit" disabled={status === "uploading"}>
            {status === "uploading" ? "Uploading..." : "Upload"}
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setMessage("");
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {(message || error) && (
        <div className="section-card" style={{ marginTop: 16 }}>
          {message && <p>{message}</p>}
          {error && <p className="auth-error">{error}</p>}
        </div>
      )}
    </section>
  );
}

