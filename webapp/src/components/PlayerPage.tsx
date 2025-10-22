import React from "react";
import { usePlayer } from "../hooks/usePlayer";
import { AudioData } from "../types";
import AudioPlayer from "./player/AudioPlayer";
import PlayerActions from "./player/PlayerActions";
import PlayerHeader from "./player/PlayerHeader";

interface PlayerPageProps {
  audioData: AudioData;
  onClose: (restartScanner?: boolean) => void;
}

const PlayerPage: React.FC<PlayerPageProps> = ({ audioData, onClose }) => {
  const { state, audioRef, togglePlayPause, handleProgressClick } = usePlayer({
    audioData,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <PlayerHeader onClose={() => onClose()} />

        <AudioPlayer
          isPlaying={state.isPlaying}
          currentTime={state.currentTime}
          duration={state.duration}
          onTogglePlayPause={togglePlayPause}
          onProgressClick={handleProgressClick}
          className="mt-8"
        />

        {/* Hidden audio element */}
        <audio ref={audioRef} preload="metadata" />

        <PlayerActions onScanNewCard={() => onClose(true)} className="mt-10" />
      </div>
    </div>
  );
};

export default PlayerPage;
