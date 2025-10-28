export const getAppleMusicSongUrl = async (url: string): Promise<string> => {
  const path = new URL(url).pathname;
  let songId = path.split("/qr/am/").pop();

  // Also support /ar/am/ format
  if (!songId || songId === path) {
    songId = path.split("/ar/am/").pop();
  }

  if (!songId || songId === path) {
    throw new Error("Invalid Apple Music short URL");
  }

  const response = await fetch(`https://itunes.apple.com/lookup?id=${songId}`);
    const data = await response.json();
    return data.results[0].previewUrl;
};

export const getAppleMusicPreviewUrlBySongId = async (songId: string): Promise<string> => {
  const response = await fetch(`https://itunes.apple.com/lookup?id=${songId}`);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Song not found");
  }

  return data.results[0].previewUrl;
};
