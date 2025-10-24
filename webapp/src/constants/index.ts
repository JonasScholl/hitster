// Nimiq QR Scanner configuration
export const QR_SCANNER_CONFIG = {
  preferredCamera: 'environment' as const,
  highlightScanRegion: true,
  highlightCodeOutline: true,
  maxScansPerSecond: 5,
};

export const AUDIO_VALIDATION_TIMEOUT = 5000;

export const SCANNER_MESSAGES = {
  CAMERA_NOT_SUPPORTED: "Camera not supported on this device/browser",
  INVALID_URL: "This doesn't appear to be a valid URL.",
  INVALID_AUDIO_URL: "This doesn't appear to be an audio URL.",
  APPLE_MUSIC_SHORT_URL_DETECTED: "Apple Music short URL detected! Validating...",
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
