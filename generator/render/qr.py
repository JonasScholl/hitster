import time
from collections.abc import Iterator
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

import qrcode
import qrcode.constants
import qrcode.image.styledpil
from qrcode.image.styles.colormasks import SolidFillColorMask
from qrcode.image.styles.moduledrawers.pil import CircleModuleDrawer

from generator.connectors import Song
from generator.logger import item, progress_bar
from generator.render.images import process_embedded_image
from generator.themes import Theme, get_image_paths, get_qr_background_color, get_qr_fill_color, get_qr_image_color
from generator.utils import get_max_workers


def _qr_code_image_generator(theme: Theme) -> Iterator[Path]:
    """Generator that yields available images for the given theme in a cycling pattern"""

    image_paths = get_image_paths(theme, purpose="qr")

    background_color = get_qr_background_color(theme)
    image_color = get_qr_image_color(theme)

    index = 0
    while True:
        if image_paths:
            base_image = image_paths[index % len(image_paths)]
            yield process_embedded_image(base_image, background_color, fill_color=image_color, outline=True)
        else:
            yield None
        index += 1


def _generate_qr_code(
    song: Song,
    theme: Theme,
    image_path: Path,
    output_dir: str,
) -> None:
    """Generate a single QR code for a song - designed for parallel execution"""

    qr = qrcode.QRCode(
        box_size=12,
        border=0,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        image_factory=qrcode.image.styledpil.StyledPilImage,
        mask_pattern=None,
    )

    qr.add_data(song.qr_code_value)
    qr.make(fit=True)

    qr_image = qr.make_image(
        embeded_image_path=str(image_path.absolute()) if image_path else None,
        embeded_image_ratio=0.5,
        module_drawer=CircleModuleDrawer(),
        color_mask=SolidFillColorMask(
            back_color=get_qr_background_color(theme),
            front_color=get_qr_fill_color(theme),
        ),
    )

    qr_image.save(
        f"{output_dir}/{song.id}.png",
        format="PNG",
        compress_level=0,
    )


def generate_qr_codes(theme: Theme, songs: list[Song]) -> None:
    """Generate QR codes for the songs and save them to the generated/qr-codes directory"""

    if not songs:
        item("No songs to process")
        return

    Path("generated/qr-codes").mkdir(parents=True, exist_ok=True)

    output_dir = "generated/qr-codes"

    image_generator = _qr_code_image_generator(theme)

    max_workers = get_max_workers(min_workers=len(songs))
    qr_args = [(song, theme, next(image_generator), output_dir) for song in songs]

    item(f"Generating {len(songs)} QR codes using {max_workers} parallel workers")

    completed_count = 0
    total_songs = len(qr_args)
    errors = []
    start_time = time.time()

    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        future_to_song = {executor.submit(_generate_qr_code, *args): args[0] for args in qr_args}
        for future in as_completed(future_to_song):
            try:
                future.result()
                completed_count += 1
                progress_bar(completed_count, total_songs, indent=4, prefix="QR Codes", start_time=start_time)

            except Exception as e:
                song = future_to_song[future]
                error_msg = f"Error generating QR code for song {song.id}: {e}"
                item(error_msg)
                errors.append(error_msg)
                progress_bar(completed_count, total_songs, indent=4, prefix="QR Codes", start_time=start_time)

    if errors:
        item(f"Completed with {len(errors)} errors out of {total_songs} songs")
    else:
        item(f"Successfully generated all {total_songs} QR codes")
