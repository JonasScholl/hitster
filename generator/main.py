import json
import logging
import os
import random
import shutil
from collections import Counter

import matplotlib.pyplot as plt
import qrcode
import qrcode.image.svg
import typst
from apple_music import AppleMusicConnector
from dotenv import load_dotenv
from interfaces import Connector
from matplotlib.backends.backend_pdf import PdfPages
from spotify import SpotifyConnector
from utils import get_env_var

logging.basicConfig(level=logging.INFO)
random.seed("hitster")
load_dotenv()


def generate_qr_codes(songs):
    if os.path.isdir("generated/qr-codes"):
        shutil.rmtree("generated/qr-codes")

    os.makedirs("generated/qr-codes")

    for song in songs:
        img = qrcode.make(
            song["preview_url"], image_factory=qrcode.image.svg.SvgPathImage
        )
        img.save(f"generated/qr-codes/{song['id']}.svg")


def generate_overview_pdf(songs, output_pdf):
    year_counts = Counter(int(song["year"]) for song in songs if "year" in song)

    min_year = min(year_counts.keys())
    max_year = max(year_counts.keys())
    all_years = list(range(min_year, max_year + 1))
    counts = [year_counts.get(year, 0) for year in all_years]

    plt.figure()
    plt.bar(all_years, counts, color="black")
    plt.ylabel("number of songs released")
    plt.xticks()

    with PdfPages(output_pdf) as pdf:
        pdf.savefig()
        plt.close()


def resolve_connector() -> Connector:
    provider = get_env_var("PROVIDER")
    if provider == "spotify":
        logging.info("Using Spotify connector")
        return SpotifyConnector()
    elif provider == "apple-music":
        logging.info("Using Apple Music connector")
        return AppleMusicConnector()
    else:
        raise ValueError(f"Invalid provider: {provider}")


def main():
    logging.info("Starting song retrieval")

    connector = resolve_connector()
    songs = connector.get_playlist_songs(get_env_var("PLAYLIST_ID"))

    os.makedirs("generated", exist_ok=True)

    logging.info("Writing songs to file")
    with open("generated/songs.json", "w", encoding="utf-8") as file:
        json.dump(songs, file, indent=4)

    logging.info("Generating QR codes")
    generate_qr_codes(songs)

    logging.info("Compiling Cards PDF")
    typst.compile(
        "generator/templates/hitster.typ",
        output="generated/hitster.pdf",
        root=".",
    )

    logging.info("Compiling Year Overview PDF")
    generate_overview_pdf(songs, "generated/overview.pdf")

    logging.info("Done")


if __name__ == "__main__":
    main()
