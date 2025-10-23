import React from "react";
import PlayerPage from "./components/PlayerPage";
import ScannerPage from "./components/ScannerPage";
import { AppProvider, useAppContext } from "./contexts/AppContext";

const AppContent: React.FC = () => {
  const { currentPage } = useAppContext();

  return (
    <div className="min-h-screen">
      {currentPage === "scanner" ? <ScannerPage /> : <PlayerPage />}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
