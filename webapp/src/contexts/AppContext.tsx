import { Html5Qrcode } from "html5-qrcode";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { QR_CODE_CONFIG, SCANNER_MESSAGES } from "../constants";
import { AudioData, PageType, PlayerState, ScannerState } from "../types";
import {
  isItunesAudioUrl,
  isValidUrl,
  validateAudioUrl,
} from "../utils/audioValidation";
import { checkCameraPermission, createCameraError } from "../utils/cameraUtils";

// Simple context interface
interface AppContextType {
  // State
  currentPage: PageType;
  audioData: AudioData | null;
  scanner: ScannerState;
  player: PlayerState;
  // Scanner
  startScanner: () => Promise<void>;
  stopScanner: () => Promise<void>;
  setManualUrl: (url: string) => void;
  loadManualUrl: () => void;
  qrReaderRef: React.RefObject<HTMLDivElement | null>;
  // Player
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  // Navigation
  goToPlayer: (url: string) => void;
  goToScanner: (restart?: boolean) => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Simple state
  const [currentPage, setCurrentPage] = useState<PageType>("scanner");
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [scanner, setScanner] = useState<ScannerState>({
    isScanning: false,
    message: "",
    showCameraHelp: false,
    manualUrl: "",
  });
  const [player, setPlayer] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  // Refs
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Simple scanner functions
  const showCameraError = (error: Error) => {
    const cameraError = createCameraError(error);
    setScanner((prev) => ({
      ...prev,
      message: cameraError.message,
      showCameraHelp: true,
    }));
  };

  const startScanner = async () => {
    try {
      setScanner((prev) => ({ ...prev, showCameraHelp: false, message: "" }));

      const hasPermission = await checkCameraPermission();
      if (!hasPermission) {
        setScanner((prev) => ({
          ...prev,
          message: SCANNER_MESSAGES.CAMERA_NOT_SUPPORTED,
          showCameraHelp: true,
        }));
        return;
      }

      if (qrReaderRef.current) {
        scannerRef.current = new Html5Qrcode(qrReaderRef.current.id);
        await scannerRef.current.start(
          { facingMode: "environment" },
          QR_CODE_CONFIG,
          (decodedText) => handleScanSuccess(decodedText),
          (errorMessage) => console.error("QR scan error:", errorMessage)
        );

        setScanner((prev) => ({
          ...prev,
          isScanning: true,
        }));
      }
    } catch (err) {
      console.error("Error starting scanner:", err);
      showCameraError(err as Error);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setScanner((prev) => ({
          ...prev,
          isScanning: false,
        }));
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);

    if (!isValidUrl(decodedText)) {
      setScanner((prev) => ({
        ...prev,
        message: `Scanned: ${decodedText}\n${SCANNER_MESSAGES.INVALID_URL}`,
      }));
      return;
    }

    if (isItunesAudioUrl(decodedText)) {
      setScanner((prev) => ({
        ...prev,
        message: SCANNER_MESSAGES.ITUNES_DETECTED,
      }));
      loadAudio(decodedText);
    } else if (decodedText.includes("http")) {
      setScanner((prev) => ({
        ...prev,
        message: SCANNER_MESSAGES.URL_DETECTED,
      }));
      loadAudio(decodedText);
    } else {
      setScanner((prev) => ({
        ...prev,
        message: `Scanned: ${decodedText}\n${SCANNER_MESSAGES.INVALID_AUDIO_URL}`,
      }));
    }
  };

  const loadAudio = async (url: string) => {
    try {
      await stopScanner();
      setScanner((prev) => ({ ...prev, message: SCANNER_MESSAGES.VALIDATING }));

      const isValidAudio = await validateAudioUrl(url);
      if (!isValidAudio) {
        setScanner((prev) => ({
          ...prev,
          message: SCANNER_MESSAGES.INVALID_AUDIO,
        }));
        setTimeout(
          () => setScanner((prev) => ({ ...prev, message: "" })),
          3000
        );
        return;
      }

      goToPlayer(url);
    } catch (err) {
      console.error("Error loading audio:", err);
      setScanner((prev) => ({
        ...prev,
        message: SCANNER_MESSAGES.ERROR_LOADING,
      }));
      setTimeout(() => setScanner((prev) => ({ ...prev, message: "" })), 3000);
    }
  };

  const loadManualUrl = () => {
    const url = scanner.manualUrl.trim();
    if (!url) {
      setScanner((prev) => ({ ...prev, message: SCANNER_MESSAGES.ENTER_URL }));
      return;
    }

    if (!isValidUrl(url)) {
      setScanner((prev) => ({
        ...prev,
        message: SCANNER_MESSAGES.INVALID_URL_FORMAT,
      }));
      return;
    }

    if (!url.startsWith("https:")) {
      setScanner((prev) => ({ ...prev, message: SCANNER_MESSAGES.HTTPS_ONLY }));
      return;
    }

    if (!isItunesAudioUrl(url)) {
      setScanner((prev) => ({
        ...prev,
        message: SCANNER_MESSAGES.APPLE_MUSIC_ONLY,
      }));
      return;
    }

    setScanner((prev) => ({ ...prev, message: "Loading audio from URL..." }));
    loadAudio(url);
  };

  const setManualUrl = (url: string) => {
    setScanner((prev) => ({ ...prev, manualUrl: url }));
  };

  // Simple player functions
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioData) return;

    const handleLoadedMetadata = () => {
      setPlayer((prev) => ({ ...prev, duration: audio.duration }));
    };

    const handleTimeUpdate = () => {
      setPlayer((prev) => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleEnded = () => {
      setPlayer((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
    };

    const handleCanPlay = () => {
      console.log("Audio ready to play");
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);

    audio.src = audioData.url;
    audio.volume = 1.0;

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioData]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (player.isPlaying) {
      audio.pause();
      setPlayer((prev) => ({ ...prev, isPlaying: false }));
    } else {
      audio.play();
      setPlayer((prev) => ({ ...prev, isPlaying: true }));
    }
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setPlayer((prev) => ({ ...prev, currentTime: time }));
  };

  // Simple navigation
  const goToPlayer = (url: string) => {
    setAudioData({ url });
    setCurrentPage("player");
  };

  const goToScanner = (restart = false) => {
    setAudioData(null);
    setPlayer({ isPlaying: false, currentTime: 0, duration: 0 });
    setCurrentPage("scanner");
    if (restart) {
      startScanner();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const contextValue: AppContextType = {
    currentPage,
    audioData,
    scanner,
    player,
    startScanner,
    stopScanner,
    setManualUrl,
    loadManualUrl,
    qrReaderRef,
    togglePlayPause,
    seekTo,
    audioRef,
    goToPlayer,
    goToScanner,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
