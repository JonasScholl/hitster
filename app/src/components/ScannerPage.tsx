import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import Toggle from "./ui/Toggle";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../contexts";
import {
  CameraHelpModal,
  QRCodeScanner,
  ScannerInfo,
  ScannerMessage,
} from "./scanner";

export default function ScannerPage() {
  const { t } = useTranslation();
  const {
    scanner,
    startScanner,
    loadManualUrl,
    setManualUrl,
    showSongYear,
    showSongTitleArtist,
    setShowSongYear,
    setShowSongTitleArtist,
  } = useAppContext();

  if (scanner.isScanning) {
    return (
      <View className="flex-1 bg-black">
        <QRCodeScanner />
        <SafeAreaView
          edges={["bottom"]}
          className="absolute bottom-0 left-0 right-0"
        >
          <ScannerMessage
            messageKey={scanner.messageKey}
            messageParams={scanner.messageParams}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top", "bottom"]}>
      <View className="flex-1 max-w-md w-full mx-auto px-4">
        <View className="items-center my-10">
          <Text className="text-3xl font-bold mb-2 text-transparent bg-clip-text">
            <Text className="text-blue-400">{t("scanner.title")}</Text>{" "}
            <Text className="text-purple-400">{t("scanner.subtitle")}</Text>
          </Text>
          <Text className="text-gray-300 text-sm">
            {t("scanner.tagline")}
          </Text>
        </View>

        <View className="flex-1 items-center justify-center gap-4">
          {!scanner.showCameraHelp && (
            <Pressable
              onPress={startScanner}
              className="w-32 h-32 rounded-full items-center justify-center shadow-2xl active:scale-95"
              style={{ overflow: "hidden" }}
            >
              <LinearGradient
                colors={["#3b82f6", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
              <Text className="text-white font-bold text-2xl">
                {t("scanner.start")}
              </Text>
            </Pressable>
          )}

          <ScannerMessage
            messageKey={scanner.messageKey}
            messageParams={scanner.messageParams}
          />
        </View>

        {scanner.showCameraHelp && (
          <View className="mb-4">
            <CameraHelpModal
              manualUrl={scanner.manualUrl}
              onManualUrlChange={setManualUrl}
              onLoadManualUrl={loadManualUrl}
            />
          </View>
        )}

        <View className="flex-row items-center justify-between mb-2 px-3 py-2 bg-gray-800/80 border border-gray-600/30 rounded-lg">
          <Text className="text-gray-300">{t("scanner.showYear")}</Text>
          <Toggle value={showSongYear} onValueChange={setShowSongYear} />
        </View>
        <View className="flex-row items-center justify-between mb-3 px-3 py-2 bg-gray-800/80 border border-gray-600/30 rounded-lg">
          <Text className="text-gray-300">{t("scanner.showTitleArtist")}</Text>
          <Toggle
            value={showSongTitleArtist}
            onValueChange={setShowSongTitleArtist}
          />
        </View>

        <ScannerInfo className="mb-4" />
      </View>
    </SafeAreaView>
  );
}
