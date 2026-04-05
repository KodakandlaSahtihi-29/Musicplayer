import React from "react";
import { usePlayer } from "../../context/PlayerContext";

function NowPlaying() {
  const { currentSong } = usePlayer();

  if (!currentSong) {
    return (
      <div className="now-playing">
        <div className="section-header">
          <div>
            <h2>Now Playing</h2>
            <p>Nothing is playing yet.</p>
          </div>
        </div>
        <div className="now-playing-card">
          <div className="cover-fallback">♪</div>
          <div>
            <strong>Pick a song</strong>
            <p className="muted">Select a track from Home or Search to start playback.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="now-playing">
      <div className="section-header">
        <div>
          <h2>Now Playing</h2>
          <p>Current track and cover art.</p>
        </div>
        <div className="section-chip">Live</div>
      </div>
      <div className="now-playing-card">
        {currentSong.coverUrl ? (
          <img src={currentSong.coverUrl} alt={currentSong.title} width="56" height="56" />
        ) : (
          <div className="cover-fallback">♪</div>
        )}
        <div>
          <strong>{currentSong.title}</strong>
          <p className="muted">{currentSong.artist}</p>
          <small className="muted">{currentSong.album || "Single"}</small>
        </div>
      </div>
    </div>
  );
}

export default NowPlaying;

