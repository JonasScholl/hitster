import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SCANNER_MESSAGES } from "../constants";
import type { AudioData, PageType, PlayerState, ScannerState } from "../types";
import {
  getAppleMusicSongUrl,
  isAppleMusicShortUrl,
  isValidUrl,
} from "../utils";

interface AppContextType {
  currentPage: PageType;
  audioData: AudioData | null;
  scanner: ScannerState;
  player: PlayerState;

  startScanner: () => void;
  stopScanner: () => void;
  setManualUrl: (url: string) => void;
  loadManualUrl: () => Promise<void>;
  handleBarcodeScan: (data: string) => Promise<void>;
  setCameraPermission: (granted: boolean) => void;
  setShowCameraHelp: (show: boolean) => void;

  togglePlayPause: () => void;
  seekTo: (time: number) => void;

  goToPlayer: (url: string) => void;
  goToScanner: (restart?: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageType>("scanner");
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [scanner, setScanner] = useState<ScannerState>({
    isScanning: false,
    message: "",
    showCameraHelp: false,
    manualUrl: "",
    hasPermission: null,
  });

  const [player, setPlayer] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoaded: false,
    isBuffering: false,
  });

  const audioPlayer = useAudioPlayer(audioUrl);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  }, []);

  useEffect(() => {
    setPlayer({
      isPlaying: audioStatus.playing,
      currentTime: audioStatus.currentTime,
      duration: audioStatus.duration,
      isLoaded: audioStatus.isLoaded,
      isBuffering: audioStatus.isBuffering,
    });

    if (audioStatus.didJustFinish) {
      audioPlayer.seekTo(0);
    }
  }, [audioStatus, audioPlayer]);

  const setCameraPermission = useCallback((granted: boolean) => {
    setScanner((prev) => ({
      ...prev,
      hasPermission: granted,
      showCameraHelp: !granted,
    }));
  }, []);

  const setShowCameraHelp = useCallback((show: boolean) => {
    setScanner((prev) => ({ ...prev, showCameraHelp: show }));
  }, []);

  const startScanner = useCallback(() => {
    setScanner((prev) => ({
      ...prev,
      isScanning: true,
      message: "",
      showCameraHelp: false,
    }));
  }, []);

  const stopScanner = useCallback(() => {
    setScanner((prev) => ({
      ...prev,
      isScanning: false,
      message: "",
    }));
  }, []);

  const goToPlayer = useCallback((url: string) => {
    setAudioData({ url });
    setAudioUrl(url);
    setCurrentPage("player");
    setScanner((prev) => ({ ...prev, isScanning: false, message: "" }));
  }, []);

  const goToScanner = useCallback(
    (restart = false) => {
      setAudioUrl(null);
      setAudioData(null);
      setPlayer({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        isLoaded: false,
        isBuffering: false,
      });
      setCurrentPage("scanner");

      if (restart) {
        setScanner((prev) => ({
          ...prev,
          isScanning: true,
          message: "",
        }));
      } else {
        setScanner((prev) => ({ ...prev, message: "" }));
      }
    },
    []
  );

  const loadAudio = useCallback(
    async (url: string) => {
      try {
        stopScanner();
        setScanner((prev) => ({
          ...prev,
          message: SCANNER_MESSAGES.VALIDATING,
        }));

        await goToPlayer(url);
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
    [stopScanner, goToPlayer]
  );

  const handleBarcodeScan = useCallback(
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
          await loadAudio(url);
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
        await loadAudio(decodedText);
      } else {
        setScanner((prev) => ({
          ...prev,
          message: `Scanned: ${decodedText}\n${SCANNER_MESSAGES.INVALID_AUDIO_URL}`,
        }));
      }
    },
    [loadAudio]
  );

  const setManualUrl = useCallback((url: string) => {
    setScanner((prev) => ({ ...prev, manualUrl: url }));
  }, []);

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

    try {
      const audioUrl = await getAppleMusicSongUrl(url);
      await loadAudio(audioUrl);
    } catch (error) {
      console.error("Error loading manual URL:", error);
      setScanner((prev) => ({
        ...prev,
        message: SCANNER_MESSAGES.ERROR_LOADING,
      }));
    }
  }, [scanner.manualUrl, loadAudio]);

  const togglePlayPause = useCallback(() => {
    if (player.isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play();
    }
  }, [player.isPlaying, audioPlayer]);

  const seekTo = useCallback(
    (time: number) => {
      audioPlayer.seekTo(time);
    },
    [audioPlayer]
  );

  const contextValue = useMemo<AppContextType>(
    () => ({
      currentPage,
      audioData,
      scanner,
      player,
      startScanner,
      stopScanner,
      setManualUrl,
      loadManualUrl,
      handleBarcodeScan,
      setCameraPermission,
      setShowCameraHelp,
      togglePlayPause,
      seekTo,
      goToPlayer,
      goToScanner,
    }),
    [
      currentPage,
      audioData,
      scanner,
      player,
      startScanner,
      stopScanner,
      setManualUrl,
      loadManualUrl,
      handleBarcodeScan,
      setCameraPermission,
      setShowCameraHelp,
      togglePlayPause,
      seekTo,
      goToPlayer,
      goToScanner,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
