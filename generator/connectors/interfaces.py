from abc import ABC, abstractmethod

from pydantic import BaseModel


class Song(BaseModel):
    id: str
    title: str
    artists: list[str]
    year: int
    url: str


class Connector(ABC):
    @abstractmethod
    def get_playlist_songs(self, playlist_id: str) -> list[Song]:
        pass
