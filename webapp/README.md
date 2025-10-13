# Hitster QR Scanner Web App

A simple web application for scanning QR codes and playing iTunes audio previews.

## Features

- 📱 QR Code scanner using device camera
- 🎵 Audio player with play/pause, progress bar, and volume control
- 🎨 Modern UI with TailwindCSS
- 📱 Mobile-friendly responsive design

## Setup

### Prerequisites

- Node.js (v16 or higher)
- pnpm

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build CSS (first time):
   ```bash
   pnpm build
   ```

### Development

Start the development server with hot-reload CSS compilation:

```bash
pnpm dev
```

This will:
- Start TailwindCSS in watch mode (creates `dist/output.css` locally)
- Launch a live-reload server on http://localhost:3000

**Note:** The `dist/` folder is created locally for development but excluded from Git.

### Production Build

Build optimized CSS for production:

```bash
pnpm build
```

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin master
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically trigger on push to master/main

3. **Access Your Site:**
   - After deployment, your site will be available at:
   - `https://[username].github.io/[repository-name]/webapp/`

### Automatic Deployment:

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
- ✅ Install Node.js and pnpm
- ✅ Install dependencies
- ✅ Build TailwindCSS (creates `dist/output.css`)
- ✅ Deploy to GitHub Pages

**Note:** The `dist/` folder is excluded from Git (via `.gitignore`) since GitHub Actions builds it automatically on each deployment.

### Manual Deployment:

If you need to trigger deployment manually:
- Go to Actions tab in your GitHub repository
- Select "Deploy to GitHub Pages" workflow
- Click "Run workflow"

## Usage

1. Open the application in a web browser
2. Allow camera access when prompted
3. Click "Start Scanner" to activate QR code scanning
4. Scan a QR code containing an iTunes audio preview URL
5. The audio player will load automatically
6. Use the controls to play/pause, seek, and adjust volume
7. Click the X button to return to the scanner
