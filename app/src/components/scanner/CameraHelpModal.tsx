import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";
  const isAndroid = Platform.OS === "android";

  return (
    <ScrollView
      className={`max-w-lg mx-auto bg-gray-800 rounded-lg p-6 ${className}`}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-lg font-semibold mb-4 text-yellow-400">
        {t("camera.accessRequired")}
      </Text>

      <View className="gap-3">
        <Text className="text-sm text-gray-300">
          {t("camera.enableInstructions")}
        </Text>

        {isWeb && (
          <View className="bg-gray-700 rounded p-3">
            <Text className="font-semibold text-white mb-2">
              {t("camera.chromeEdge")}
            </Text>
            <View className="gap-1">
              <Text className="text-xs text-gray-300">
                • {t("camera.chromeStep1")}
              </Text>
              <Text className="text-xs text-gray-300">
                • {t("camera.chromeStep2")}
              </Text>
              <Text className="text-xs text-gray-300">
                • {t("camera.chromeStep3")}
              </Text>
            </View>
          </View>
        )}

        {(isWeb || isIOS) && (
          <View className="bg-gray-700 rounded p-3">
            <Text className="font-semibold text-white mb-2">
              {isWeb ? t("camera.safari") : t("camera.iOS")}
            </Text>
            <View className="gap-1">
              {isWeb ? (
                <>
                  <Text className="text-xs text-gray-300">
                    • {t("camera.safariStep1")}
                  </Text>
                  <Text className="text-xs text-gray-300">
                    • {t("camera.safariStep2")}
                  </Text>
                  <Text className="text-xs text-gray-300">
                    • {t("camera.safariStep3")}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-xs text-gray-300">
                    • {t("camera.iOSStep1")}
                  </Text>
                  <Text className="text-xs text-gray-300">
                    • {t("camera.iOSStep2")}
                  </Text>
                  <Text className="text-xs text-gray-300">
                    • {t("camera.iOSStep3")}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        {isAndroid && (
          <View className="bg-gray-700 rounded p-3">
            <Text className="font-semibold text-white mb-2">
              {t("camera.android")}
            </Text>
            <View className="gap-1">
              <Text className="text-xs text-gray-300">
                • {t("camera.androidStep1")}
              </Text>
              <Text className="text-xs text-gray-300">
                • {t("camera.androidStep2")}
              </Text>
              <Text className="text-xs text-gray-300">
                • {t("camera.androidStep3")}
              </Text>
            </View>
          </View>
        )}

        <View className="bg-gray-700 rounded p-3">
          <Text className="font-semibold text-white mb-2">
            {t("camera.alternative")}
          </Text>
          <Text className="text-xs text-gray-300 mb-3">
            {t("camera.manualEntryHint")}
          </Text>
          <View className="gap-2">
            <Input
              value={manualUrl}
              onChangeText={onManualUrlChange}
              onSubmitEditing={onLoadManualUrl}
              placeholder={t("camera.manualUrlPlaceholder")}
              keyboardType="url"
              returnKeyType="go"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button onPress={onLoadManualUrl} size="sm">
              {t("camera.loadAudio")}
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
