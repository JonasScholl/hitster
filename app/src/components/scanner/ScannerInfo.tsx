import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface ScannerInfoProps {
  className?: string;
}

export default function ScannerInfo({ className = "" }: ScannerInfoProps) {
  return (
    <View
      className={`max-w-md bg-gray-800/80 border border-gray-600/30 rounded-lg p-3 mx-4 ${className}`}
    >
      <View className="flex-row items-start gap-2">
        <View className="shrink-0">
          <Svg
            width={16}
            height={16}
            viewBox="0 0 20 20"
            fill="#9ca3af"
            style={{ marginTop: 2 }}
          >
            <Path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </Svg>
        </View>
        <Text className="text-xs text-gray-400 flex-1">
          This scanner is for{" "}
          <Text className="text-gray-300">Apple Music</Text> QR codes. For
          Spotify cards, use your regular camera or QR scanner app.
        </Text>
      </View>
    </View>
  );
}
