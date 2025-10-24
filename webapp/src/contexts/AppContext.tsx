import QrScanner from "qr-scanner";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { QR_SCANNER_CONFIG, SCANNER_MESSAGES } from "../constants";
import { AudioData, PageType, PlayerState, ScannerState } from "../types";
import { getAppleMusicSongUrl } from "../utils/appleMusic";
import {
  isAppleMusicShortUrl,
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
  const scannerRef = useRef<QrScanner | null>(null);
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

  const startScanner = useCallback(async () => {
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
        // Create a video element for the scanner
        const video = document.createElement("video");
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
        qrReaderRef.current.innerHTML = "";
        qrReaderRef.current.appendChild(video);

        scannerRef.current = new QrScanner(
          video,
          (result) => handleScanSuccess(result.data),
          QR_SCANNER_CONFIG
        );

        scannerRef.current.setInversionMode("both");

        await scannerRef.current.start();

        setScanner((prev) => ({
          ...prev,
          isScanning: true,
          message: "",
        }));
      }
    } catch (err) {
      console.error("Error starting scanner:", err);
      showCameraError(err as Error);
    }
  }, [setScanner, showCameraError]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
        setScanner((prev) => ({
          ...prev,
          isScanning: false,
          message: "",
        }));
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }

    // Clear the scanner container content
    if (qrReaderRef.current) {
      qrReaderRef.current.innerHTML = "";
    }
  }, [setScanner, qrReaderRef]);

  const loadAudio = useCallback(
    async (url: string) => {
      try {
        await stopScanner();
        setScanner((prev) => ({
          ...prev,
          message: SCANNER_MESSAGES.VALIDATING,
        }));

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
        setTimeout(
          () => setScanner((prev) => ({ ...prev, message: "" })),
          3000
        );
      }
    },
    [stopScanner, setScanner]
  );

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      console.log("QR Code scanned:", decodedText);

      if (!isValidUrl(decodedText)) {
        setScanner((prev) => ({
          ...prev,
          message: `Scanned: ${decodedText}\n${SCANNER_MESSAGES.INVALID_URL}`,
        }));
        return;
      }

      if (isAppleMusicShortUrl(decodedText)) {
        setScanner((prev) => ({
          ...prev,
          message: SCANNER_MESSAGES.APPLE_MUSIC_SHORT_URL_DETECTED,
        }));
        try {
          const url = await getAppleMusicSongUrl(decodedText);
          loadAudio(url);
        } catch (error) {
          console.error("Error fetching Apple Music song:", error);
          setScanner((prev) => ({
            ...prev,
            message: SCANNER_MESSAGES.ERROR_LOADING,
          }));
        }
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
    },
    [setScanner, loadAudio]
  );

  const loadManualUrl = useCallback(async () => {
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

    if (!isAppleMusicShortUrl(url)) {
      setScanner((prev) => ({
        ...prev,
        message: SCANNER_MESSAGES.APPLE_MUSIC_ONLY,
      }));
      return;
    }

    setScanner((prev) => ({ ...prev, message: "Loading audio from URL..." }));
    const audioUrl = await getAppleMusicSongUrl(url);
    loadAudio(audioUrl);
  }, [scanner.manualUrl, setScanner, loadAudio]);

  const setManualUrl = useCallback(
    (url: string) => {
      setScanner((prev) => ({ ...prev, manualUrl: url }));
    },
    [setScanner]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (player.isPlaying) {
      audio.pause();
      setPlayer((prev) => ({ ...prev, isPlaying: false }));
    } else {
      audio.play();
      setPlayer((prev) => ({ ...prev, isPlaying: true }));
    }
  }, [player.isPlaying, setPlayer]);

  const seekTo = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = time;
      setPlayer((prev) => ({ ...prev, currentTime: time }));
    },
    [setPlayer]
  );

  // Simple navigation
  const goToPlayer = useCallback(
    (url: string) => {
      setAudioData({ url });
      setCurrentPage("player");
    },
    [setAudioData, setCurrentPage]
  );

  const goToScanner = useCallback(
    (restart = false) => {
      setAudioData(null);
      setPlayer({ isPlaying: false, currentTime: 0, duration: 0 });
      setCurrentPage("scanner");
      if (restart) {
        startScanner();
      } else {
        setScanner((prev) => ({ ...prev, message: "" }));
      }
    },
    [setAudioData, setCurrentPage, startScanner, setScanner]
  );

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

    const handlePause = () => {
      setPlayer((prev) => ({ ...prev, isPlaying: false }));
    };

    const handlePlay = () => {
      setPlayer((prev) => ({ ...prev, isPlaying: true }));
    };

    const handleCanPlay = () => {
      console.log("Audio ready to play");
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("canplay", handleCanPlay);

    audio.src = audioData.url;
    audio.volume = 1.0;

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioData]);

  // Handle URL-based routing on mount
  useEffect(() => {
    const handleUrlRouting = async () => {
      const currentUrl = window.location.href;

      try {
        const url = new URL(currentUrl);
        const path = url.pathname;
        const search = url.search;

        // Check for GitHub Pages redirected URL format: /?/qr/am/<id>
        let appleMusicPath = null;
        if (path === "/" && search.startsWith("?/qr/am/")) {
          appleMusicPath = search.slice(1); // Remove the leading ?
        } else if (path.startsWith("/qr/am/")) {
          appleMusicPath = path;
        }

        if (appleMusicPath) {
          const songId = appleMusicPath.split("/qr/am/").pop();

          if (songId) {
            console.log("Detected Apple Music URL, loading song directly...");
            setScanner((prev) => ({
              ...prev,
              message: "Loading Apple Music song...",
            }));

            try {
              const previewUrl = await getAppleMusicSongUrl(
                url.origin + appleMusicPath
              );
              if (previewUrl) {
                setAudioData({ url: previewUrl });
                setCurrentPage("player");
                setScanner((prev) => ({ ...prev, message: "" }));
              } else {
                setScanner((prev) => ({
                  ...prev,
                  message:
                    "Could not load Apple Music song. Please try scanning again.",
                }));
              }
            } catch (error) {
              console.error("Error loading Apple Music song:", error);
              setScanner((prev) => ({
                ...prev,
                message:
                  "Error loading Apple Music song. Please try scanning again.",
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
      }
    };

    handleUrlRouting();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
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
