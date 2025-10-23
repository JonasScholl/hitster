from collections.abc import Iterator
from enum import StrEnum
from pathlib import Path


class Theme(StrEnum):
    BLACK_WHITE = "black-white"
    COLORED = "colored"
    HALLOWEEN = "halloween"


def get_rgb_colors(theme: Theme) -> list[tuple[int, int, int]]:
    """Get the RGB colors of the palette for the given theme"""

    match theme:
        case Theme.COLORED:
            return [
                (214, 40, 40),  # #d62828 - red
                (247, 127, 0),  # #f77f00 - orange
                (255, 183, 3),  # #ffb703 - yellow
                (42, 157, 143),  # #2a9d8f - teal
                (157, 78, 221),  # #9d4edd - purple
            ]
        case Theme.HALLOWEEN:
            return [
                (38, 42, 32),  # #262A20
                (67, 40, 26),  # #43281A
                (63, 92, 93),  # #3F5C5D
                (182, 87, 24),  # #B65718
                (159, 188, 191),  # #9FBCBF
            ]
        case _:
            return [(255, 255, 255)]


def get_image_paths(theme: Theme, purpose: str = "qr") -> list[Path]:
    """Get the paths of QR code images for the given theme"""

    images_dir = Path("generator/themes/images")
    if not images_dir.exists():
        raise FileNotFoundError(f"Images directory {images_dir} not found")

    if theme == Theme.HALLOWEEN:
        if purpose == "qr":
            return sorted(images_dir.glob("pumpkin_*.svg"))
        return sorted(images_dir.glob("bat_*.svg")) + sorted(images_dir.glob("tombstone_*.svg"))

    return []


def card_background_color_generator(theme: Theme) -> Iterator[tuple[int, int, int]]:
    background_colors = get_rgb_colors(theme)

    index = 0
    while True:
        yield background_colors[index % len(background_colors)]
        index += 1
