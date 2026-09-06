import { useState } from "react";
import { API } from "../config/api";

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const [stage, setStage] = useState("idle");
  const [error, setError] = useState(null);

  const uploadSong = async ({ audioFile, coverFile, title, artist, album, genre }) => {
    setStatus("uploading");
    setStage("preparing");
    setProgress(15);
    setError(null);

    const fallbackLocalUpload = () => {
      return new Promise((resolve) => {
        setStage("uploading");
        setProgress(60);
        setTimeout(() => {
          setStage("processing");
          setProgress(90);
          setTimeout(() => {
            const newSong = {
              _id: "local-" + Date.now(),
              title: title.trim(),
              artist: artist.trim(),
              album: album?.trim() || "Single",
              genre: genre?.trim() || "Pop",
              duration: 180,
              coverUrl: coverFile
                ? URL.createObjectURL(coverFile)
                : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
              audioUrl: URL.createObjectURL(audioFile),
              uploadedBy: localStorage.getItem("token") || "guest",
            };

            const localSongs = JSON.parse(localStorage.getItem("local_songs") || "[]");
            localStorage.setItem("local_songs", JSON.stringify([newSong, ...localSongs]));

            setProgress(100);
            setStatus("success");
            setStage("done");
            resolve(newSong);
          }, 300);
        }, 300);
      });
    };

    // If running on static host with relative /api
    const isStaticDeploy = !API.startsWith("http") || (window.location.protocol === "https:" && API.startsWith("http:"));
    if (isStaticDeploy) {
      return fallbackLocalUpload();
    }

    const formData = new FormData();
    formData.append("audio", audioFile);
    if (coverFile) formData.append("cover", coverFile);
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("album", album || "");
    formData.append("genre", genre || "");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const token = localStorage.getItem("token");

      xhr.upload.addEventListener("progress", (e) => {
        setStage("uploading");
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        try {
          if (xhr.status === 201) {
            setStage("processing");
            setProgress(100);
            setStatus("success");
            setStage("done");
            resolve(JSON.parse(xhr.responseText));
          } else if (xhr.status === 405 || xhr.status === 404) {
            fallbackLocalUpload().then(resolve);
          } else {
            const parsed = JSON.parse(xhr.responseText || "{}");
            const err = parsed.error || "Upload failed";
            setStatus("error");
            setStage("error");
            setError(err);
            reject(new Error(err));
          }
        } catch {
          fallbackLocalUpload().then(resolve);
        }
      });

      xhr.addEventListener("error", () => {
        fallbackLocalUpload().then(resolve);
      });

      xhr.open("POST", `${API}/upload/song`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    });
  };

  const reset = () => {
    setStatus("idle");
    setStage("idle");
    setProgress(0);
    setError(null);
  };

  return { uploadSong, progress, status, stage, error, reset };
}
