import React from "react";
import { usePlayer } from "../../context/PlayerContext";

function Player() {
  const { currentSong, isPlaying, togglePlay, volume, setVolume, currentTime, duration, seekTo } = usePlayer();

  if (!currentSong) {
    return (
      <div className="player">
        <div className="player-track">
          <strong>Ready to play</strong>
          <span>Pick a song from Home, Search, or your playlist.</span>
        </div>
        <div className="player-controls">
          <div className="seek-wrap">
            <span>0:00</span>
            <input type="range" min="0" max="1" value="0" disabled />
            <span>0:00</span>
          </div>
        </div>
      </div>
    );
  }

  const safeDuration = duration || currentSong.duration || 0;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="player player-expanded">
      <div className="player-track">
        <strong>{currentSong.title}</strong>
        <span>{currentSong.artist}</span>
        <small>{currentSong.album || "Single"}</small>
      </div>
      <div className="player-controls">
        <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
        <div className="seek-wrap">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={Math.max(1, safeDuration)}
            step="0.1"
            value={Math.min(currentTime, Math.max(1, safeDuration))}
            onChange={(e) => seekTo(Number(e.target.value))}
          />
          <span>{formatTime(safeDuration)}</span>
        </div>
      </div>
      <div className="volume-wrap">
        <span>Volume</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

export default Player;

