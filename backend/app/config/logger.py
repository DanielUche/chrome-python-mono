import logging
from typing import Optional

from app.config.settings import Settings

# Global logger instance
_logger: Optional[logging.Logger] = None


def get_logger(name: str = "app") -> logging.Logger:
    global _logger

    if _logger is None:
        settings = Settings()
        logging.basicConfig(
            level=settings.LOG_LEVEL,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        )
        _logger = logging.getLogger(name)
    else:
        _logger = logging.getLogger(name)

    return _logger
