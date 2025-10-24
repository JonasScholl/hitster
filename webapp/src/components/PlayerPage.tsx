import React from "react";
import { useAppContext } from "../contexts/AppContext";
import AudioPlayer from "./player/AudioPlayer";
import PlayerHeader from "./player/PlayerHeader";

const PlayerPage: React.FC = () => {
  const { player, audioRef, togglePlayPause, seekTo, goToScanner } =
    useAppContext();

  return (
    <div className="container mx-auto max-w-xl p-4 flex-1 flex flex-col h-full gap-6">
      <PlayerHeader onClose={() => goToScanner(true)} />

      <AudioPlayer
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        onTogglePlayPause={togglePlayPause}
        onSeek={seekTo}
        className="w-full"
      />

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
};

export default PlayerPage;
