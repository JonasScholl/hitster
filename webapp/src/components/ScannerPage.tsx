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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Hitster QR Scanner
        </h1>
        <p className="text-gray-300 text-lg">Scan a QR code to play music</p>
      </div>

      {!scanner.isScanning && (
        <div className="mt-8 text-center">
          <Button onClick={startScanner}>Scan Card</Button>
        </div>
      )}

      {<QRCodeReader qrReaderRef={qrReaderRef} />}
      <ScannerMessage message={scanner.message} />

      {scanner.showCameraHelp && (
        <CameraHelpModal
          manualUrl={scanner.manualUrl}
          onManualUrlChange={setManualUrl}
          onLoadManualUrl={loadManualUrl}
          onKeyPress={handleKeyPress}
        />
      )}

      <ScannerInfo />
    </div>
  );
};

export default ScannerPage;
