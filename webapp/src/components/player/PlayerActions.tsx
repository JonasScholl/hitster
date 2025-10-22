import React from "react";
import Button from "../ui/Button";

interface PlayerActionsProps {
  onScanNewCard: () => void;
  className?: string;
}

const PlayerActions: React.FC<PlayerActionsProps> = ({
  onScanNewCard,
  className = "",
}) => {
  return (
    <div className={`text-center ${className}`}>
      <Button onClick={onScanNewCard}>Scan new Card</Button>
    </div>
  );
};

export default PlayerActions;
