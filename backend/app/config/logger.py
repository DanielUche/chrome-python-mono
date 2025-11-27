import sys
from loguru import logger

from app.config.settings import Settings


def setup_logger():
    """Configure loguru logger with structured logging."""
    settings = Settings()
    
    # Remove default handler
    logger.remove()
    
    # Add console handler with custom format
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=settings.LOG_LEVEL,
        colorize=True,
    )
    
    # Add file handler for errors
    logger.add(
        "logs/error.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="ERROR",
        rotation="10 MB",
        retention="30 days",
        compression="zip",
    )
    
    return logger


def get_logger(name: str = "app"):
    """Get logger instance."""
    return logger.bind(name=name)
