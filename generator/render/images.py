import io
import sys
import xml.etree.ElementTree as ET
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path
from time import time

import cairosvg
from PIL import Image

from generator.logger import item
from generator.themes import Theme, get_image_paths, get_rgb_colors
from generator.utils import calculate_relative_luminance, get_max_workers, update_progress_bar


def generate_qr_codes_images(theme: Theme) -> None:
    """Generate QR code images for the songs and save them to the generated/qr-codes-images directory"""

    image_paths = get_image_paths(theme)
    colors = get_rgb_colors(theme)

    if not image_paths:
        return

    max_workers = get_max_workers(min_workers=len(image_paths))
    qr_args = [(image_path, color) for image_path in image_paths for color in colors]

    completed_count = 0
    total_images = len(qr_args)
    errors = []
    start_time = time()

    item(f"Generating {len(image_paths)} embedded QR code images using {max_workers} parallel workers")

    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        future_to_image_path = {executor.submit(process_embedded_image, *args): args for args in qr_args}
        for future in as_completed(future_to_image_path):
            try:
                future.result()
                completed_count += 1
                update_progress_bar(
                    completed_count, total_images, indent=4, prefix="QR Code Images", start_time=start_time
                )
            except Exception as e:
                image_path = future_to_image_path[future]
                error_msg = f"Error processing image {image_path}: {e}"
                item(error_msg)
                errors.append(error_msg)
                update_progress_bar(
                    completed_count, total_images, indent=4, prefix="QR Code Images", start_time=start_time
                )
                sys.exit(1)

    if errors:
        item(f"Completed with {len(errors)} errors out of {total_images} images")
    else:
        item(f"Successfully generated all {total_images} embedded QR code images")


def process_embedded_image(image_path: Path, background_color: tuple[int, int, int], outline=False) -> Path:
    """Process an embedded SVG image to tint it with a variation of the background color and add an outline

    Args:
        image_path: Path to the original SVG image
        background_color: RGB tuple of the background color

    Returns:
        Path to the processed PNG image file
    """
    if not image_path or not image_path.exists():
        return image_path

    Path("generated/images").mkdir(parents=True, exist_ok=True)

    processed_path = (
        Path("generated/images")
        / f"{image_path.stem}_{background_color[0]}_{background_color[1]}_{background_color[2]}{'_outline' if outline else ''}.png"
    )
    if processed_path.exists():
        return processed_path

    try:
        svg_content = image_path.read_text(encoding="utf-8")
        root = ET.fromstring(svg_content)

        # Find and modify the fill color in the SVG
        for elem in root.iter():
            if "fill" in elem.attrib and elem.attrib["fill"] == "#000000":
                elem.attrib["fill"] = get_secondary_hex_color(background_color)

        if outline:
            stroke_width = 750

            # Expand viewBox to accommodate the stroke width
            if "viewBox" in root.attrib:
                viewbox_parts = root.attrib["viewBox"].split()
                if len(viewbox_parts) == 4:
                    x, y, width, height = map(float, viewbox_parts)
                    padding = stroke_width / 10
                    new_x = x - padding
                    new_y = y - padding
                    new_width = width + 2 * padding
                    new_height = height + 2 * padding
                    root.attrib["viewBox"] = f"{new_x} {new_y} {new_width} {new_height}"

            # Create outer stroke effect by duplicating paths with stroke-only
            # Find all path elements and create stroke versions
            stroke_paths = []
            for elem in root.iter():
                if elem.tag.endswith("path"):
                    stroke_path = ET.Element("path")
                    stroke_path.attrib.update(elem.attrib)
                    stroke_path.attrib["stroke"] = rgb_to_hex(background_color)
                    stroke_path.attrib["stroke-width"] = str(stroke_width)
                    stroke_path.attrib["stroke-linejoin"] = "round"
                    stroke_path.attrib["stroke-linecap"] = "round"
                    stroke_path.attrib["fill"] = "none"
                    stroke_paths.append(stroke_path)

            if stroke_paths:
                main_group = None
                for elem in root.iter():
                    if elem.tag.endswith("g") and "transform" in elem.attrib:
                        main_group = elem
                        break

                if main_group is not None:
                    for i, stroke_path in enumerate(stroke_paths):
                        main_group.insert(i, stroke_path)

        modified_svg = ET.tostring(root, encoding="unicode")
        png_data = cairosvg.svg2png(bytestring=modified_svg.encode("utf-8"))

        with Image.open(io.BytesIO(png_data)) as original_img:
            img_rgba = original_img.convert("RGBA") if original_img.mode != "RGBA" else original_img
            img_rgba.save(processed_path, "PNG")

        return processed_path

    except Exception as e:
        print(f"Warning: Failed to process image {image_path}: {e}")
        return image_path


def get_secondary_hex_color(color: tuple[int, int, int]) -> str:
    """Get a complementary color for the fill - darker for light colors, lighter for dark colors"""
    luminance = calculate_relative_luminance(color)

    # For dark colors (luminance < 0.179): make lighter
    # For light colors (luminance >= 0.179): make darker
    if luminance < 0.179:
        factor = 1.0 + (0.5 - luminance) * 0.8
        base_addition = max(0, 15 - int(luminance * 50))
        new_r = int(min(255, color[0] * factor + base_addition))
        new_g = int(min(255, color[1] * factor + base_addition))
        new_b = int(min(255, color[2] * factor + base_addition))
    else:
        factor = 1.0 - (luminance - 0.5) * 5
        new_r = int(max(0, color[0] * factor))
        new_g = int(max(0, color[1] * factor))
        new_b = int(max(0, color[2] * factor))

    return rgb_to_hex((new_r, new_g, new_b))


def rgb_to_hex(color: tuple[int, int, int]) -> str:
    return f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}"
