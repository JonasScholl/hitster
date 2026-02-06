import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../contexts";
import { AudioPlayer, PlayerHeader } from "./player";

export default function PlayerPage() {
  const {
    player,
    audioData,
    showSongYear,
    showSongTitleArtist,
    togglePlayPause,
    seekTo,
    goToScanner,
  } = useAppContext();

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top", "bottom"]}>
      <View className="flex-1 max-w-xl mx-auto px-4 pt-6 w-full gap-6">
        <PlayerHeader onClose={() => goToScanner(true)} />

        <AudioPlayer
          className="mt-4"
          isPlaying={player.isPlaying}
          isBuffering={player.isBuffering}
          isLoaded={player.isLoaded}
          currentTime={player.currentTime}
          duration={player.duration}
          onTogglePlayPause={togglePlayPause}
          onSeek={seekTo}
          title={showSongTitleArtist ? audioData?.title : undefined}
          artist={showSongTitleArtist ? audioData?.artist : undefined}
          releaseYear={showSongYear ? audioData?.releaseYear : undefined}
        />
      </View>
    </SafeAreaView>
  );
}
