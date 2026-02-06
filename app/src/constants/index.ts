export const AUDIO_VALIDATION_TIMEOUT = 5000;

export const SCANNER_MESSAGE_KEYS = {
  CAMERA_NOT_SUPPORTED: "messages.cameraNotSupported",
  CAMERA_PERMISSION_DENIED: "messages.cameraPermissionDenied",
  INVALID_URL: "messages.invalidUrl",
  INVALID_AUDIO_URL: "messages.invalidAudioUrl",
  APPLE_MUSIC_SHORT_URL_DETECTED: "messages.appleMusicDetected",
  URL_DETECTED: "messages.urlDetected",
  VALIDATING: "messages.validating",
  INVALID_AUDIO: "messages.invalidAudio",
  ERROR_LOADING: "messages.errorLoading",
  ENTER_URL: "messages.enterUrl",
  INVALID_URL_FORMAT: "messages.invalidUrlFormat",
  HTTPS_ONLY: "messages.httpsOnly",
  APPLE_MUSIC_ONLY: "messages.appleMusicOnly",
  LOADING_FROM_URL: "messages.loadingFromUrl",
  SCANNED_INVALID_URL: "messages.scannedInvalidUrl",
  SCANNED_INVALID_AUDIO_URL: "messages.scannedInvalidAudioUrl",
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
