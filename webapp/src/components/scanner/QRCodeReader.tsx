import React from "react";
import { useAppContext } from "../../contexts";
import CloseIconButton from "../ui/CloseIconButton";

interface QRCodeReaderProps {
  qrReaderRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

const QRCodeReader: React.FC<QRCodeReaderProps> = ({
  qrReaderRef,
  className = "",
}) => {
  const { scanner, stopScanner } = useAppContext();

  return (
    <div
      className={`relative scanner-container ${className} ${
        scanner.isScanning ? "h-full" : ""
      }`}
    >
      <div
        id="qr-reader"
        ref={qrReaderRef}
        className={`w-full ${
          scanner.isScanning ? "bg-gray-800 rounded-xl shadow-2xl h-full" : ""
        }`}
      />
      {scanner.isScanning && (
        <div className="absolute top-2 right-2">
          <CloseIconButton onClick={stopScanner} ariaLabel="Close scanner" />
        </div>
      )}
    </div>
  );
};

export default QRCodeReader;
