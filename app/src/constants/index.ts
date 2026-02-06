export const AUDIO_VALIDATION_TIMEOUT = 5000;

export const SCANNER_MESSAGES = {
  CAMERA_NOT_SUPPORTED: "Camera not supported on this device/browser",
  CAMERA_PERMISSION_DENIED: "Camera permission denied. Please enable camera access in your device settings.",
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
  NotAllowedError: "Please allow camera access in your device settings.",
  NotFoundError: "No camera found on this device.",
  NotSupportedError: "Camera not supported on this browser.",
  default: "Please check camera permissions in your device settings.",
} as const;

export const COLORS = {
  primary: "#4f46e5",
  primaryLight: "#6366f1",
  accent: "#7c3aed",
  accentLight: "#8b5cf6",
  background: "#111827",
  surface: "#1f2937",
  surfaceLight: "#374151",
  text: "#ffffff",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
  error: "#ef4444",
  warning: "#f59e0b",
  success: "#10b981",
  progressBar: "#dec9e9",
} as const;
