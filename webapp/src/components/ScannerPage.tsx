import React from "react";
import { useAppContext } from "../contexts/AppContext";
import CameraHelpModal from "./scanner/CameraHelpModal";
import QRCodeReader from "./scanner/QRCodeReader";
import ScannerInfo from "./scanner/ScannerInfo";
import ScannerMessage from "./scanner/ScannerMessage";

const ScannerPage: React.FC = () => {
  const { scanner, qrReaderRef, startScanner, loadManualUrl, setManualUrl } =
    useAppContext();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      loadManualUrl();
    }
  };

  return (
    <div className="h-full flex flex-col items-center p-4 gap-4">
      <div className="container mx-auto flex-1 flex flex-col">
        <div className="text-center my-10">
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Hitster QR Scanner
          </h1>
          <p className="text-gray-300 text-sm">Scan a QR code to play music</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          {!scanner.isScanning && !scanner.showCameraHelp && (
            <div className="flex justify-center items-center">
              <button
                onClick={startScanner}
                className="size-32 rounded-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
              >
                Start
              </button>
            </div>
          )}
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
