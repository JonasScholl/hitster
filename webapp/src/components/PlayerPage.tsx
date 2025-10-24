import React from "react";
import { useAppContext } from "../contexts/AppContext";
import AudioPlayer from "./player/AudioPlayer";
import PlayerActions from "./player/PlayerActions";
import PlayerHeader from "./player/PlayerHeader";

const PlayerPage: React.FC = () => {
  const { player, audioRef, togglePlayPause, seekTo, goToScanner } =
    useAppContext();

  return (
    <div className="h-full flex flex-col">
      <div className="container mx-auto px-4 py-4 flex-1 flex flex-col">
        <div className="max-w-md mx-auto flex-1 flex flex-col justify-center">
          <PlayerHeader onClose={goToScanner} />

          <AudioPlayer
            isPlaying={player.isPlaying}
            currentTime={player.currentTime}
            duration={player.duration}
            onTogglePlayPause={togglePlayPause}
            onSeek={seekTo}
            className="mt-6"
          />

          {/* Hidden audio element */}
          <audio ref={audioRef} preload="metadata" />

          <PlayerActions
            onScanNewCard={() => goToScanner(true)}
            className="mt-6"
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
