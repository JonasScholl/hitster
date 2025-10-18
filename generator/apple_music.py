import logging
import time

import jwt
import requests

from interfaces import Connector
from utils import get_env_var


class AppleMusicConnector(Connector):
    def __init__(self):
        self.team_id = get_env_var("APPLE_TEAM_ID")
        self.key_id = get_env_var("APPLE_KEY_ID")
        self.private_key_path = get_env_var("APPLE_PRIVATE_KEY_PATH")
        self.base_url = "https://api.music.apple.com"
        self.token = self._generate_token()

    def get_playlist_songs(self, playlist_id):
        """Get songs from an Apple Music playlist"""
        songs = []

        # Get playlist tracks
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

                        # Extract year from release date
                        year = self._resolve_year(track.get("releaseDate", ""))
                        if int(year) <= 0:
                            logging.warning(
                                "Skipping song %s because it has no release year",
                                track.get("name", "Unknown"),
                            )
                            continue

                        # Get preview URL (if available)
                        preview_url = (
                            track.get("previews", [{}])[0].get("url")
                            if track.get("previews")
                            else None
                        )

                        if not preview_url:
                            logging.warning(
                                "Skipping song %s because it has no preview URL",
                                track.get("name", "Unknown"),
                            )
                            continue

                        songs.append(
                            {
                                "name": track.get("name", ""),
                                "artists": [track.get("artistName", "")],
                                "year": year,
                                "release_date": track.get("releaseDate", ""),
                                "url": track.get("url", ""),  # Apple Music URL
                                "preview_url": preview_url,
                                "id": item["id"],
                            }
                        )

                # Check for next page
                if "next" in data and data["next"]:
                    endpoint = data["next"].replace(self.base_url, "")
                    params = None  # Next URL already contains params
                else:
                    break

            except requests.exceptions.RequestException as e:
                logging.error("Error fetching Apple Music playlist: %s", e)
                break

        return sorted(songs, key=lambda x: x["year"])

    def _resolve_year(self, date_str):
        """Extract year from Apple Music date string (YYYY-MM-DD format)"""
        if not date_str:
            return ""

        try:
            return date_str.split("-")[0]
        except (IndexError, ValueError):
            return ""

    def _generate_token(self):
        """Generate JWT token for Apple Music API authentication"""
        with open(self.private_key_path, "r", encoding="utf-8") as key_file:
            private_key = key_file.read()

        headers = {"alg": "ES256", "kid": self.key_id}

        payload = {
            "iss": self.team_id,
            "iat": int(time.time()),
            "exp": int(time.time()) + 600,  # 10 minutes
        }

        token = jwt.encode(payload, private_key, algorithm="ES256", headers=headers)
        return token

    def _make_request(self, endpoint, params=None):
        """Make authenticated request to Apple Music API"""
        headers = {
            "Authorization": f"Bearer {self.token}",
        }

        # Add user token if available (for personal playlists)
        try:
            user_token = get_env_var("APPLE_MUSIC_USER_TOKEN")
            headers["Music-User-Token"] = user_token
        except EnvironmentError:
            # User token is optional for public playlists
            pass

        response = requests.get(
            f"{self.base_url}{endpoint}", headers=headers, params=params, timeout=30
        )
        response.raise_for_status()
        return response.json()
