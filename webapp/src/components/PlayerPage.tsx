import React from "react";
import { useAppContext } from "../contexts/AppContext";
import AudioPlayer from "./player/AudioPlayer";
import PlayerHeader from "./player/PlayerHeader";

const PlayerPage: React.FC = () => {
  const { player, audioRef, togglePlayPause, seekTo, goToScanner } =
    useAppContext();

  return (
    <div className="h-full flex flex-col">
      <div className="container mx-auto px-10 py-6 flex-1 flex flex-col">
        <PlayerHeader onClose={() => goToScanner(true)} />

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
      </div>
    </div>
  );
};

export default PlayerPage;
