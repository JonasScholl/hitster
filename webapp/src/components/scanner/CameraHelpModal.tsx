import React from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface CameraHelpModalProps {
  manualUrl: string;
  onManualUrlChange: (url: string) => void;
  onLoadManualUrl: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  className?: string;
}

const CameraHelpModal: React.FC<CameraHelpModalProps> = ({
  manualUrl,
  onManualUrlChange,
  onLoadManualUrl,
  onKeyPress,
  className = "",
}) => {
  return (
    <div
      className={`mt-8 max-w-lg mx-auto bg-gray-800 rounded-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold mb-4 text-yellow-400">
        Camera Access Required
      </h3>
      <div className="text-sm text-gray-300 space-y-3">
        <p>
          To scan QR codes, this app needs access to your camera. Here's how to
          enable it:
        </p>

        <div className="bg-gray-700 rounded p-3">
          <p className="font-semibold text-white mb-2">For Chrome/Edge:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Click the camera icon in the address bar</li>
            <li>Select "Allow" for camera access</li>
            <li>Refresh the page and try again</li>
          </ul>
        </div>

        <div className="bg-gray-700 rounded p-3">
          <p className="font-semibold text-white mb-2">For Safari:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Go to Safari → Settings → Websites → Camera</li>
            <li>Set this website to "Allow"</li>
            <li>Refresh the page and try again</li>
          </ul>
        </div>

        <div className="bg-gray-700 rounded p-3">
          <p className="font-semibold text-white mb-2">Alternative:</p>
          <p className="text-xs mb-2">
            You can also manually enter the card audio URL below:
          </p>
          <div className="flex gap-2">
            <Input
              type="url"
              value={manualUrl}
              onChange={(e) => onManualUrlChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Paste card audio URL here..."
              className="flex-1"
            />
            <Button onClick={onLoadManualUrl} size="sm" className="text-nowrap">
              Load Audio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraHelpModal;
