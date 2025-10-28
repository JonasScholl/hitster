import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { Route, useParams, useRouteMatch } from "react-router-dom";
import AudioPlayer from "../components/player/AudioPlayer";
import PlayerHeader from "../components/player/PlayerHeader";
import QRCodeReader from "../components/scanner/QRCodeReader";
import ScannerMessage from "../components/scanner/ScannerMessage";
import { useAppContext } from "../contexts";
import { getAppleMusicPreviewUrlBySongId } from "../utils/appleMusic";

const ScannerPage: React.FC = () => {
  const { scanner, qrReaderRef, startScanner, stopScanner } = useAppContext();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="background">
          <IonTitle className="ion-text-center ion-font-bold">
            Hitster QR Scanner
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div
          className="ion-padding ion-flex ion-flex-column ion-align-items-center ion-justify-content-center"
          style={{ minHeight: "100%", width: "100%" }}
        >
          {!scanner.isScanning && (
            <IonButton
              onClick={startScanner}
              shape="round"
              size="large"
              style={{
                width: "128px",
                height: "128px",
                fontSize: "24px",
              }}
            >
              Start
            </IonButton>
          )}
          <QRCodeReader
            qrReaderRef={qrReaderRef}
            isScanning={scanner.isScanning}
            onStop={stopScanner}
          />
          <ScannerMessage message={scanner.message} />
        </div>
      </IonContent>
    </IonPage>
  );
};

const PlayerPageContent: React.FC = () => {
  const { player, audioRef, togglePlayPause, seekTo, goToScanner, audioData } =
    useAppContext();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Now Playing</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div
          className="ion-flex ion-flex-column"
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            height: "100%",
            gap: "24px",
          }}
        >
          <PlayerHeader onClose={() => goToScanner(true)} />

          {audioData ? (
            <AudioPlayer
              isPlaying={player.isPlaying}
              currentTime={player.currentTime}
              duration={player.duration}
              onTogglePlayPause={togglePlayPause}
              onSeek={seekTo}
            />
          ) : (
            <div className="ion-flex-1 ion-flex ion-justify-content-center ion-align-items-center">
              <p style={{ color: "#9CA3AF" }}>No audio loaded</p>
            </div>
          )}

          {/* Hidden audio element */}
          <audio ref={audioRef} preload="metadata" />
        </div>
      </IonContent>
    </IonPage>
  );
};

const SongPlayerPage: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const { goToPlayer, goToScanner } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSong = async () => {
      try {
        setLoading(true);
        setError(null);
        const previewUrl = await getAppleMusicPreviewUrlBySongId(songId);
        goToPlayer(previewUrl);
      } catch (err) {
        console.error("Error loading song:", err);
        setError("Failed to load song. Please try again.");
        setTimeout(() => goToScanner(false), 3000);
      } finally {
        setLoading(false);
      }
    };

    if (songId) {
      loadSong();
    }
  }, [songId, goToPlayer, goToScanner]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <div
            className="ion-flex ion-flex-column ion-align-items-center ion-justify-content-center"
            style={{ height: "100%", gap: "16px" }}
          >
            <IonSpinner name="crescent" />
            <p style={{ color: "#9CA3AF" }}>Loading song...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Error</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <div
            className="ion-flex ion-flex-column ion-align-items-center ion-justify-content-center"
            style={{ height: "100%", gap: "16px" }}
          >
            <p style={{ color: "#F87171" }}>{error}</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return <PlayerPageContent />;
};

const PlayPage: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <>
      <Route exact path={path}>
        <ScannerPage />
      </Route>
      <Route exact path={`${path}/player`}>
        <PlayerPageContent />
      </Route>
      <Route path={`${path}/:songId`}>
        <SongPlayerPage />
      </Route>
    </>
  );
};

export default PlayPage;
