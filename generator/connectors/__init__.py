from generator.connectors.apple_music import AppleMusicConnector
from generator.connectors.interfaces import Connector, Song
from generator.connectors.spotify import SpotifyConnector
from generator.logger import info
from generator.utils import get_env_var


def resolve_connector() -> Connector:
    """Resolve the connector based on the provider environment variable"""

    provider = get_env_var("PROVIDER")
    match provider:
        case "spotify":
            info("Using [highlight]Spotify[/highlight] connector")
            return SpotifyConnector()
        case "apple-music":
            info("Using [highlight]Apple Music[/highlight] connector")
            return AppleMusicConnector()
        case _:
            raise ValueError(f"Invalid provider: {provider}")


__all__ = ["Connector", "Song", "resolve_connector"]
