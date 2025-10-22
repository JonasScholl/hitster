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
    <div className={`relative scanner-container ${className}`}>
      <div
        id="qr-reader"
        ref={qrReaderRef}
        className="bg-gray-800 rounded-xl shadow-2xl"
      />
      {scanner.isScanning && (
        <div className="absolute top-4 right-4">
          <CloseIconButton onClick={stopScanner} ariaLabel="Close scanner" />
        </div>
      )}
    </div>
  );
};

export default QRCodeReader;
