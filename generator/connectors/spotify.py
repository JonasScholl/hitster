import spotipy

from generator.connectors.interfaces import Connector, Song, Source
from generator.logger import skip
from generator.utils import get_env_var


class SpotifyConnector(Connector):
    """Spotify API connector"""

    def __init__(self):
        self._USE_PREVIEW_URL = get_env_var("SPOTIFY_USE_PREVIEW_URL", "false").lower() == "true"
        self._client = spotipy.Spotify(
            auth_manager=spotipy.SpotifyClientCredentials(
                client_id=get_env_var("SPOTIFY_CLIENT_ID"),
                client_secret=get_env_var("SPOTIFY_CLIENT_SECRET"),
            )
        )

    def get_playlist_songs(self, playlist_id: str) -> list[Song]:
        """Get songs from a Spotify playlist"""

        songs: list[Song] = []
        results = self._client.playlist_tracks(playlist_id)

        while results:
            for item in results["items"]:
                track = item["track"]
                if track:
                    name = track.get("name", None)
                    if not name:
                        skip(f"Song {track.get('id', 'Unknown')}", "no name")
                        continue

                    artists = track.get("artists", [])
                    if not artists or len(artists) == 0:
                        skip(f"'{name}'", "no artist")
                        continue

                    year = self._resolve_year(track["album"]["release_date"])
                    if int(year) <= 0:
                        skip(f"'{name}'", "no release year")
                        continue

                    if self._USE_PREVIEW_URL:
                        url = track.get("preview_url", None)
                        if not url:
                            skip(f"'{name}'", "no preview URL")
                            continue
                    else:
                        url = track.get("external_urls", {}).get("spotify", None)
                        if not url:
                            skip(f"'{name}'", "no external URL")
                            continue

                    songs.append(
                        Song(
                            id=track["id"],
                            title=name,
                            artists=[artist.get("name", "Unknown") for artist in artists],
                            year=year,
                            url=url,
                            source=Source.SPOTIFY,
                        )
                    )

            results = self._client.next(results) if results["next"] else None

        return sorted(songs, key=lambda song: song.year)

    def _resolve_year(self, date: str) -> int:
        date_parts = date.split("-")[::-1]
        parts = [""] * (3 - len(date_parts)) + date_parts
        return int(parts[2])
