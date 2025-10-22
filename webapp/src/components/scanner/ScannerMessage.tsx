import React from "react";

interface ScannerMessageProps {
  message: string;
  className?: string;
}

const ScannerMessage: React.FC<ScannerMessageProps> = ({
  message,
  className = "",
}) => {
  if (!message) return null;

  return (
    <div
      className={`mt-4 text-center text-gray-300 whitespace-pre-line ${className}`}
    >
      {message}
    </div>
  );
};

export default ScannerMessage;
