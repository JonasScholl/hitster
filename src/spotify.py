import logging

import spotipy

from interfaces import Connector
from utils import get_env_var


class SpotifyConnector(Connector):
    def __init__(self):
        self.client = spotipy.Spotify(
            auth_manager=spotipy.SpotifyClientCredentials(
                client_id=get_env_var("CLIENT_ID"),
                client_secret=get_env_var("CLIENT_SECRET"),
            )
        )

    def get_playlist_songs(self, playlist_id):
        songs = []
        results = self.client.playlist_tracks(playlist_id)

        while results:
            for item in results["items"]:
                track = item["track"]
                if track:
                    year = self._resolve_year(track["album"]["release_date"])
                    if int(year) <= 0:
                        logging.warning(
                            "Skipping song %s because it has no release year",
                            track["name"],
                        )
                        continue

                    songs.append(
                        {
                            "name": track["name"],
                            "artists": [artist["name"] for artist in track["artists"]],
                            "year": year,
                            "release_date": track["album"]["release_date"],
                            "url": track["external_urls"]["spotify"],
                            "preview_url": track["preview_url"],
                            "id": track["id"],
                        }
                    )

            results = self.client.next(results) if results["next"] else None

        return sorted(songs, key=lambda x: x["year"])

    def _resolve_year(self, date_str):
        date_parts = date_str.split("-")[::-1]
        parts = [""] * (3 - len(date_parts)) + date_parts
        return parts[2]
