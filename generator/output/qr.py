import os
import shutil
from collections.abc import Iterator
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

import qrcode
import qrcode.image.styledpil
from qrcode.image.styles.colormasks import SolidFillColorMask
from qrcode.image.styles.moduledrawers.pil import CircleModuleDrawer

from generator.connectors import Song
from generator.logger import item
from generator.themes import Theme, get_image_paths, get_rgb_colors
from generator.utils import calculate_relative_luminance, get_env_var


def _qr_code_image_generator(theme: Theme) -> Iterator[Path]:
    """Generator that yields available images for the given theme in a cycling pattern"""

    image_paths = get_image_paths(theme)

    index = 0
    while True:
        yield image_paths[index % len(image_paths)] if image_paths else None
        index += 1


def _qr_code_background_color_generator(theme: Theme) -> Iterator[tuple[int, int, int]]:
    background_colors = get_rgb_colors(theme)

    index = 0
    while True:
        yield background_colors[index % len(background_colors)]
        index += 1


def _qr_code_fill_color_generator(theme: Theme) -> Iterator[tuple[int, int, int]]:
    """Generate contrasting fill colors based on background color luminance for optimal contrast

    Uses W3C WCAG 2.0 guidelines for contrast calculation. The threshold of 0.179
    is derived from the formula: sqrt(1.05 * 0.05) - 0.05, which ensures maximum
    contrast between text and background colors.
    """
    background_color_generator = _qr_code_background_color_generator(theme)

    while True:
        background_color = next(background_color_generator)
        luminance = calculate_relative_luminance(background_color)
        yield (255, 255, 255) if luminance < 0.179 else (0, 0, 0)


def _generate_qr_code(args: tuple[Song, Path, tuple[int, int, int], tuple[int, int, int], str]) -> None:
    """Generate a single QR code for a song - designed for parallel execution"""
    song, image_path, background_color, fill_color, output_dir = args

    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=4,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        image_factory=qrcode.image.styledpil.StyledPilImage,
        mask_pattern=None,
    )

    qr.add_data(song.qr_code_value)
    qr.make(fit=True)

    qr.make_image(
        embeded_image_path=str(image_path.absolute()) if image_path else None,
        module_drawer=CircleModuleDrawer(),
        color_mask=SolidFillColorMask(
            back_color=background_color,
            front_color=fill_color,
        ),
    ).save(f"{output_dir}/{song.id}.png")


def generate_qr_codes(songs: list[Song]) -> None:
    """Generate QR codes for the songs and save them to the generated/qr-codes directory"""

    if not songs:
        item("No songs to process")
        return

    if Path("generated/qr-codes").is_dir():
        shutil.rmtree("generated/qr-codes")

    Path("generated/qr-codes").mkdir(parents=True, exist_ok=True)

    theme = Theme(get_env_var("THEME", Theme.BLACK_WHITE))
    output_dir = "generated/qr-codes"

    image_generator = _qr_code_image_generator(theme)
    background_color_generator = _qr_code_background_color_generator(theme)
    fill_color_generator = _qr_code_fill_color_generator(theme)

    max_workers = min(int(get_env_var("QR_MAX_WORKERS", "8")), len(songs), os.cpu_count() or 1)
    qr_args = [
        (song, next(image_generator), next(background_color_generator), next(fill_color_generator), output_dir)
        for song in songs
    ]

    item(f"Generating {len(songs)} QR codes using {max_workers} parallel workers")

    # Prepare arguments for parallel processing

    completed_count = 0
    total_songs = len(songs)
    errors = []

    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_song = {executor.submit(_generate_qr_code, args): args[0] for args in qr_args}

        # Process completed tasks and update progress
        for future in as_completed(future_to_song):
            try:
                future.result()  # This will raise any exception that occurred
                completed_count += 1

                # Update progress every 20 completions or on final completion
                if completed_count % 20 == 0 or completed_count == total_songs:
                    item(f"Generated {completed_count}/{total_songs} QR codes")

            except Exception as e:
                song = future_to_song[future]
                error_msg = f"Error generating QR code for song {song.id}: {e}"
                item(error_msg)
                errors.append(error_msg)

    # Report any errors that occurred
    if errors:
        item(f"Completed with {len(errors)} errors out of {total_songs} songs")
    else:
        item(f"Successfully generated all {total_songs} QR codes")
