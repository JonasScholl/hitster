import time
from pathlib import Path

import jwt
import requests

from generator.connectors.interfaces import Connector, Song, Source
from generator.logger import error, skip
from generator.utils import get_env_var


class AppleMusicConnector(Connector):
    """Apple Music API connector"""

    _BASE_URL = "https://api.music.apple.com"

    def __init__(self):
        self._TEAM_ID = get_env_var("APPLE_TEAM_ID")
        self._KEY_ID = get_env_var("APPLE_KEY_ID")
        self._PRIVATE_KEY_PATH = get_env_var("APPLE_PRIVATE_KEY_PATH")

        self._token = self._generate_token()

    def get_playlist_songs(self, playlist_id: str) -> list[Song]:
        """Get songs from an Apple Music playlist"""

        songs: list[Song] = []

        endpoint = f"/v1/catalog/us/playlists/{playlist_id}/tracks"
        params = {
            "limit": 100,
            "include": "albums",
        }

        while True:
            try:
                data = self._make_request(endpoint, params)

                for item in data.get("data", []):
                    if item["type"] == "songs":
                        track = item["attributes"]

                        name = track.get("name", None)
                        if not name:
                            skip(f"Song {track.get('id', 'Unknown')}", "no name")
                            continue

                        artists = track.get("artistName", None)
                        if not artists:
                            skip(f"'{name}'", "no artist")
                            continue

                        year = self._resolve_year(track.get("releaseDate", ""))
                        if int(year) <= 0:
                            skip(f"'{name}'", "no release year")
                            continue

                        preview_url = track.get("previews", [{}])[0].get("url") if track.get("previews") else None
                        if not preview_url:
                            skip(f"'{name}'", "no preview URL")
                            continue

                        songs.append(
                            Song(
                                id=item["id"],
                                title=name,
                                artists=[artists],
                                year=year,
                                url=preview_url,
                                source=Source.APPLE_MUSIC,
                            )
                        )

                # Check for next page
                if data.get("next"):
                    endpoint = data["next"].replace(self._BASE_URL, "")
                    params = None  # Next URL already contains params
                else:
                    break

            except requests.exceptions.RequestException as e:
                error(f"Error fetching Apple Music playlist: {e}")
                break

        return sorted(songs, key=lambda song: song.year)

    def _resolve_year(self, date: str) -> int:
        """Extract year from Apple Music date string (YYYY-MM-DD format)"""
        if not date:
            return 0

        try:
            return int(date.split("-")[0])
        except (IndexError, ValueError):
            return 0

    def _generate_token(self) -> str:
        """Generate JWT token for Apple Music API authentication"""
        with Path(self._PRIVATE_KEY_PATH).open("r", encoding="utf-8") as key_file:
            private_key = key_file.read()

        headers = {"alg": "ES256", "kid": self._KEY_ID}

        payload = {
            "iss": self._TEAM_ID,
            "iat": int(time.time()),
            "exp": int(time.time()) + 600,  # 10 minutes
        }

        token = jwt.encode(payload, private_key, algorithm="ES256", headers=headers)
        return token

    def _make_request(self, endpoint: str, params: dict | None = None) -> dict:
        """Make authenticated request to Apple Music API"""
        headers = {
            "Authorization": f"Bearer {self._token}",
        }

        # Add user token if available (for personal playlists)
        try:
            user_token = get_env_var("APPLE_MUSIC_USER_TOKEN")
            headers["Music-User-Token"] = user_token
        except OSError:
            # User token is optional for public playlists
            pass

        response = requests.get(f"{self._BASE_URL}{endpoint}", headers=headers, params=params, timeout=30)
        response.raise_for_status()
        return response.json()
