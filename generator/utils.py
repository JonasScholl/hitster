import os


def get_mandatory_env_var(key: str) -> str:
    """Get a mandatory environment variable and raise an error if it is not set"""

    value = os.getenv(key)
    if not value:
        raise EnvironmentError(f"Environment variable {key} is required but not set")
    return value
