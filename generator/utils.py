import os


def get_env_var(key: str, default: str | None = None) -> str:
    """Get a mandatory environment variable and raise an error if it is not set"""

    value = os.getenv(key, default)
    if not value:
        raise OSError(f"Environment variable {key} is required but not set")
    return value


def calculate_relative_luminance(rgb: tuple[int, int, int]) -> float:
    """Calculate relative luminance of an RGB color (0-1 scale)"""
    r, g, b = rgb

    # Convert to 0-1 range
    r_norm = r / 255.0
    g_norm = g / 255.0
    b_norm = b / 255.0

    # Apply gamma correction
    r_linear = r_norm / 12.92 if r_norm <= 0.03928 else ((r_norm + 0.055) / 1.055) ** 2.4
    g_linear = g_norm / 12.92 if g_norm <= 0.03928 else ((g_norm + 0.055) / 1.055) ** 2.4
    b_linear = b_norm / 12.92 if b_norm <= 0.03928 else ((b_norm + 0.055) / 1.055) ** 2.4

    # Calculate relative luminance
    return 0.2126 * r_linear + 0.7152 * g_linear + 0.0722 * b_linear
