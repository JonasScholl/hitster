from enum import StrEnum
from pathlib import Path


class Theme(StrEnum):
    BLACK_WHITE = "black-white"
    COLORED = "colored"
    HALLOWEEN = "halloween"
    SUMMER_BREEZE = "summer-breeze"
    WEDDING = "wedding"


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
                (55, 79, 47),  # #374f2f
                (67, 40, 26),  # #43281A
                (63, 92, 93),  # #3F5C5D
                (230, 126, 36),  # #FF7E24
                (87, 73, 100),  # #574964
                (181, 20, 9),  # #b51409
            ]
        case Theme.SUMMER_BREEZE:
            return [
                (218, 128, 76),  # #DA804C
                (250, 250, 250),  # #FAFAFA
                (104, 58, 6),  # #683A06
            ]
        case Theme.WEDDING:
            return [
                (128, 115, 98),  # #807362
                (212, 139, 83),  # #D48B53
                (255, 181, 86),  # #FFB556
                (227, 192, 173),  # #E3C0AD
                (224, 224, 227),  # #E0E0E3
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
        case Theme.WEDDING:
            return (250, 246, 240)  # #FAF6F0 - ivory
        case _:
            return (1, 0, 0)


def get_qr_fill_color(theme: Theme) -> tuple[int, int, int]:
    match theme:
        case Theme.BLACK_WHITE:
            return (0, 0, 0)
        case Theme.WEDDING:
            return (58, 51, 62)  # #3A333E - deep ink
        case _:
            return (255, 255, 255)


def get_qr_embedded_image_ratio(theme: Theme) -> float:
    """Fraction of the QR size used by the center image. Photos need more headroom than logos."""
    match theme:
        case Theme.WEDDING:
            return 0.32
        case _:
            return 0.5


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

    if theme == Theme.SUMMER_BREEZE:
        return sorted(images_dir.glob("summer-breeze-logo.svg")) if purpose == "qr" else []

    if theme == Theme.WEDDING:
        if purpose == "qr":
            photo = images_dir / "wedding-qr-center.png"
            return [photo] if photo.exists() else sorted(images_dir.glob("wedding_01.svg"))
        return sorted(images_dir.glob("wedding_*.svg"))

    return []
