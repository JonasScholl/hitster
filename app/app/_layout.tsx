import "../global.css";
import "../src/i18n";

import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider, useAppContext } from "../src/contexts";

function InitialUrlHandler() {
  const { loadFromUrl } = useAppContext();
  const handled = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "web" || handled.current) return;
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    if (!pathname.startsWith("/qr/am/")) return;
    handled.current = true;
    const url = `${window.location.origin}${pathname}${window.location.search}${window.location.hash}`;
    loadFromUrl(url);
  }, [loadFromUrl]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <InitialUrlHandler />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#111827" },
            animation: "fade",
          }}
        />
      </AppProvider>
    </SafeAreaProvider>
  );
}
