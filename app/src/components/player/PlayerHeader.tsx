import { Text, View } from "react-native";
import { CloseIconButton } from "../ui";

interface PlayerHeaderProps {
  onClose: () => void;
  className?: string;
}

export default function PlayerHeader({
  onClose,
  className = "",
}: PlayerHeaderProps) {
  return (
    <View className={`flex-row justify-between items-center ${className}`}>
      <Text className="text-2xl font-bold text-white">Now Playing</Text>
      <CloseIconButton onPress={onClose} accessibilityLabel="Close player" />
    </View>
  );
}
