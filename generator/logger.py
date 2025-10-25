"""Modern, fancy but minimalistic logging module using Rich."""

import logging
import sys
import time

from rich.console import Console
from rich.logging import RichHandler
from rich.progress import Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from rich.theme import Theme

HITSTER_THEME = Theme(
    {
        "info": "cyan",
        "success": "green",
        "warning": "yellow",
        "error": "red",
        "debug": "dim white",
        "highlight": "magenta",
        "accent": "blue",
        "muted": "dim white",
    }
)

console = Console(theme=HITSTER_THEME, stderr=True)


class HitsterLogger:
    """Modern logger with rich formatting and progress tracking."""

    HEADER_LENGTH = 100

    def __init__(self, name: str = "hitster"):
        self.name = name
        self._setup_logging()
        self._progress: Progress | None = None

    def _setup_logging(self) -> None:
        """Setup rich logging handler with custom formatting."""

        logging.getLogger().handlers.clear()

        rich_handler = RichHandler(
            console=console,
            show_time=False,
            show_path=False,
            rich_tracebacks=True,
            tracebacks_show_locals=False,
            markup=True,
        )
        rich_handler.setFormatter(logging.Formatter(fmt="%(message)s", datefmt="[%X]"))

        logging.basicConfig(level=logging.INFO, format="%(message)s", handlers=[rich_handler])

        self.logger = logging.getLogger(self.name)

    def info(self, message: str, **kwargs) -> None:
        """Log info message with cyan color."""
        console.print(f"[info]ℹ[/info]  {message}", **kwargs)

    def success(self, message: str, **kwargs) -> None:
        """Log success message with green color."""
        console.print(f"[success]✓[/success]  {message}\n", **kwargs)

    def warning(self, message: str, **kwargs) -> None:
        """Log warning message with yellow color."""
        console.print(f"[warning]⚠[/warning]  {message}", **kwargs)

    def error(self, message: str, **kwargs) -> None:
        """Log error message with red color."""
        console.print(f"[error]✗[/error]  {message}", **kwargs)

    def debug(self, message: str, **kwargs) -> None:
        """Log debug message with dim white color."""
        console.print(f"[debug]•[/debug]  {message}", **kwargs)

    def step(self, message: str, **kwargs) -> None:
        """Log a step with highlight color."""
        console.print(f"[highlight]→[/highlight]  {message}", **kwargs)

    def header(self, message: str) -> None:
        """Log a header message with accent color and spacing."""
        console.print()
        console.print(f"[accent]{'=' * self.HEADER_LENGTH}[/accent]")
        console.print(f"[accent]{message.center(self.HEADER_LENGTH)}[/accent]")
        console.print(f"[accent]{'=' * self.HEADER_LENGTH}[/accent]")
        console.print()

    def section(self, message: str) -> None:
        """Log a section header with spacing."""
        console.print()
        console.print(f"[accent]▶[/accent] [bold]{message}[/bold]")
        console.print(f"[muted]{'─' * len(message)}[/muted]")

    def item(self, message: str, indent: int = 2, **kwargs) -> None:
        """Log an item with indentation."""
        console.print(f"{' ' * indent}[muted]•[/muted] {message}", **kwargs)

    def skip(self, message: str, reason: str = "", **kwargs) -> None:
        """Log a skipped item with reason."""
        reason_text = f" ([muted]{reason}[/muted])" if reason else ""
        console.print(f"[warning]⊘[/warning]  {message}{reason_text}", **kwargs)

    def progress_start(self, description: str) -> Progress:
        """Start a progress spinner."""
        self._progress = Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            TimeElapsedColumn(),
            console=console,
            transient=True,
        )
        self._progress.start()
        self._progress.add_task(description, total=None)
        return self._progress

    def progress_stop(self) -> None:
        """Stop the progress spinner."""
        if self._progress:
            self._progress.stop()
            self._progress = None

    def newline(self) -> None:
        """Print a newline for spacing."""
        console.print()

    def progress_bar(
        self,
        completed: int,
        total: int,
        bar_length: int = 30,
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
                eta_text = f" ETA: {self._format_time(eta_seconds)}"
            else:
                eta_text = f" Completed in {self._format_time(elapsed)}"

        # Create the progress bar with subtle styling
        progress_text = f"{bar_color} {prefix}: [{bar}] {completed}/{total} ({percentage:.1f}%){eta_text}"

        # Use \r to return to the beginning of the line and overwrite
        sys.stdout.write(f"\r{' ' * indent}{progress_text}")
        sys.stdout.flush()

        # Add newline when complete
        if completed == total:
            sys.stdout.write("\n")

    def _format_time(self, seconds: float) -> str:
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


logger = HitsterLogger()

info = logger.info
success = logger.success
warning = logger.warning
error = logger.error
debug = logger.debug
step = logger.step
header = logger.header
section = logger.section
item = logger.item
skip = logger.skip
newline = logger.newline
progress_start = logger.progress_start
progress_stop = logger.progress_stop
progress_bar = logger.progress_bar
