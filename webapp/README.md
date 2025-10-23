# Hitster QR Scanner - React App

A modern React application for scanning QR codes to play Apple Music audio previews.

## Features

- **QR Code Scanning**: Uses device camera to scan QR codes containing audio URLs
- **Audio Player**: Built-in audio player with play/pause, progress bar, and seeking
- **Manual URL Entry**: Fallback option to manually enter audio URLs
- **Camera Permission Handling**: User-friendly error messages and help for camera access
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Full type safety throughout the application

## Technology Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **html5-qrcode** for QR code scanning
- **pnpm** for package management

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (recommended package manager)

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
pnpm build
```

The built files will be in the `dist` directory.

## Usage

1. **Start Scanning**: Click "Scan Card" to begin QR code scanning
2. **Scan QR Code**: Point your camera at a QR code containing an Apple Music audio URL
3. **Play Audio**: The audio player will automatically load and you can control playback
4. **Manual Entry**: If scanning fails, you can manually enter an audio URL in the help section
5. **Scan New Card**: Use "Scan new Card" to return to the scanner

## Supported Audio URLs

The app specifically supports Apple Music audio preview URLs from:
- `audio-ssl.itunes.apple.com`
- `itunes.apple.com`
- `itunes-assets.apple.com`

URLs must contain:
- `itunes-assets/AudioPreview` in the path, OR
- End with `.aac.p.m4a`

## Browser Compatibility

- Chrome/Edge (recommended)
- Safari
- Firefox
- Mobile browsers with camera support

## Development

The project uses:
- **Vite** for fast HMR and building
- **TypeScript** for type safety
- **Tailwind CSS** for utility-first styling
- **React Hooks** for state management

### Project Structure

```
src/
├── components/
│   ├── ScannerPage.tsx    # QR scanner interface
│   └── PlayerPage.tsx     # Audio player interface
├── App.tsx                # Main app component
├── main.tsx              # React entry point
└── index.css             # Global styles with Tailwind
```

## License

MIT
