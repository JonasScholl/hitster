import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t("notFound.title") }} />
      <View className="flex-1 items-center justify-center bg-gray-900 p-4">
        <Text className="text-xl font-bold text-white">
          {t("notFound.message")}
        </Text>
      </View>
    </>
  );
}
