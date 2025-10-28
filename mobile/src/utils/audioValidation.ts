import { AUDIO_VALIDATION_TIMEOUT } from '../constants';

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isHttpsUrl = (url: string): boolean => {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
};

export const isAppleMusicShortUrl = (url: string): boolean => {
  const path = new URL(url).pathname;
  return path.startsWith("/qr/am/") || path.startsWith("/ar/am/");
};

export const validateAudioUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const testAudio = new Audio();
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, AUDIO_VALIDATION_TIMEOUT);

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
      }
    };

    testAudio.addEventListener("canplay", () => {
      cleanup();
      resolve(true);
    });

    testAudio.addEventListener("error", () => {
      cleanup();
      resolve(false);
    });

    testAudio.addEventListener("loadeddata", () => {
      cleanup();
      resolve(true);
    });

    testAudio.src = url;
    testAudio.load();
  });
};
