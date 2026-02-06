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
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
};

export const isAppleMusicShortUrl = (url: string): boolean => {
  try {
    const path = new URL(url).pathname;
    return path.startsWith("/qr/am/");
  } catch {
    return false;
  }
};
