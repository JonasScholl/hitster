import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { SCANNER_MESSAGE_KEYS } from "../constants";
import type { AudioData, PageType, PlayerState, ScannerState } from "../types";
import {
  getAppleMusicSongUrl,
  isAppleMusicShortUrl,
  isValidUrl,
  normalizeToSeconds,
} from "../utils";

const SHOW_SONG_YEAR_KEY = "@hitster/showSongYear";
const SHOW_SONG_TITLE_ARTIST_KEY = "@hitster/showSongTitleArtist";

interface AppContextType {
  currentPage: PageType;
  audioData: AudioData | null;
  scanner: ScannerState;
  player: PlayerState;
  showSongYear: boolean;
  showSongTitleArtist: boolean;

  startScanner: () => void;
  stopScanner: () => void;
  setManualUrl: (url: string) => void;
  loadManualUrl: () => Promise<void>;
  handleBarcodeScan: (data: string) => Promise<void>;
  setCameraPermission: (granted: boolean) => void;
  setShowCameraHelp: (show: boolean) => void;
  setShowSongYear: (value: boolean) => void;
  setShowSongTitleArtist: (value: boolean) => void;

  togglePlayPause: () => void;
  seekTo: (time: number) => void;

  goToPlayer: (url: string, metadata?: Partial<Pick<AudioData, "title" | "artist" | "releaseYear">>) => void;
  goToScanner: (restart?: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageType>("scanner");
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showSongYear, setShowSongYearState] = useState<boolean>(true);
  const [showSongTitleArtist, setShowSongTitleArtistState] =
    useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(SHOW_SONG_YEAR_KEY),
      AsyncStorage.getItem(SHOW_SONG_TITLE_ARTIST_KEY),
    ]).then(([year, titleArtist]) => {
      if (year !== null) setShowSongYearState(year === "true");
      if (titleArtist !== null) setShowSongTitleArtistState(titleArtist === "true");
    });
  }, []);

  const setShowSongYear = useCallback((value: boolean) => {
    setShowSongYearState(value);
    AsyncStorage.setItem(SHOW_SONG_YEAR_KEY, value ? "true" : "false");
  }, []);

  const setShowSongTitleArtist = useCallback((value: boolean) => {
    setShowSongTitleArtistState(value);
    AsyncStorage.setItem(SHOW_SONG_TITLE_ARTIST_KEY, value ? "true" : "false");
  }, []);

  const [scanner, setScanner] = useState<ScannerState>({
    isScanning: false,
    messageKey: "",
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
      currentTime: normalizeToSeconds(audioStatus.currentTime),
      duration: normalizeToSeconds(audioStatus.duration),
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
      messageKey: "",
      messageParams: undefined,
      showCameraHelp: false,
    }));
  }, []);

  const stopScanner = useCallback(() => {
    setScanner((prev) => ({
      ...prev,
      isScanning: false,
      messageKey: "",
      messageParams: undefined,
    }));
  }, []);

  const goToPlayer = useCallback(
    (
      url: string,
      metadata?: Partial<Pick<AudioData, "title" | "artist" | "releaseYear">>
    ) => {
      setAudioData({ url, ...metadata });
      setAudioUrl(url);
      setCurrentPage("player");
      setScanner((prev) => ({ ...prev, isScanning: false, messageKey: "", messageParams: undefined }));
    },
    []
  );

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
          messageKey: "",
          messageParams: undefined,
        }));
      } else {
        setScanner((prev) => ({ ...prev, messageKey: "", messageParams: undefined }));
      }
    },
    []
  );

  const loadAudio = useCallback(
    async (
      url: string,
      metadata?: Partial<Pick<AudioData, "title" | "artist" | "releaseYear">>
    ) => {
      try {
        stopScanner();
        setScanner((prev) => ({
          ...prev,
          messageKey: SCANNER_MESSAGE_KEYS.VALIDATING,
          messageParams: undefined,
        }));

        goToPlayer(url, metadata);
      } catch (err) {
        console.error("Error loading audio:", err);
        setScanner((prev) => ({
          ...prev,
          messageKey: SCANNER_MESSAGE_KEYS.ERROR_LOADING,
          messageParams: undefined,
        }));
        setTimeout(
          () => setScanner((prev) => ({ ...prev, messageKey: "", messageParams: undefined })),
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
          messageKey: SCANNER_MESSAGE_KEYS.SCANNED_INVALID_URL,
          messageParams: { data: decodedText },
        }));
        return;
      }

      if (isAppleMusicShortUrl(decodedText)) {
        setScanner((prev) => ({
          ...prev,
          messageKey: SCANNER_MESSAGE_KEYS.APPLE_MUSIC_SHORT_URL_DETECTED,
          messageParams: undefined,
        }));
        try {
          const result = await getAppleMusicSongUrl(decodedText);
          await loadAudio(result.url, {
            title: result.title,
            artist: result.artist,
            releaseYear: result.releaseYear,
          });
        } catch (error) {
          console.error("Error fetching Apple Music song:", error);
          setScanner((prev) => ({
            ...prev,
            messageKey: SCANNER_MESSAGE_KEYS.ERROR_LOADING,
            messageParams: undefined,
          }));
        }
      } else if (decodedText.includes("http")) {
        setScanner((prev) => ({
          ...prev,
          messageKey: SCANNER_MESSAGE_KEYS.URL_DETECTED,
          messageParams: undefined,
        }));
        await loadAudio(decodedText, undefined);
      } else {
        setScanner((prev) => ({
          ...prev,
          messageKey: SCANNER_MESSAGE_KEYS.SCANNED_INVALID_AUDIO_URL,
          messageParams: { data: decodedText },
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
      setScanner((prev) => ({ ...prev, messageKey: SCANNER_MESSAGE_KEYS.ENTER_URL, messageParams: undefined }));
      return;
    }

    if (!isValidUrl(url)) {
      setScanner((prev) => ({
        ...prev,
        messageKey: SCANNER_MESSAGE_KEYS.INVALID_URL_FORMAT,
        messageParams: undefined,
      }));
      return;
    }

    if (!url.startsWith("https:")) {
      setScanner((prev) => ({ ...prev, messageKey: SCANNER_MESSAGE_KEYS.HTTPS_ONLY, messageParams: undefined }));
      return;
    }

    if (!isAppleMusicShortUrl(url)) {
      setScanner((prev) => ({
        ...prev,
        messageKey: SCANNER_MESSAGE_KEYS.APPLE_MUSIC_ONLY,
        messageParams: undefined,
      }));
      return;
    }

    setScanner((prev) => ({ ...prev, messageKey: SCANNER_MESSAGE_KEYS.LOADING_FROM_URL, messageParams: undefined }));

    try {
      const result = await getAppleMusicSongUrl(url);
      await loadAudio(result.url, {
        title: result.title,
        artist: result.artist,
        releaseYear: result.releaseYear,
      });
    } catch (error) {
      console.error("Error loading manual URL:", error);
      setScanner((prev) => ({
        ...prev,
        messageKey: SCANNER_MESSAGE_KEYS.ERROR_LOADING,
        messageParams: undefined,
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
      if (!Number.isFinite(time) || time < 0) return;
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
      showSongYear,
      showSongTitleArtist,
      startScanner,
      stopScanner,
      setManualUrl,
      loadManualUrl,
      handleBarcodeScan,
      setCameraPermission,
      setShowCameraHelp,
      setShowSongYear,
      setShowSongTitleArtist,
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
      showSongYear,
      showSongTitleArtist,
      startScanner,
      stopScanner,
      setManualUrl,
      loadManualUrl,
      handleBarcodeScan,
      setCameraPermission,
      setShowCameraHelp,
      setShowSongYear,
      setShowSongTitleArtist,
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
