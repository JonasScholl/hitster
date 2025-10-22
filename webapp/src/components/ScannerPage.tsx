import React from "react";
import { useScanner } from "../hooks/useScanner";
import CameraHelpModal from "./scanner/CameraHelpModal";
import QRCodeReader from "./scanner/QRCodeReader";
import ScannerControls from "./scanner/ScannerControls";
import ScannerInfo from "./scanner/ScannerInfo";
import ScannerMessage from "./scanner/ScannerMessage";

interface ScannerPageProps {
  onAudioDetected: (url: string) => void;
}

const ScannerPage: React.FC<ScannerPageProps> = ({ onAudioDetected }) => {
  const { state, qrReaderRef, startScanner, loadManualUrl, setManualUrl } =
    useScanner({ onAudioDetected });

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

      <QRCodeReader qrReaderRef={qrReaderRef} />
      <ScannerMessage message={state.message} />

      <ScannerControls
        isScanning={state.isScanning}
        onStartScanner={startScanner}
        className="mt-8"
      />

      <ScannerInfo />

      <CameraHelpModal
        isVisible={state.showCameraHelp}
        manualUrl={state.manualUrl}
        onManualUrlChange={setManualUrl}
        onLoadManualUrl={loadManualUrl}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default ScannerPage;
