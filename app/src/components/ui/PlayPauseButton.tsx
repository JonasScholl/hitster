import { Pressable, View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  className?: string;
}

export default function PlayPauseButton({
  isPlaying,
  onToggle,
  className = "",
}: PlayPauseButtonProps) {
  const PlayIcon = () => (
    <Svg width={48} height={48} viewBox="0 0 20 20" fill="#374151">
      <Path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
        clipRule="evenodd"
      />
    </Svg>
  );

  const PauseIcon = () => (
    <Svg width={48} height={48} viewBox="0 0 20 20" fill="#374151">
      <Path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </Svg>
  );

  return (
    <Pressable
      onPress={onToggle}
      className={`w-24 h-24 rounded-full bg-[#dec9e9] items-center justify-center shadow-lg active:opacity-80 ${className}`}
      accessibilityLabel={isPlaying ? "Pause" : "Play"}
      accessibilityRole="button"
    >
      <View style={{ marginLeft: isPlaying ? 0 : 2 }}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </View>
    </Pressable>
  );
}
