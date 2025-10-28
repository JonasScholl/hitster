import React from "react";

interface ScannerMessageProps {
  message: string;
}

const ScannerMessage: React.FC<ScannerMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="ion-text-center ion-padding">
      <p
        className="ion-text-wrap"
        style={{ color: "white", whiteSpace: "pre-line" }}
      >
        {message}
      </p>
    </div>
  );
};

export default ScannerMessage;
