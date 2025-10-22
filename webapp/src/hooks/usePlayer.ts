import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioData, PlayerState } from '../types';

interface UsePlayerProps {
  audioData: AudioData;
}

export const usePlayer = ({ audioData }: UsePlayerProps) => {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  const updateState = useCallback((updates: Partial<PlayerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      updateState({ duration: audio.duration });
    };

    const handleTimeUpdate = () => {
      updateState({ currentTime: audio.currentTime });
    };

    const handleEnded = () => {
      updateState({ isPlaying: false, currentTime: 0 });
    };

    const handleCanPlay = () => {
      console.log("Audio ready to play");
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);

    // Set audio source
    audio.src = audioData.url;
    audio.volume = 1.0;

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioData.url, updateState]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      audio.pause();
      updateState({ isPlaying: false });
    } else {
      audio.play();
      updateState({ isPlaying: true });
    }
  }, [state.isPlaying, updateState]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || state.duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * state.duration;

    audio.currentTime = newTime;
    updateState({ currentTime: newTime });
  }, [state.duration, updateState]);

  return {
    state,
    audioRef,
    togglePlayPause,
    handleProgressClick,
  };
};
