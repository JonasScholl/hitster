import React from "react";
import CloseIconButton from "../ui/CloseIconButton";

interface QRCodeReaderProps {
  qrReaderRef: React.RefObject<HTMLDivElement | null>;
  isScanning: boolean;
  onStop: () => void;
  className?: string;
}

const QRCodeReader: React.FC<QRCodeReaderProps> = ({
  qrReaderRef,
  isScanning,
  onStop,
  className = "",
}) => {
  return (
    <div
      className={`relative scanner-container ${className} ${
        isScanning ? "h-full w-full" : ""
      }`}
    >
      <div
        id="qr-reader"
        ref={qrReaderRef}
        className={`w-full ${
          isScanning ? "bg-gray-800 rounded-xl shadow-2xl h-full" : ""
        }`}
      />
      {isScanning && (
        <div className="absolute top-2 right-2">
          <CloseIconButton onClick={onStop} ariaLabel="Close scanner" />
        </div>
      )}
    </div>
  );
};

export default QRCodeReader;
