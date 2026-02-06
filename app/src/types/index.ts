export interface AudioData {
  url: string;
  title?: string;
  artist?: string;
  releaseYear?: number;
}

export type PageType = "scanner" | "player";

export interface ScannerState {
  isScanning: boolean;
  messageKey: string;
  messageParams?: Record<string, string>;
  showCameraHelp: boolean;
  manualUrl: string;
  hasPermission: boolean | null;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoaded: boolean;
  isBuffering: boolean;
}

export interface CameraError {
  name: string;
  message: string;
}

export interface BarcodeData {
  type: string;
  data: string;
}
