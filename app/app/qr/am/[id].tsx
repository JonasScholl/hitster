import { useAppContext } from "../../../src/contexts";
import { PlayerPage, ScannerPage } from "../../../src/components";

export default function QrAmScreen() {
  const { currentPage } = useAppContext();

  return currentPage === "scanner" ? <ScannerPage /> : <PlayerPage />;
}
