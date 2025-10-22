import React from "react";
import { useAppContext } from "../contexts/AppContext";
import AudioPlayer from "./player/AudioPlayer";
import PlayerActions from "./player/PlayerActions";
import PlayerHeader from "./player/PlayerHeader";

const PlayerPage: React.FC = () => {
  const { player, audioRef, togglePlayPause, seekTo, goToScanner } =
    useAppContext();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <PlayerHeader onClose={() => goToScanner()} />

        <AudioPlayer
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          onTogglePlayPause={togglePlayPause}
          onSeek={seekTo}
          className="mt-8"
        />

        {/* Hidden audio element */}
        <audio ref={audioRef} preload="metadata" />

        <PlayerActions
          onScanNewCard={() => goToScanner(true)}
          className="mt-10"
        />
      </div>
    </div>
  );
};

export default PlayerPage;
