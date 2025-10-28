import { CAMERA_ERROR_MESSAGES } from '../constants';
import { CameraError } from '../types';

export const checkCameraPermission = async (): Promise<boolean> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch {
    return false;
  }
};

export const getCameraErrorMessage = (error: Error): string => {
  const errorName = error.name as keyof typeof CAMERA_ERROR_MESSAGES;
  const message = CAMERA_ERROR_MESSAGES[errorName] || CAMERA_ERROR_MESSAGES.default;
  return `Camera access denied. ${message}`;
};

export const createCameraError = (error: Error): CameraError => ({
  name: error.name,
  message: getCameraErrorMessage(error),
});
