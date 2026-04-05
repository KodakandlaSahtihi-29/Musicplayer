import React from "react";
import { usePlayer } from "../../context/PlayerContext";

function SongCard({ song, onRemove }) {
  const { playSong } = usePlayer();

  return (
    <div className="song-card">
      <button className="song-card-cover" type="button" onClick={() => playSong(song)}>
        {song.coverUrl ? (
          <img src={song.coverUrl} alt={song.title} width="56" height="56" />
        ) : (
          <div className="cover-fallback" aria-hidden="true">
            ♪
          </div>
        )}
      </button>

      <button className="song-card-body" type="button" onClick={() => playSong(song)}>
        <p>{song.title}</p>
        <small>{song.artist}</small>
      </button>

      <div className="song-card-actions">
        <button type="button" onClick={() => playSong(song)}>
          Play
        </button>
        {onRemove && (
          <button type="button" className="ghost-button" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default SongCard;

