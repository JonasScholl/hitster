export interface AudioData {
  url: string;
}

export type PageType = "scanner" | "player";

export interface ScannerState {
  isScanning: boolean;
  message: string;
  showCameraHelp: boolean;
  manualUrl: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export interface CameraError {
  name: string;
  message: string;
}

export interface AllowedHosts {
  appleMusic: string[];
  spotify: string[];
}
