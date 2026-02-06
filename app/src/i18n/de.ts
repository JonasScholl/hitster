const de = {
  scanner: {
    title: "Hitster",
    subtitle: "QR-Scanner",
    tagline: "Scanne einen QR-Code, um Musik abzuspielen",
    start: "Start",
    showYear: "Jahr anzeigen",
    showTitleArtist: "Titel & Interpret anzeigen",
    info: "Dieser Scanner ist für <appleMusicText>Apple Music</appleMusicText> QR-Codes. Für Spotify-Karten verwende deine normale Kamera oder QR-Scanner-App.",
  },
  player: {
    nowPlaying: "Aktuelle Wiedergabe",
    closePlayer: "Player schließen",
    seekPosition: "Wiedergabeposition ändern",
  },
  camera: {
    accessRequired: "Kamerazugriff erforderlich",
    enableInstructions:
      "Um QR-Codes zu scannen, benötigt diese App Zugriff auf deine Kamera. So aktivierst du ihn:",
    chromeEdge: "Für Chrome/Edge:",
    chromeStep1: "Klicke auf das Kamera-Symbol in der Adressleiste",
    chromeStep2: 'Wähle "Erlauben" für den Kamerazugriff',
    chromeStep3: "Lade die Seite neu und versuche es erneut",
    safari: "Für Safari:",
    iOS: "Für iOS:",
    safariStep1: "Gehe zu Safari → Einstellungen → Websites → Kamera",
    safariStep2: 'Stelle diese Website auf "Erlauben"',
    safariStep3: "Lade die Seite neu und versuche es erneut",
    iOSStep1: "Öffne die Einstellungen-App",
    iOSStep2: "Scrolle nach unten, um diese App zu finden",
    iOSStep3: "Aktiviere den Kamerazugriff",
    android: "Für Android:",
    androidStep1: "Öffne Einstellungen → Apps",
    androidStep2: "Finde und wähle diese App",
    androidStep3: "Tippe auf Berechtigungen → Kamera → Erlauben",
    alternative: "Alternative:",
    manualEntryHint:
      "Du kannst auch die Audio-URL der Karte manuell eingeben:",
    manualUrlPlaceholder: "Audio-URL hier einfügen...",
    loadAudio: "Audio laden",
    closeScanner: "Scanner schließen",
  },
  messages: {
    cameraNotSupported: "Kamera wird auf diesem Gerät/Browser nicht unterstützt",
    cameraPermissionDenied:
      "Kamerazugriff verweigert. Bitte aktiviere den Kamerazugriff in den Geräteeinstellungen.",
    invalidUrl: "Dies scheint keine gültige URL zu sein.",
    invalidAudioUrl: "Dies scheint keine Audio-URL zu sein.",
    appleMusicDetected: "Apple Music Short-URL erkannt! Wird überprüft...",
    urlDetected: "URL erkannt. Wird überprüft, ob es eine Audiodatei ist...",
    validating: "Audio-URL wird überprüft...",
    invalidAudio:
      "Ungültige oder nicht erreichbare Audio-URL. Bitte versuche einen anderen QR-Code.",
    errorLoading: "Fehler beim Laden der Audiodatei. Bitte versuche es erneut.",
    enterUrl: "Bitte gib eine URL ein",
    invalidUrlFormat: "Bitte gib eine gültige URL ein",
    httpsOnly: "Es sind nur HTTPS-URLs erlaubt.",
    appleMusicOnly:
      "Es sind nur Apple Music Audio-Vorschau-URLs erlaubt.",
    loadingFromUrl: "Audio wird von URL geladen...",
    scannedInvalidUrl: "Gescannt: {{data}}\nDies scheint keine gültige URL zu sein.",
    scannedInvalidAudioUrl: "Gescannt: {{data}}\nDies scheint keine Audio-URL zu sein.",
  },
  notFound: {
    title: "Nicht gefunden",
    message: "Seite nicht gefunden",
  },
} as const;

export default de;
