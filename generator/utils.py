import os
import sys
import time


def get_env_var(key: str, default: str | None = None) -> str:
    """Get a mandatory environment variable and raise an error if it is not set"""

    value = os.getenv(key, default)
    if not value:
        raise OSError(f"Environment variable {key} is required but not set")
    return value


def get_max_workers(min_workers=1) -> int:
    """Get the maximum number of workers to use for parallel processing"""
    return min(int(get_env_var("MAX_WORKERS", "8")), min_workers, os.cpu_count() or 1)


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


def update_progress_bar(
    completed: int,
    total: int,
    bar_length: int = 50,
    indent: int = 0,
    prefix: str = "Progress",
    show_eta: bool = True,
    start_time: float | None = None,
) -> None:
    """Update a fancy progress bar in the console with enhanced visuals and ETA"""
    if total == 0:
        return

    progress = completed / total
    filled_length = int(bar_length * progress)

    # Create a subtle progress bar with consistent styling
    if completed == total:
        # Completed state - all filled
        bar = "▓" * bar_length
        bar_color = "✓"
    elif progress < 0.05 and completed == 0:
        # Just started - show subtle spinner
        spinner_chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
        spinner = spinner_chars[int(time.time() * 10) % len(spinner_chars)]
        bar = f"{spinner} " + "·" * (bar_length - 2)
        bar_color = " "
    else:
        # Consistent progress bar with subtle characters
        bar = "▓" * filled_length + "·" * (bar_length - filled_length)
        bar_color = " "

    percentage = progress * 100

    # Calculate ETA if start_time is provided
    eta_text = ""
    if show_eta and start_time and completed > 0:
        elapsed = time.time() - start_time
        if completed < total:
            rate = completed / elapsed
            remaining = total - completed
            eta_seconds = remaining / rate
            eta_text = f" ETA: {_format_time(eta_seconds)}"
        else:
            eta_text = f" Completed in {_format_time(elapsed)}"

    # Create the progress bar with subtle styling
    progress_text = f"{bar_color} {prefix}: [{bar}] {completed}/{total} ({percentage:.1f}%){eta_text}"

    # Use \r to return to the beginning of the line and overwrite
    sys.stdout.write(f"\r{' ' * indent}{progress_text}")
    sys.stdout.flush()

    # Add newline when complete
    if completed == total:
        sys.stdout.write("\n")


def _format_time(seconds: float) -> str:
    """Format time in a human-readable way"""
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{minutes}m{secs}s"
    else:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        return f"{hours}h{minutes}m"
