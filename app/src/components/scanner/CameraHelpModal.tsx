import { Platform, ScrollView, Text, View } from "react-native";
import { Button, Input } from "../ui";

interface CameraHelpModalProps {
  manualUrl: string;
  onManualUrlChange: (url: string) => void;
  onLoadManualUrl: () => void;
  className?: string;
}

export default function CameraHelpModal({
  manualUrl,
  onManualUrlChange,
  onLoadManualUrl,
  className = "",
}: CameraHelpModalProps) {
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";
  const isAndroid = Platform.OS === "android";

  return (
    <ScrollView
      className={`max-w-lg mx-auto bg-gray-800 rounded-lg p-6 ${className}`}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-lg font-semibold mb-4 text-yellow-400">
        Camera Access Required
      </Text>

      <View className="gap-3">
        <Text className="text-sm text-gray-300">
          To scan QR codes, this app needs access to your camera. Here's how to
          enable it:
        </Text>

        {isWeb && (
          <View className="bg-gray-700 rounded p-3">
            <Text className="font-semibold text-white mb-2">
              For Chrome/Edge:
            </Text>
            <View className="gap-1">
              <Text className="text-xs text-gray-300">
                • Click the camera icon in the address bar
              </Text>
              <Text className="text-xs text-gray-300">
                • Select "Allow" for camera access
              </Text>
              <Text className="text-xs text-gray-300">
                • Refresh the page and try again
              </Text>
            </View>
          </View>
        )}

        {(isWeb || isIOS) && (
          <View className="bg-gray-700 rounded p-3">
            <Text className="font-semibold text-white mb-2">
              {isWeb ? "For Safari:" : "For iOS:"}
            </Text>
            <View className="gap-1">
              {isWeb ? (
                <>
                  <Text className="text-xs text-gray-300">
                    • Go to Safari → Settings → Websites → Camera
                  </Text>
                  <Text className="text-xs text-gray-300">
                    • Set this website to "Allow"
                  </Text>
                  <Text className="text-xs text-gray-300">
                    • Refresh the page and try again
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-xs text-gray-300">
                    • Open Settings app
                  </Text>
                  <Text className="text-xs text-gray-300">
                    • Scroll down to find this app
                  </Text>
                  <Text className="text-xs text-gray-300">
                    • Enable Camera access
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        {isAndroid && (
          <View className="bg-gray-700 rounded p-3">
            <Text className="font-semibold text-white mb-2">For Android:</Text>
            <View className="gap-1">
              <Text className="text-xs text-gray-300">
                • Open Settings → Apps
              </Text>
              <Text className="text-xs text-gray-300">
                • Find and select this app
              </Text>
              <Text className="text-xs text-gray-300">
                • Tap Permissions → Camera → Allow
              </Text>
            </View>
          </View>
        )}

        <View className="bg-gray-700 rounded p-3">
          <Text className="font-semibold text-white mb-2">Alternative:</Text>
          <Text className="text-xs text-gray-300 mb-3">
            You can also manually enter the card audio URL below:
          </Text>
          <View className="gap-2">
            <Input
              value={manualUrl}
              onChangeText={onManualUrlChange}
              onSubmitEditing={onLoadManualUrl}
              placeholder="Paste card audio URL here..."
              keyboardType="url"
              returnKeyType="go"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button onPress={onLoadManualUrl} size="sm">
              Load Audio
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
