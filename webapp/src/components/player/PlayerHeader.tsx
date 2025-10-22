import React from "react";
import CloseIconButton from "../ui/CloseIconButton";

interface PlayerHeaderProps {
  onClose: () => void;
  className?: string;
}

const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  onClose,
  className = "",
}) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <h2 className="text-2xl font-bold">Now Playing</h2>
      <CloseIconButton onClick={onClose} ariaLabel="Close player" />
    </div>
  );
};

export default PlayerHeader;
