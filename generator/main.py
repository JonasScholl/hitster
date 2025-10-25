import json
import random
import shutil
from pathlib import Path

import term_image.image
from dotenv import load_dotenv

from generator.connectors import resolve_connector
from generator.logger import HitsterLogger, header, section, step, success
from generator.render import generate_cards_pdf, generate_qr_codes, generate_year_distribution
from generator.render.images import generate_decoration_images
from generator.themes import Theme
from generator.utils import get_env_var


def main() -> None:
    """Main function to generate the cards and overview PDF"""

    random.seed("hitster")
    load_dotenv()

    theme = Theme(get_env_var("THEME", Theme.BLACK_WHITE))

    header("🎵 Hitster Card Generator")

    section("Retrieving Songs")
    step("Connecting to music service...")
    connector = resolve_connector()

    step("Fetching playlist songs...")
    songs = connector.get_playlist_songs(get_env_var("PLAYLIST_ID"))
    success(f"Retrieved {len(songs)} songs")

    if Path("generated").is_dir():
        shutil.rmtree("generated")
    Path("generated").mkdir(parents=True, exist_ok=True)

    section("Processing Data")
    if Path("overrides.json").exists():
        step("Applying overrides from overrides.json...")
        with Path("overrides.json").open("r", encoding="utf-8") as file:
            overrides = json.load(file)
            override_map = {override["id"]: override for override in overrides}
            for i, song in enumerate(songs):
                if song.id in override_map:
                    override_data = override_map[song.id]
                    override_data = {k: v for k, v in override_data.items() if k != "id"}
                    songs[i] = song.model_copy(update=override_data)
        success("Overrides applied")

    step("Sorting songs by year...")
    songs.sort(key=lambda song: song.year)
    success("Songs sorted by year")

    step("Writing songs to JSON file...")
    with Path("generated/songs.json").open("w", encoding="utf-8") as file:
        json.dump([song.model_dump() for song in songs], file, indent=4, ensure_ascii=False)
    success("Songs data saved to generated/songs.json")

    section("Generating Assets")

    step("Generating decoration images...")
    generate_decoration_images(theme)
    success("Decoration images generated")

    step("Creating QR codes...")
    generate_qr_codes(theme, songs)
    success("QR codes generated")

    step("Building cards PDF...")
    generate_cards_pdf("generated/hitster.pdf")
    success("Cards PDF created")

    step("Creating year distribution charts...")
    generate_year_distribution(songs, "generated/year-distribution.pdf", "generated/year-distribution.png")
    success("Year distribution charts created")

    section("Song Year Distribution")
    analysis_file = term_image.image.from_file("generated/year-distribution.png", width=HitsterLogger.HEADER_LENGTH)
    analysis_file.draw(h_align="left", pad_height=analysis_file.height)
    Path("generated/year-distribution.png").unlink()

    header("🚀 Generation Complete!")


if __name__ == "__main__":
    main()
