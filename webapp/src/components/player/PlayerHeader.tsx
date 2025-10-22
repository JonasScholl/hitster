import React from "react";
import IconButton from "../ui/IconButton";

interface PlayerHeaderProps {
  onClose: () => void;
  className?: string;
}

const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  onClose,
  className = "",
}) => {
  const closeIcon = (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <h2 className="text-2xl font-bold">Now Playing</h2>
      <IconButton
        icon={closeIcon}
        onClick={onClose}
        aria-label="Close player"
      />
    </div>
  );
};

export default PlayerHeader;
