import React from "react";

interface ScannerInfoProps {
  className?: string;
}

const ScannerInfo: React.FC<ScannerInfoProps> = ({ className = "" }) => {
  return (
    <div
      className={`fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-gray-800/80 backdrop-blur-sm border border-gray-600/30 rounded-lg p-3 ${className}`}
    >
      <div className="flex items-start space-x-2">
        <div className="shrink-0">
          <svg
            className="w-4 h-4 text-gray-400 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="text-xs text-gray-400">
          <p>
            This scanner is for{" "}
            <span className="text-gray-300">Apple Music</span> QR codes. For
            Spotify cards, use your regular camera or QR scanner app.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScannerInfo;
