from collections.abc import Iterator
from enum import StrEnum
from pathlib import Path
from typing import Optional


class Theme(StrEnum):
    BLACK_WHITE = "black-white"
    COLORED = "colored"
    HALLOWEEN = "halloween"


def get_card_colors(theme: Theme) -> list[tuple[int, int, int]]:
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
                (87, 73, 100),  # #574964
                (140, 16, 7),  # #8C1007
            ]
        case _:
            return [(255, 255, 255)]


def get_qr_image_color(theme: Theme) -> tuple[int, int, int] | None:
    match theme:
        case Theme.HALLOWEEN:
            return (255, 126, 36)
        case _:
            return None


def get_qr_background_color(theme: Theme) -> tuple[int, int, int]:
    match theme:
        case Theme.BLACK_WHITE:
            return (255, 255, 255)
        case _:
            return (1, 0, 0)


def get_qr_fill_color(theme: Theme) -> tuple[int, int, int]:
    match theme:
        case Theme.BLACK_WHITE:
            return (0, 0, 0)
        case _:
            return (255, 255, 255)


def get_image_paths(theme: Theme, purpose: str = "qr") -> list[Path]:
    """Get the paths of QR code images for the given theme"""

    images_dir = Path("generator/themes/images")
    if not images_dir.exists():
        raise FileNotFoundError(f"Images directory {images_dir} not found")

    if theme == Theme.HALLOWEEN:
        if purpose == "qr":
            return sorted(images_dir.glob("pumpkin_*.svg"))
        return (
            sorted(images_dir.glob("bat_*.svg"))
            + sorted(images_dir.glob("tombstone_*.svg"))
            + sorted(images_dir.glob("ghost_*.svg"))
        )

    return []
