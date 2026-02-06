import { useAppContext } from "../src/contexts";
import { PlayerPage, ScannerPage } from "../src/components";

export default function HomeScreen() {
  const { currentPage } = useAppContext();

  return currentPage === "scanner" ? <ScannerPage /> : <PlayerPage />;
}
