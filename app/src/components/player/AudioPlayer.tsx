import { ActivityIndicator, View } from "react-native";
import { PlayPauseButton, ProgressBar } from "../ui";
import { LinearGradient } from "expo-linear-gradient";

interface AudioPlayerProps {
  isPlaying: boolean;
  isBuffering: boolean;
  isLoaded: boolean;
  currentTime: number;
  duration: number;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
  className?: string;
}

export default function AudioPlayer({
  isPlaying,
  isBuffering,
  isLoaded,
  currentTime,
  duration,
  onTogglePlayPause,
  onSeek,
  className = "",
}: AudioPlayerProps) {
  return (
    <View className={`rounded-2xl p-8 shadow-2xl overflow-hidden ${className}`}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />

      <View className="items-center justify-center mb-4">
        {isBuffering && !isLoaded ? (
          <View className="w-24 h-24 items-center justify-center">
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <PlayPauseButton isPlaying={isPlaying} onToggle={onTogglePlayPause} />
        )}
      </View>

      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
      />
    </View>
  );
}
