import React from "react";
import Button from "../ui/Button";

interface ScannerControlsProps {
  isScanning: boolean;
  onStartScanner: () => void;
  className?: string;
}

const ScannerControls: React.FC<ScannerControlsProps> = ({
  isScanning,
  onStartScanner,
  className = "",
}) => {
  return (
    <div className={`text-center ${className}`}>
      <Button
        onClick={onStartScanner}
        disabled={isScanning}
        className="disabled:opacity-50"
      >
        Start Scanner
      </Button>
    </div>
  );
};

export default ScannerControls;
