import { useState } from "react";
import PlayerPage from "./components/PlayerPage";
import ScannerPage from "./components/ScannerPage";

export interface AudioData {
  url: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<"scanner" | "player">(
    "scanner"
  );
  const [audioData, setAudioData] = useState<AudioData | null>(null);

  const handleAudioDetected = (url: string) => {
    setAudioData({ url });
    setCurrentPage("player");
  };

  const handleClosePlayer = (_restartScanner = false) => {
    setAudioData(null);
    setCurrentPage("scanner");
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {currentPage === "scanner" ? (
        <ScannerPage onAudioDetected={handleAudioDetected} />
      ) : (
        <PlayerPage audioData={audioData!} onClose={handleClosePlayer} />
      )}
    </div>
  );
}

export default App;
