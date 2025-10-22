import { Html5Qrcode } from 'html5-qrcode';
import { useCallback, useRef, useState } from 'react';
import { QR_CODE_CONFIG, SCANNER_MESSAGES } from '../constants';
import { ScannerState } from '../types';
import { isItunesAudioUrl, isValidUrl, validateAudioUrl } from '../utils/audioValidation';
import { checkCameraPermission, createCameraError } from '../utils/cameraUtils';

interface UseScannerProps {
  onAudioDetected: (url: string) => void;
}

export const useScanner = ({ onAudioDetected }: UseScannerProps) => {
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    message: '',
    showCameraHelp: false,
    manualUrl: '',
  });

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);

  const updateState = useCallback((updates: Partial<ScannerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const showCameraPermissionError = useCallback((error: Error) => {
    const cameraError = createCameraError(error);
    updateState({
      message: cameraError.message,
      showCameraHelp: true,
    });
  }, [updateState]);

  const startScanner = useCallback(async () => {
    try {
      updateState({ showCameraHelp: false, message: '' });

      const hasPermission = await checkCameraPermission();
      if (!hasPermission) {
        updateState({
          message: SCANNER_MESSAGES.CAMERA_NOT_SUPPORTED,
          showCameraHelp: true,
        });
        return;
      }

      if (qrReaderRef.current) {
        scannerRef.current = new Html5Qrcode(qrReaderRef.current.id);

        await scannerRef.current.start(
          { facingMode: "environment" },
          QR_CODE_CONFIG,
          (decodedText) => handleScanSuccess(decodedText),
          (errorMessage) => {
            console.error("Error scanning QR code:", errorMessage);
          }
        );

        updateState({
          isScanning: true,
          message: SCANNER_MESSAGES.ACTIVE,
        });
      }
    } catch (err) {
      console.error("Error starting scanner:", err);
      showCameraPermissionError(err as Error);
    }
  }, [updateState, showCameraPermissionError]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        updateState({
          isScanning: false,
          message: SCANNER_MESSAGES.STOPPED,
        });
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  }, [updateState]);

  const handleScanSuccess = useCallback((decodedText: string) => {
    console.log("QR Code scanned:", decodedText);

    if (!isValidUrl(decodedText)) {
      updateState({
        message: `Scanned: ${decodedText}\n${SCANNER_MESSAGES.INVALID_URL}`,
      });
      return;
    }

    if (isItunesAudioUrl(decodedText)) {
      updateState({ message: SCANNER_MESSAGES.ITUNES_DETECTED });
      loadAudio(decodedText);
    } else if (decodedText.includes("http")) {
      updateState({ message: SCANNER_MESSAGES.URL_DETECTED });
      loadAudio(decodedText);
    } else {
      updateState({
        message: `Scanned: ${decodedText}\n${SCANNER_MESSAGES.INVALID_AUDIO_URL}`,
      });
    }
  }, [updateState]);

  const loadAudio = useCallback(async (url: string) => {
    try {
      await stopScanner();
      updateState({ message: SCANNER_MESSAGES.VALIDATING });

      const isValidAudio = await validateAudioUrl(url);
      if (!isValidAudio) {
        updateState({ message: SCANNER_MESSAGES.INVALID_AUDIO });
        setTimeout(() => {
          updateState({ message: '' });
        }, 3000);
        return;
      }

      onAudioDetected(url);
    } catch (err) {
      console.error("Error loading audio:", err);
      updateState({ message: SCANNER_MESSAGES.ERROR_LOADING });
      setTimeout(() => {
        updateState({ message: '' });
      }, 3000);
    }
  }, [stopScanner, updateState, onAudioDetected]);

  const loadManualUrl = useCallback(() => {
    const url = state.manualUrl.trim();
    if (!url) {
      updateState({ message: SCANNER_MESSAGES.ENTER_URL });
      return;
    }

    if (!isValidUrl(url)) {
      updateState({ message: SCANNER_MESSAGES.INVALID_URL_FORMAT });
      return;
    }

    if (!url.startsWith('https:')) {
      updateState({ message: SCANNER_MESSAGES.HTTPS_ONLY });
      return;
    }

    // For manual entry, we'll be more restrictive
    if (!isItunesAudioUrl(url)) {
      updateState({ message: SCANNER_MESSAGES.APPLE_MUSIC_ONLY });
      return;
    }

    updateState({ message: "Loading audio from URL..." });
    loadAudio(url);
  }, [state.manualUrl, updateState, loadAudio]);

  const setManualUrl = useCallback((url: string) => {
    updateState({ manualUrl: url });
  }, [updateState]);

  return {
    state,
    qrReaderRef,
    startScanner,
    stopScanner,
    loadManualUrl,
    setManualUrl,
  };
};
