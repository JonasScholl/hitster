import { Html5Qrcode } from "html5-qrcode";
import React, { useEffect, useRef, useState } from "react";

interface ScannerPageProps {
  onAudioDetected: (url: string) => void;
}

const ScannerPage: React.FC<ScannerPageProps> = ({ onAudioDetected }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");
  const [showCameraHelp, setShowCameraHelp] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setShowCameraHelp(false);
      setScannerMessage("");

      // Check camera permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          stream.getTracks().forEach((track) => track.stop());
        } catch (permissionErr) {
          console.error("Camera permission denied:", permissionErr);
          showCameraPermissionError(permissionErr as Error);
          return;
        }
      } else {
        setScannerMessage("Camera not supported on this device/browser");
        setShowCameraHelp(true);
        return;
      }

      if (qrReaderRef.current) {
        scannerRef.current = new Html5Qrcode(qrReaderRef.current.id);

        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            console.error("Error scanning QR code:", errorMessage);
          }
        );

        setIsScanning(true);
        setScannerMessage("Scanner active - point camera at QR code");
      }
    } catch (err) {
      console.error("Error starting scanner:", err);
      showCameraPermissionError(err as Error);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
        setScannerMessage("Scanner stopped");
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const onScanSuccess = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);

    // Basic URL validation
    let isValidUrl = false;
    try {
      new URL(decodedText);
      isValidUrl = true;
    } catch {
      // Not a valid URL
    }

    if (!isValidUrl) {
      setScannerMessage(
        `Scanned: ${decodedText}\nThis doesn't appear to be a valid URL.`
      );
      return;
    }

    // Check if it's an iTunes audio preview URL
    if (
      decodedText.includes("itunes-assets/AudioPreview") ||
      decodedText.includes(".aac.p.m4a") ||
      (isValidUrl && new URL(decodedText).host === "audio-ssl.itunes.apple.com")
    ) {
      setScannerMessage("iTunes audio URL detected! Validating...");
      loadAudio(decodedText);
    } else if (decodedText.includes("http")) {
      setScannerMessage("URL detected. Checking if it's an audio file...");
      loadAudio(decodedText);
    } else {
      setScannerMessage(
        `Scanned: ${decodedText}\nThis doesn't appear to be an audio URL.`
      );
    }
  };

  const loadAudio = async (url: string) => {
    try {
      await stopScanner();
      setScannerMessage("Validating audio URL...");

      const isValidAudio = await validateAudioUrl(url);
      if (!isValidAudio) {
        setScannerMessage(
          "Invalid or inaccessible audio URL. Please try a different QR code."
        );
        setTimeout(() => {
          setScannerMessage("");
        }, 3000);
        return;
      }

      onAudioDetected(url);
    } catch (err) {
      console.error("Error loading audio:", err);
      setScannerMessage("Error loading audio file. Please try again.");
      setTimeout(() => {
        setScannerMessage("");
      }, 3000);
    }
  };

  const validateAudioUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const testAudio = new Audio();
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, 5000);

      testAudio.addEventListener("canplay", () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(true);
        }
      });

      testAudio.addEventListener("error", () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(false);
        }
      });

      testAudio.addEventListener("loadeddata", () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(true);
        }
      });

      testAudio.src = url;
      testAudio.load();
    });
  };

  const showCameraPermissionError = (error: Error) => {
    let errorMessage = "Camera access denied. ";

    if (error.name === "NotAllowedError") {
      errorMessage += "Please allow camera access and refresh the page.";
    } else if (error.name === "NotFoundError") {
      errorMessage += "No camera found on this device.";
    } else if (error.name === "NotSupportedError") {
      errorMessage += "Camera not supported on this browser.";
    } else {
      errorMessage += "Please check camera permissions.";
    }

    setScannerMessage(errorMessage);
    setShowCameraHelp(true);
  };

  const loadManualUrl = () => {
    const url = manualUrl.trim();
    if (!url) {
      setScannerMessage("Please enter a URL");
      return;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      setScannerMessage("Please enter a valid URL");
      return;
    }

    if (parsedUrl.protocol !== "https:") {
      setScannerMessage("Only HTTPS URLs are permitted.");
      return;
    }

    const allowedHosts = [
      "audio-ssl.itunes.apple.com",
      "itunes.apple.com",
      "itunes-assets.apple.com",
    ];
    const isAllowedHost = allowedHosts.some((h) => parsedUrl.host.endsWith(h));

    const audioPreviewPathAllowed =
      parsedUrl.pathname.includes("itunes-assets/AudioPreview") ||
      parsedUrl.pathname.endsWith(".aac.p.m4a");

    if (audioPreviewPathAllowed && isAllowedHost) {
      setScannerMessage("Loading audio from URL...");
      loadAudio(url);
    } else {
      setScannerMessage("Only Apple Music audio preview URLs are permitted.");
      return;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      loadManualUrl();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Hitster QR Scanner
        </h1>
        <p className="text-gray-300 text-lg">Scan a QR code to play music</p>
      </div>

      <div className="scanner-container">
        <div
          id="qr-reader"
          ref={qrReaderRef}
          className="bg-gray-800 rounded-xl shadow-2xl"
        ></div>
        <div className="mt-4 text-center text-gray-300 whitespace-pre-line">
          {scannerMessage}
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={startScanner}
          disabled={isScanning}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg cursor-pointer"
        >
          Start Scanner
        </button>
      </div>

      {/* Scanner Info Box */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-gray-800/80 backdrop-blur-sm border border-gray-600/30 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <div className="shrink-0">
            <svg
              className="w-4 h-4 text-gray-400 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <div className="text-xs text-gray-400">
            <p>
              This scanner is for{" "}
              <span className="text-gray-300">Apple Music</span> QR codes. For
              Spotify cards, use your regular camera or QR scanner app.
            </p>
          </div>
        </div>
      </div>

      {/* Camera Permission Help */}
      {showCameraHelp && (
        <div className="mt-8 max-w-lg mx-auto bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-400">
            Camera Access Required
          </h3>
          <div className="text-sm text-gray-300 space-y-3">
            <p>
              To scan QR codes, this app needs access to your camera. Here's how
              to enable it:
            </p>
            <div className="bg-gray-700 rounded p-3">
              <p className="font-semibold text-white mb-2">For Chrome/Edge:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Click the camera icon in the address bar</li>
                <li>Select "Allow" for camera access</li>
                <li>Refresh the page and try again</li>
              </ul>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="font-semibold text-white mb-2">For Safari:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Go to Safari → Settings → Websites → Camera</li>
                <li>Set this website to "Allow"</li>
                <li>Refresh the page and try again</li>
              </ul>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="font-semibold text-white mb-2">Alternative:</p>
              <p className="text-xs">
                You can also manually enter the card audio URL below:
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste card audio URL here..."
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded text-xs"
                />
                <button
                  onClick={loadManualUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs text-nowrap"
                >
                  Load Audio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;
