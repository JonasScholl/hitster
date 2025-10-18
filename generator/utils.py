import os


def get_env_var(key: str, default: str | None = None) -> str:
    """Get a mandatory environment variable and raise an error if it is not set"""

    value = os.getenv(key, default)
    if not value:
        raise OSError(f"Environment variable {key} is required but not set")
    return value
