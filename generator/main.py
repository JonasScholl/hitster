import json
import os
import random

from dotenv import load_dotenv

from generator.connectors import resolve_connector
from generator.generate import (
    generate_cards_pdf,
    generate_overview_pdf,
    generate_qr_codes,
)
from generator.logger import header, section, step, success
from generator.utils import get_mandatory_env_var

random.seed("hitster")
load_dotenv()


def main() -> None:
    """Main function to generate the cards and overview PDF"""

    header("🎵 Hitster Card Generator")

    section("Retrieving Songs")
    step("Connecting to music service...")
    connector = resolve_connector()

    step("Fetching playlist songs...")
    songs = connector.get_playlist_songs(get_mandatory_env_var("PLAYLIST_ID"))
    success(f"Retrieved {len(songs)} songs")

    os.makedirs("generated", exist_ok=True)

    section("Processing Data")
    step("Writing songs to JSON file...")
    with open("generated/songs.json", "w", encoding="utf-8") as file:
        json.dump([song.model_dump() for song in songs], file, indent=4)
    success("Songs data saved")

    section("Generating Assets")
    step("Creating QR codes...")
    generate_qr_codes(songs)
    success("QR codes generated")

    step("Building cards PDF...")
    generate_cards_pdf("generated/hitster.pdf")
    success("Cards PDF created")

    step("Creating year overview PDF...")
    generate_overview_pdf(songs, "generated/overview.pdf")
    success("Overview PDF created")

    header("🎉 Generation Complete!")


if __name__ == "__main__":
    main()
