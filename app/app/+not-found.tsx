import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View className="flex-1 items-center justify-center bg-gray-900 p-4">
        <Text className="text-xl font-bold text-white">
          Page not found
        </Text>
      </View>
    </>
  );
}
