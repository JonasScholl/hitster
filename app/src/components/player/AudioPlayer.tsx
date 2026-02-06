import { ActivityIndicator, Text, View } from "react-native";
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
  title?: string;
  artist?: string;
  releaseYear?: number;
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
  title,
  artist,
  releaseYear,
  className = "",
}: AudioPlayerProps) {
  const hasSongInfo = title ?? artist ?? releaseYear != null;
  const yearOnly =
    releaseYear != null && title == null && artist == null;

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

      {hasSongInfo ? (
        yearOnly ? (
          <View className="items-center justify-center mb-6">
            <Text className="text-6xl font-bold text-white/90">
              {releaseYear}
            </Text>
          </View>
        ) : (
          <View className="flex-col md:flex-row items-start gap-4 mb-6">
            {releaseYear != null ? (
              <Text className="text-6xl font-bold text-white/90">
                {releaseYear}
              </Text>
            ) : null}
            <View className="justify-center min-w-0 w-full md:flex-1 md:w-auto">
              {title ? (
                <Text
                  className="text-2xl font-bold text-white tracking-tight"
                  numberOfLines={2}
                >
                  {title}
                </Text>
              ) : null}
              {artist ? (
                <Text
                  className="text-xl text-white/90 font-medium"
                  numberOfLines={1}
                >
                  {artist}
                </Text>
              ) : null}
            </View>
          </View>
        )
      ) : null}

      <View className="items-center justify-center mt-6 mb-4">
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
