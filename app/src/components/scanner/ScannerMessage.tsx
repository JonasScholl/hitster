import { Text, View } from "react-native";

interface ScannerMessageProps {
  message: string;
  className?: string;
}

export default function ScannerMessage({
  message,
  className = "",
}: ScannerMessageProps) {
  if (!message) return null;

  return (
    <View className={`mt-4 px-4 ${className}`}>
      <Text className="text-center text-gray-300 text-base">{message}</Text>
    </View>
  );
}
