export const getAppleMusicSongUrl = async (url: string): Promise<string> => {
  const path = new URL(url).pathname;
  const songId = path.split("/qr/am/").pop();

  if (!songId) {
    throw new Error("Invalid Apple Music short URL");
  }

  const response = await fetch(`https://itunes.apple.com/lookup?id=${songId}`);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Song not found on Apple Music");
  }

  const previewUrl = data.results[0]?.previewUrl;

  if (!previewUrl) {
    throw new Error("No preview URL available for this song");
  }

  return previewUrl;
};
