import re
from abc import ABC, abstractmethod
from enum import StrEnum

from pydantic import BaseModel

from generator.utils import get_env_var


class Source(StrEnum):
    SPOTIFY = "spotify"
    APPLE_MUSIC = "apple-music"


class Song(BaseModel):
    id: str
    title: str
    artists: list[str]
    year: int
    url: str
    source: Source

    @property
    def qr_code_value(self) -> str:
        if self.source == Source.APPLE_MUSIC:
            webapp_base_url = get_env_var("WEBAPP_BASE_URL", "https://hitster.scholl.tech")
            return f"{webapp_base_url}/qr/am/{self.id}"
        return self.url


class Connector(ABC):
    @abstractmethod
    def get_playlist_songs(self, playlist_id: str) -> list[Song]:
        pass

    def sanitize_song_title(self, title: str) -> str:
        """Remove common song title suffixes like (Remastered), [Radio Edit], etc."""

        # Common suffixes to remove (case insensitive)
        suffixes_to_remove = [
            r"\(.*?remaster.*?\)",
            r"\[.*?remaster.*?\]",
            r"\(radio edit\)",
            r"\[radio edit\]",
            r"\(single version\)",
            r"\[single version\]",
            r"\(album version\)",
            r"\[album version\]",
            r"\(extended version\)",
            r"\[extended version\]",
            r"\(clean version\)",
            r"\[clean version\]",
            r"\(explicit\)",
            r"\[explicit\]",
            r"\(feat\. .*?\)",
            r"\[feat\. .*?\]",
            r"\(featuring .*?\)",
            r"\[featuring .*?\]",
            r"\(ft\. .*?\)",
            r"\[ft\. .*?\]",
            r"\(with .*?\)",
            r"\[with .*?\]",
            r"\(full version\)",
            r"\[full version\]",
        ]

        sanitized = title.strip()

        for pattern in suffixes_to_remove:
            sanitized = re.sub(pattern, "", sanitized, flags=re.IGNORECASE)

        return re.sub(r"\s+", " ", sanitized).strip()

    def add_featuring_artists(self, title: str, artists: list[str]) -> list[str]:
        """Add featuring artists to the song name"""

        patterns = [
            r"\(feat\. (.+?)\)",
            r"\[feat\. (.+?)\]",
            r"\(featuring (.+?)\)",
            r"\[featuring (.+?)\]",
        ]

        featuring_artist: str | None = None

        for pattern in patterns:
            match = re.search(pattern, title, re.IGNORECASE)
            if match:
                featuring_artist = match.group(1).strip()
                break

        if featuring_artist and featuring_artist.lower() not in [artist.lower() for artist in artists]:
            return [*artists, featuring_artist]

        return artists
