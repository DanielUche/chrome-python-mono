from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent.parent.parent.parent / ".env"),
        case_sensitive=False,
        extra="ignore"
    )

    DATABASE_URL: str = ""
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"


# Create settings instance
settings = Settings()
