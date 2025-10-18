"""Modern, fancy but minimalistic logging module using Rich."""

import logging

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
        console.print(f"[success]✓[/success]  {message}", **kwargs)

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
        console.print(f"[accent]{'=' * 50}[/accent]")
        console.print(f"[accent]{message.center(50)}[/accent]")
        console.print(f"[accent]{'=' * 50}[/accent]")
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
