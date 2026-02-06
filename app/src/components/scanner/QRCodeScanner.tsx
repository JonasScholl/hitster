import { CameraView, useCameraPermissions } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { useAppContext } from "../../contexts";
import { CloseIconButton } from "../ui";

interface QRCodeScannerProps {
  className?: string;
}

export default function QRCodeScanner({ className = "" }: QRCodeScannerProps) {
  const { t } = useTranslation();
  const {
    scanner,
    stopScanner,
    handleBarcodeScan,
    setCameraPermission,
  } = useAppContext();

  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (scanner.isScanning && !permission?.granted) {
      requestPermission();
    }
  }, [scanner.isScanning, permission?.granted, requestPermission]);

  useEffect(() => {
    if (permission) {
      setCameraPermission(permission.granted);
    }
  }, [permission, setCameraPermission]);

  useEffect(() => {
    if (!scanner.isScanning) {
      setHasScanned(false);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
    }
  }, [scanner.isScanning]);

  const onBarcodeScanned = useCallback(
    ({ data }: { type: string; data: string }) => {
      if (hasScanned) return;

      setHasScanned(true);
      handleBarcodeScan(data);

      scanTimeoutRef.current = setTimeout(() => {
        setHasScanned(false);
      }, 2000);
    },
    [hasScanned, handleBarcodeScan]
  );

  if (!scanner.isScanning) {
    return null;
  }

  if (!permission?.granted) {
    return null;
  }

  return (
    <View className={`relative flex-1 ${className}`}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={hasScanned ? undefined : onBarcodeScanned}
      />

      <View className="absolute inset-0 items-center justify-center">
        <View className="w-64 h-64 border-2 border-white/50 rounded-2xl" />
      </View>

      <View
        className="absolute top-4 right-4"
        style={Platform.OS === "ios" ? { top: 60 } : undefined}
      >
        <CloseIconButton onPress={stopScanner} accessibilityLabel={t("camera.closeScanner")} />
      </View>
    </View>
  );
}
