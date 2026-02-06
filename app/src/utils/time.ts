export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const calculateProgressPercentage = (
  currentTime: number,
  duration: number
): number => {
  if (duration <= 0) return 0;
  return Math.min(100, Math.max(0, (currentTime / duration) * 100));
};
