import React from "react";
import PlayPauseButton from "../ui/PlayPauseButton";
import ProgressBar from "../ui/ProgressBar";

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isPlaying,
  currentTime,
  duration,
  onTogglePlayPause,
  onSeek,
  className = "",
}) => {
  return (
    <div className={`audio-controls rounded-2xl p-8 shadow-2xl ${className}`}>
      {/* Play/Pause Button */}
      <div className="flex justify-center mb-4">
        <PlayPauseButton isPlaying={isPlaying} onToggle={onTogglePlayPause} />
      </div>

      {/* Progress Bar */}
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
      />
    </div>
  );
};

export default AudioPlayer;
