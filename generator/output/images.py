from pathlib import Path

from PIL import Image


def process_embedded_image(image_path: Path, background_color: tuple[int, int, int]) -> Path:
    """Process an embedded image to tint it with a variation of the background color

    Args:
        image_path: Path to the original PNG image
        background_color: RGB tuple of the background color

    Returns:
        Path to the processed image file
    """
    if not image_path or not image_path.exists():
        return image_path

    Path("generated/images").mkdir(parents=True, exist_ok=True)

    processed_path = (
        Path("generated/images")
        / f"{image_path.stem}_{background_color[0]}_{background_color[1]}_{background_color[2]}.png"
    )
    if processed_path.exists():
        return processed_path

    try:
        with Image.open(image_path) as original_img:
            img_rgba = original_img.convert("RGBA") if original_img.mode != "RGBA" else original_img
            processed_img = Image.new("RGBA", img_rgba.size, (0, 0, 0, 0))

            data = img_rgba.getdata()
            new_data = []

            for item in data:
                r, g, b, a = item

                if a > 0:
                    if r == 0 and g == 0 and b == 0:
                        new_r = max(0, background_color[0] - 50)
                        new_g = max(0, background_color[1] - 50)
                        new_b = max(0, background_color[2] - 50)
                    else:
                        new_r = int((r + background_color[0]) / 2)
                        new_g = int((g + background_color[1]) / 2)
                        new_b = int((b + background_color[2]) / 2)

                    new_data.append((new_r, new_g, new_b, a))
                else:
                    new_data.append(item)

            processed_img.putdata(new_data)
            processed_img.save(processed_path, "PNG")

        return processed_path

    except Exception as e:
        item(f"Warning: Failed to process image {image_path}: {e}")
        return image_path
