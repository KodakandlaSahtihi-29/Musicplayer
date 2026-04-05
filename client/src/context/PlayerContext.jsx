import React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const PlayerCtx = createContext();

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio() : null);

  useEffect(() => {
    if (!audioRef.current) return undefined;

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.volume = volume / 100;
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playSong = (song) => {
    if (!audioRef.current || !song?.audioUrl) return;
    audioRef.current.src = song.audioUrl;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Browser may block autoplay until user gesture; keep UI responsive.
    });
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors in UI-level controls.
      });
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (nextTime) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const clearSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    setCurrentSong(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  return (
    <PlayerCtx.Provider
      value={{
        currentSong,
        isPlaying,
        playSong,
        togglePlay,
        audioRef,
        volume,
        setVolume,
        currentTime,
        duration,
        seekTo,
        clearSong,
      }}
    >
      {children}
    </PlayerCtx.Provider>
  );
}

export const usePlayer = () => useContext(PlayerCtx);

