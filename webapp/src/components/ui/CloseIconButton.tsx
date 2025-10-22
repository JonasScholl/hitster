import React, { useMemo } from "react";
import IconButton from "./IconButton";

interface CloseIconButtonProps {
  onClick: () => void;
  ariaLabel: string;
  className?: string;
}

const CloseIconButton: React.FC<CloseIconButtonProps> = ({
  onClick,
  className,
  ariaLabel,
}) => {
  const closeIcon = useMemo(
    () => (
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
    ),
    []
  );

  return (
    <IconButton
      icon={closeIcon}
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
    />
  );
};

export default CloseIconButton;
