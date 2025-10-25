from collections import Counter

import matplotlib.pyplot as plt
import typst
from matplotlib.backends.backend_pdf import PdfPages

from generator.connectors import Song
from generator.logger import item
from generator.utils import get_env_var


def generate_cards_pdf(output_pdf: str) -> None:
    """Generate a PDF of the cards"""

    theme = get_env_var("THEME", "black-white")

    item(f"Compiling Typst theme [highlight]{theme}[/highlight]...")
    typst.compile_with_warnings(
        f"generator/themes/{theme}.typ",
        output=output_pdf,
        root=".",
    )


def generate_year_distribution(songs: list[Song], output_pdf: str, output_png: str) -> None:
    """Generate both PDF and CLI PNG versions of the year distribution chart"""

    if not songs:
        item("No songs to analyze")
        return

    year_counts = Counter(song.year for song in songs)

    min_year = min(year_counts.keys())
    max_year = max(year_counts.keys())
    all_years = list(range(min_year, max_year + 1))
    counts = [year_counts.get(year, 0) for year in all_years]

    item(f"{len(songs)} songs from {min_year} to {max_year}")

    # Generate PDF version with labels
    item("Creating PDF chart...")
    plt.figure()
    plt.bar(all_years, counts, color="black")
    plt.ylabel("Songs per Year")
    plt.xticks()

    with PdfPages(output_pdf) as pdf:
        pdf.savefig()
        plt.close()

    # Generate CLI PNG version (inverted, no labels)
    item("Creating CLI chart...")
    _, ax = plt.subplots(figsize=(12, 6))
    ax.bar(all_years, counts, color="#1F456E")  # Dark blue for visibility on both light and dark backgrounds
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_facecolor("none")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["bottom"].set_visible(False)
    ax.spines["left"].set_visible(False)

    # Remove all padding and margins
    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
    plt.margins(0, 0)
    ax.set_xlim(ax.get_xlim())
    ax.set_ylim(ax.get_ylim())

    plt.savefig(output_png, dpi=300, bbox_inches="tight", pad_inches=0, facecolor="none", transparent=True)
    plt.close()
