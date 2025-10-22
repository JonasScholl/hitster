import React from "react";

interface QRCodeReaderProps {
  qrReaderRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

const QRCodeReader: React.FC<QRCodeReaderProps> = ({
  qrReaderRef,
  className = "",
}) => {
  return (
    <div className={`scanner-container ${className}`}>
      <div
        id="qr-reader"
        ref={qrReaderRef}
        className="bg-gray-800 rounded-xl shadow-2xl"
      />
    </div>
  );
};

export default QRCodeReader;
