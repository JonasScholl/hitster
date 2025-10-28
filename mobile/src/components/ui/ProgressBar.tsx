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
    <div
      className={`ion-flex ion-flex-column ${className}`}
      style={{ gap: "8px" }}
    >
      <div
        className="ion-flex ion-justify-content-between"
        style={{ fontSize: "14px", color: "#E5E7EB" }}
      >
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div
        style={{
          width: "100%",
          background: "#374151",
          borderRadius: "9999px",
          height: "8px",
          cursor: "pointer",
        }}
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
          style={{
            background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
            height: "8px",
            borderRadius: "9999px",
            transition: "all 0.3s",
            width: `${progressPercentage}%`,
          }}
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
