export const getAppleMusicSongId = async (url: string): Promise<string> => {
  const path = new URL(url).pathname;
  const songId = path.split("/qr/am/").pop();

  if (!songId) {
    throw new Error("Invalid Apple Music short URL");
  }

  const response = await fetch(`https://itunes.apple.com/lookup?id=${songId}`);
    const data = await response.json();
    return data.results[0].previewUrl;
};
