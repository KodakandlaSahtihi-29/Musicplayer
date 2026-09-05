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
    setProgress(0);
    setError(null);

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
          } else {
            const parsed = JSON.parse(xhr.responseText || "{}");
            const err = parsed.error || "Upload failed";
            setStatus("error");
            setStage("error");
            setError(err);
            reject(new Error(err));
          }
        } catch {
          setStatus("error");
          setStage("error");
          setError("Upload failed");
          reject(new Error("Upload failed"));
        }
      });

      xhr.addEventListener("error", () => {
        setStatus("error");
        setStage("error");
        setError("Network error");
        reject(new Error("Network error"));
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
