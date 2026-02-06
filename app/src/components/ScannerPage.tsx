import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../contexts";
import {
  CameraHelpModal,
  QRCodeScanner,
  ScannerInfo,
  ScannerMessage,
} from "./scanner";

export default function ScannerPage() {
  const {
    scanner,
    startScanner,
    loadManualUrl,
    setManualUrl,
  } = useAppContext();

  if (scanner.isScanning) {
    return (
      <View className="flex-1 bg-black">
        <QRCodeScanner />
        <SafeAreaView edges={["bottom"]} className="absolute bottom-0 left-0 right-0">
          <ScannerMessage message={scanner.message} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top", "bottom"]}>
      <View className="flex-1 px-4">
        <View className="items-center my-10">
          <Text className="text-3xl font-bold mb-2 text-transparent bg-clip-text">
            <Text className="text-blue-400">Hitster</Text>{" "}
            <Text className="text-purple-400">QR Scanner</Text>
          </Text>
          <Text className="text-gray-300 text-sm">
            Scan a QR code to play music
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
              <Text className="text-white font-bold text-2xl">Start</Text>
            </Pressable>
          )}

          <ScannerMessage message={scanner.message} />
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
      </View>

      <ScannerInfo className="mb-4" />
    </SafeAreaView>
  );
}
