import React from "react";
import { useAppContext } from "../contexts/AppContext";
import CameraHelpModal from "./scanner/CameraHelpModal";
import QRCodeReader from "./scanner/QRCodeReader";
import ScannerInfo from "./scanner/ScannerInfo";
import ScannerMessage from "./scanner/ScannerMessage";
import Button from "./ui/Button";

const ScannerPage: React.FC = () => {
  const { scanner, qrReaderRef, startScanner, loadManualUrl, setManualUrl } =
    useAppContext();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      loadManualUrl();
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="container mx-auto px-4 py-4 pb-24 flex-1 flex flex-col">
        <div className="text-center mb-4 mt-6">
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Hitster QR Scanner
          </h1>
          <p className="text-gray-300 text-sm">Scan a QR code to play music</p>
        </div>

        {!scanner.isScanning && (
          <div className="text-center mb-4">
            <Button onClick={startScanner}>Scan Card</Button>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center">
          <QRCodeReader qrReaderRef={qrReaderRef} />
          <ScannerMessage message={scanner.message} />
        </div>

        {scanner.showCameraHelp && (
          <div className="mt-4">
            <CameraHelpModal
              manualUrl={scanner.manualUrl}
              onManualUrlChange={setManualUrl}
              onLoadManualUrl={loadManualUrl}
              onKeyPress={handleKeyPress}
            />
          </div>
        )}
      </div>

      <ScannerInfo />
    </div>
  );
};

export default ScannerPage;
