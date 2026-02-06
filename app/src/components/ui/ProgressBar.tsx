import { useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from "react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { calculateProgressPercentage, formatTime } from "../../utils/time";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}

export default function ProgressBar({
  currentTime,
  duration,
  onSeek,
  className = "",
}: ProgressBarProps) {
  const { t } = useTranslation();
  const [containerWidth, setContainerWidth] = useState(0);
  const progressPercentage = calculateProgressPercentage(currentTime, duration);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (
        containerWidth <= 0 ||
        duration <= 0 ||
        !Number.isFinite(duration)
      ) {
        return;
      }

      const locationX = event.nativeEvent.locationX;
      const percentage = Math.max(0, Math.min(1, locationX / containerWidth));
      const newTime = percentage * duration;
      if (!Number.isFinite(newTime)) return;
      onSeek(newTime);
    },
    [containerWidth, duration, onSeek]
  );

  return (
    <View className={`gap-2 ${className}`}>
      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-200">{formatTime(currentTime)}</Text>
        <Text className="text-sm text-gray-200">{formatTime(duration)}</Text>
      </View>

      <Pressable
        onPress={handlePress}
        onLayout={handleLayout}
        className="w-full h-6 justify-center"
        accessibilityLabel={t("player.seekPosition")}
        accessibilityRole="adjustable"
      >
        <View className="w-full bg-gray-700 rounded-full h-2">
          <View
            className="bg-[#dec9e9] h-2 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
      </Pressable>
    </View>
  );
}
