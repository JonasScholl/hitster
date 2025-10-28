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
}) => {
  return (
    <div
      className="ion-padding"
      style={{
        background: "rgba(31, 41, 55, 0.5)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Play/Pause Button */}
      <div
        className="ion-flex ion-justify-content-center"
        style={{ marginBottom: "16px" }}
      >
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
