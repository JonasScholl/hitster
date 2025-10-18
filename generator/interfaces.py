from abc import ABC, abstractmethod


class Connector(ABC):
    @abstractmethod
    def get_playlist_songs(self, playlist_id: str) -> list[dict]:
        pass
