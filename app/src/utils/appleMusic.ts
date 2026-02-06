export interface AppleMusicSongResult {
  url: string;
  title?: string;
  artist?: string;
  releaseYear?: number;
}

export const getAppleMusicSongUrl = async (
  url: string
): Promise<AppleMusicSongResult> => {
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

  const track = data.results[0];
  const previewUrl = track?.previewUrl;

  if (!previewUrl) {
    throw new Error("No preview URL available for this song");
  }

  const releaseDate = track?.releaseDate;
  const releaseYear =
    typeof releaseDate === "string"
      ? new Date(releaseDate).getFullYear()
      : undefined;

  return {
    url: previewUrl,
    title: track?.trackName,
    artist: track?.artistName,
    releaseYear: Number.isNaN(releaseYear) ? undefined : releaseYear,
  };
};
