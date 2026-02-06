import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <View className={`flex-row justify-between items-center ${className}`}>
      <Text className="text-2xl font-bold text-white">
        {t("player.nowPlaying")}
      </Text>
      <CloseIconButton
        onPress={onClose}
        accessibilityLabel={t("player.closePlayer")}
      />
    </View>
  );
}
