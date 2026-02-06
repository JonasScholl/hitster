# Hitster - Mobile App

A cross-platform mobile application built with React Native and Expo for scanning Hitster QR codes and playing Apple Music previews.

## Features

- QR Code scanning using device camera
- Apple Music preview playback
- Cross-platform support: iOS, Android, and Web
- Beautiful UI with dark theme
- Responsive design for all screen sizes

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo SDK 52** - Development and build tooling
- **TypeScript** - Type-safe development
- **NativeWind** - Tailwind CSS for React Native
- **expo-camera** - Camera access and barcode scanning
- **expo-audio** - Audio playback
- **expo-router** - File-based routing

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- For iOS development: macOS with Xcode
- For Android development: Android Studio with Android SDK

> **Note**: This app requires a **development build** and cannot run in Expo Go. The `expo-audio` package includes native code that must be compiled.

### Installation

```bash
# Navigate to the app directory
cd app

# Install dependencies
pnpm install

# Generate native projects (first time only)
pnpm prebuild
```

### Running the App

```bash
# Run on iOS simulator (builds native code)
pnpm ios

# Run on Android emulator (builds native code)
pnpm android

# Run in web browser (no native build required)
pnpm web
```

After the initial build, subsequent runs will be faster as only JavaScript changes need to be bundled.

## Project Structure

```
app/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Home screen
│   └── +not-found.tsx     # 404 page
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── scanner/      # Scanner-related components
│   │   ├── player/       # Player-related components
│   │   ├── ScannerPage.tsx
│   │   └── PlayerPage.tsx
│   ├── contexts/         # React contexts
│   │   └── AppContext.tsx
│   ├── constants/        # App constants
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── assets/               # Static assets
├── ios/                  # Native iOS project (generated)
├── android/              # Native Android project (generated)
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
├── metro.config.js      # Metro bundler configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Building for Production

### Web

```bash
pnpm exec expo export --platform web
```

### iOS

```bash
# Local build (requires Xcode)
pnpm exec expo run:ios --configuration Release

# Cloud build with EAS
pnpm exec eas build --platform ios
```

### Android

```bash
# Local build (requires Android Studio)
pnpm exec expo run:android --variant release

# Cloud build with EAS
pnpm exec eas build --platform android
```

## Configuration

### Camera Permissions

Camera permissions are configured in `app.json`:

- **iOS**: Customizable permission message
- **Android**: CAMERA permission automatically requested

### Supported Barcode Types

The scanner is configured to detect QR codes only for optimal performance.

## License

MIT
