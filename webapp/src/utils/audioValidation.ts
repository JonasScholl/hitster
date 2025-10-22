import { ALLOWED_HOSTS, AUDIO_VALIDATION_TIMEOUT } from '../constants';

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

export const isAppleMusicUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    const isAllowedHost = ALLOWED_HOSTS.appleMusic.some(host =>
      parsedUrl.host.endsWith(host)
    );

    const hasAudioPreviewPath =
      parsedUrl.pathname.includes("itunes-assets/AudioPreview") ||
      parsedUrl.pathname.endsWith(".aac.p.m4a");

    return isAllowedHost && hasAudioPreviewPath;
  } catch {
    return false;
  }
};

export const isItunesAudioUrl = (url: string): boolean => {
  return url.includes("itunes-assets/AudioPreview") ||
         url.includes(".aac.p.m4a") ||
         (isValidUrl(url) && new URL(url).host === "audio-ssl.itunes.apple.com");
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
