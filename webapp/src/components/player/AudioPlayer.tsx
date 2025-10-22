import React from "react";
import PlayPauseButton from "../ui/PlayPauseButton";
import ProgressBar from "../ui/ProgressBar";

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlayPause: () => void;
  onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isPlaying,
  currentTime,
  duration,
  onTogglePlayPause,
  onProgressClick,
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
        onSeek={onProgressClick}
      />
    </div>
  );
};

export default AudioPlayer;
