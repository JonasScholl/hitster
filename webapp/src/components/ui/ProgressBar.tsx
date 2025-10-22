import React from "react";
import { calculateProgressPercentage } from "../../utils/timeUtils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  className = "",
}) => {
  const progressPercentage = calculateProgressPercentage(currentTime, duration);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm text-gray-200">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div
        className="w-full bg-gray-700 rounded-full h-2 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const width = rect.width;
          const percentage = clickX / width;
          const newTime = percentage * duration;
          onSeek(newTime);
        }}
      >
        <div
          className="progress-bar h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default ProgressBar;
