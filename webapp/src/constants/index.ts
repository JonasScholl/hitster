import { AllowedHosts, QRCodeConfig } from '../types';

export const QR_CODE_CONFIG: QRCodeConfig = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
};

export const ALLOWED_HOSTS: AllowedHosts = {
  appleMusic: [
    "audio-ssl.itunes.apple.com",
    "itunes.apple.com",
    "itunes-assets.apple.com",
  ],
  spotify: [
    "open.spotify.com",
    "p.scdn.co",
  ],
};

export const AUDIO_VALIDATION_TIMEOUT = 5000;

export const SCANNER_MESSAGES = {
  CAMERA_NOT_SUPPORTED: "Camera not supported on this device/browser",
  INVALID_URL: "This doesn't appear to be a valid URL.",
  INVALID_AUDIO_URL: "This doesn't appear to be an audio URL.",
  ITUNES_DETECTED: "iTunes audio URL detected! Validating...",
  URL_DETECTED: "URL detected. Checking if it's an audio file...",
  VALIDATING: "Validating audio URL...",
  INVALID_AUDIO: "Invalid or inaccessible audio URL. Please try a different QR code.",
  ERROR_LOADING: "Error loading audio file. Please try again.",
  ENTER_URL: "Please enter a URL",
  INVALID_URL_FORMAT: "Please enter a valid URL",
  HTTPS_ONLY: "Only HTTPS URLs are permitted.",
  APPLE_MUSIC_ONLY: "Only Apple Music audio preview URLs are permitted.",
} as const;

export const CAMERA_ERROR_MESSAGES = {
  NotAllowedError: "Please allow camera access and refresh the page.",
  NotFoundError: "No camera found on this device.",
  NotSupportedError: "Camera not supported on this browser.",
  default: "Please check camera permissions.",
} as const;
