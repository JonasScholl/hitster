import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

interface ScannerMessageProps {
  messageKey: string;
  messageParams?: Record<string, string>;
  className?: string;
}

export default function ScannerMessage({
  messageKey,
  messageParams,
  className = "",
}: ScannerMessageProps) {
  const { t } = useTranslation();

  if (!messageKey) return null;

  return (
    <View className={`mt-4 px-4 ${className}`}>
      <Text className="text-center text-gray-300 text-base">
        {t(messageKey, messageParams)}
      </Text>
    </View>
  );
}
