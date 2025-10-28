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
    <div
      className={`ion-flex ion-justify-content-between ion-align-items-center ${className}`}
    >
      <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Now Playing</h2>
      <CloseIconButton onClick={onClose} ariaLabel="Close player" />
    </div>
  );
};

export default PlayerHeader;
