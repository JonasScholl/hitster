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


def generate_overview_pdf(songs: list[Song], output_pdf: str) -> None:
    """Generate an overview PDF of the songs by year"""

    if not songs:
        item("No songs to analyze")
        return

    item("Analyzing song years...")
    year_counts = Counter(song.year for song in songs)

    min_year = min(year_counts.keys())
    max_year = max(year_counts.keys())
    all_years = list(range(min_year, max_year + 1))
    counts = [year_counts.get(year, 0) for year in all_years]

    item(f"Creating chart for years {min_year}-{max_year}...")
    plt.figure()
    plt.bar(all_years, counts, color="black")
    plt.ylabel("Songs per Year")
    plt.xticks()

    with PdfPages(output_pdf) as pdf:
        pdf.savefig()
        plt.close()
        plt.close()
