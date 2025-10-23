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
