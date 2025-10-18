import os
import shutil
from collections import Counter

import matplotlib.pyplot as plt
import qrcode
import qrcode.image.svg
import typst
from matplotlib.backends.backend_pdf import PdfPages

from generator.connectors import Song
from generator.logger import item


def generate_qr_codes(songs: list[Song]) -> None:
    """Generate QR codes for the songs and save them to the generated/qr-codes directory"""

    if os.path.isdir("generated/qr-codes"):
        shutil.rmtree("generated/qr-codes")

    os.makedirs("generated/qr-codes")

    for i, song in enumerate(songs, 1):
        if i % 20 == 0 or i == len(songs):
            item(f"Generated {i}/{len(songs)} QR codes")
        image = qrcode.make(song.url, image_factory=qrcode.image.svg.SvgPathImage)
        image.save(f"generated/qr-codes/{song.id}.svg")


def generate_cards_pdf(output_pdf: str) -> None:
    """Generate a PDF of the cards"""

    item("Compiling Typst template...")
    typst.compile_with_warnings(
        "generator/templates/hitster.typ",
        output=output_pdf,
        root=".",
    )


def generate_overview_pdf(songs: list[Song], output_pdf: str) -> None:
    """Generate an overview PDF of the songs by year"""

    item("Analyzing song years...")
    year_counts = Counter(song.year for song in songs)

    min_year = min(year_counts.keys())
    max_year = max(year_counts.keys())
    all_years = list(range(min_year, max_year + 1))
    counts = [year_counts.get(year, 0) for year in all_years]

    item(f"Creating chart for years {min_year}-{max_year}...")
    plt.figure()
    plt.bar(all_years, counts, color="black")
    plt.ylabel("number of songs released")
    plt.xticks()

    with PdfPages(output_pdf) as pdf:
        pdf.savefig()
        plt.close()
        plt.close()
