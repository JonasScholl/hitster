import io
import sys
import xml.etree.ElementTree as ET
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path
from time import time

import cairosvg
from PIL import Image, ImageDraw

from generator.logger import item, progress_bar
from generator.themes import Theme, get_card_colors, get_image_paths
from generator.utils import calculate_relative_luminance, get_max_workers


def generate_decoration_images(theme: Theme) -> None:
    """Generate decoration images for the songs and save them to the generated/decoration-images directory"""

    image_paths = get_image_paths(theme, purpose="decoration")
    colors = get_card_colors(theme)

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
                progress_bar(completed_count, total_images, indent=4, prefix="Images", start_time=start_time)
            except Exception as e:
                image_path = future_to_image_path[future]
                error_msg = f"Error processing image {image_path}: {e}"
                item(error_msg)
                errors.append(error_msg)
                progress_bar(completed_count, total_images, indent=4, prefix="Images", start_time=start_time)
                sys.exit(1)

    if errors:
        item(f"Completed with {len(errors)} errors out of {total_images} images")
    else:
        item(f"Successfully generated all {total_images} embedded QR code images")


def process_embedded_image(
    image_path: Path,
    background_color: tuple[int, int, int],
    fill_color: tuple[int, int, int] | None = None,
    outline=False,
) -> Path:
    """Process an embedded image for QR codes or card decorations.

    SVGs are recolored (and optionally outlined). Raster images are cropped to a
    circle and composed onto a square of the QR background color.
    """
    if not image_path or not image_path.exists():
        return image_path

    Path("generated/images").mkdir(parents=True, exist_ok=True)

    is_svg = image_path.suffix.lower() == ".svg"
    outline_suffix = "_outline" if outline and is_svg else ""
    processed_path = (
        Path("generated/images")
        / f"{image_path.stem}_{background_color[0]}_{background_color[1]}_{background_color[2]}{outline_suffix}.png"
    )
    if processed_path.exists():
        return processed_path

    try:
        if not is_svg:
            return _process_circular_photo(image_path, background_color, processed_path)

        svg_content = image_path.read_text(encoding="utf-8")
        root = ET.fromstring(svg_content)

        for elem in root.iter():
            if "fill" in elem.attrib and elem.attrib["fill"] == "#000000":
                elem.attrib["fill"] = (
                    rgb_to_hex(fill_color) if fill_color else get_secondary_hex_color(background_color)
                )

        if outline:
            stroke_width = 750

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


def _is_outer_background_pixel(pixel: tuple[int, ...], local_variance: float) -> bool:
    """True for cream border and gray/white checkerboard outside the circular photo."""
    r, g, b = pixel[:3]
    if abs(r - g) > 15 or abs(g - b) > 15 or abs(r - b) > 15:
        return False
    if r >= 245:
        return True
    if 188 <= r <= 200:
        return True
    return local_variance > 400


def _local_gray_variance(gray: list[list[int]], x: int, y: int, width: int, height: int) -> float:
    vals: list[int] = []
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height:
                vals.append(gray[ny][nx])
    mean = sum(vals) / len(vals)
    return sum((v - mean) ** 2 for v in vals) / len(vals)


def _first_content_index(
    length: int,
    is_bg_at,
    reverse: bool = False,
    run: int = 5,
) -> int | None:
    """Return the first index where `run` consecutive non-background pixels appear."""
    indices = range(length - 1, -1, -1) if reverse else range(length)
    streak = 0
    first = None
    for i in indices:
        if is_bg_at(i):
            streak = 0
            first = None
            continue
        if first is None:
            first = i
        streak += 1
        if streak >= run:
            return first
    return None


def _detect_photo_circle(image: Image.Image) -> tuple[float, float, float]:
    """Return (cx, cy, radius) for the circular photo content."""
    width, height = image.size
    rgb = image.convert("RGB")
    pixels = rgb.load()
    gray = [[(pixels[x, y][0] + pixels[x, y][1] + pixels[x, y][2]) // 3 for x in range(width)] for y in range(height)]

    mid_y = height // 2
    mid_x = width // 2

    def is_bg(x: int, y: int) -> bool:
        variance = _local_gray_variance(gray, x, y, width, height)
        return _is_outer_background_pixel(pixels[x, y], variance)

    left = _first_content_index(width, lambda x: is_bg(x, mid_y))
    right = _first_content_index(width, lambda x: is_bg(x, mid_y), reverse=True)
    top = _first_content_index(height, lambda y: is_bg(mid_x, y))
    bottom = _first_content_index(height, lambda y: is_bg(mid_x, y), reverse=True)

    if None in (left, right, top, bottom):
        radius = min(width, height) / 2 * 0.92
        return width / 2, height / 2, radius

    cx = (left + right) / 2
    cy = (top + bottom) / 2
    radius = min(right - left, bottom - top) / 2 * 0.985

    if radius < min(width, height) * 0.3:
        radius = min(width, height) / 2 * 0.92
        return width / 2, height / 2, radius

    return cx, cy, radius


def _process_circular_photo(
    image_path: Path,
    background_color: tuple[int, int, int],
    processed_path: Path,
) -> Path:
    """Crop a circular photo and place it on a square of the QR background color."""
    with Image.open(image_path) as original:
        photo = original.convert("RGBA")
        cx, cy, radius = _detect_photo_circle(photo)

        radius = radius * 0.97
        diameter = max(1, int(radius * 2))
        left = round(cx - radius)
        top = round(cy - radius)
        cropped = photo.crop((left, top, left + diameter, top + diameter))

        mask = Image.new("L", (diameter, diameter), 0)
        draw = ImageDraw.Draw(mask)
        inset = 2
        draw.ellipse((inset, inset, diameter - 1 - inset, diameter - 1 - inset), fill=255)

        circular = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
        circular.paste(cropped, (0, 0), mask)

        canvas_size = int(diameter / 0.88)
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (*background_color, 255))
        offset = (canvas_size - diameter) // 2
        canvas.paste(circular, (offset, offset), circular)
        canvas.save(processed_path, "PNG")

    return processed_path


def get_secondary_hex_color(color: tuple[int, int, int]) -> str:
    """Get a complementary color for the fill - darker for light colors, lighter for dark colors"""
    luminance = calculate_relative_luminance(color)

    # For dark colors (luminance < 0.179): make lighter
    # For light colors (luminance >= 0.179): make darker
    if luminance < 0.179:
        factor = 1.0 + (0.5 - luminance) * 0.8
        base_addition = max(0, 15 - int(luminance * 50))
        new_r = int(max(0, min(255, color[0] * factor + base_addition)))
        new_g = int(max(0, min(255, color[1] * factor + base_addition)))
        new_b = int(max(0, min(255, color[2] * factor + base_addition)))
    else:
        factor = 1.0 - (luminance - 0.5) * 2
        new_r = int(max(0, min(255, color[0] * factor)))
        new_g = int(max(0, min(255, color[1] * factor)))
        new_b = int(max(0, min(255, color[2] * factor)))

    return rgb_to_hex((new_r, new_g, new_b))


def rgb_to_hex(color: tuple[int, int, int]) -> str:
    return f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}"
