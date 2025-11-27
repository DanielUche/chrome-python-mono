from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import SessionLocal
from app.config.logger import setup_logger, get_logger
from app.constants import APP_DESCRIPTION, APP_TITLE, APP_VERSION
from app.exceptions import DatabaseConnectionException
from app.middleware import DatabaseMiddleware, limiter, RequestValidationMiddleware, RateLimitMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Setup structured logging
setup_logger()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up application...")
    # Test database connection
    logger.info("Testing database connection...")
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("Database connected successfully")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise DatabaseConnectionException(str(e))

    logger.info("Application started successfully\n")
    yield

    # Shutdown
    logger.info("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
    lifespan=lifespan,
)

# Configure rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler) # type: ignore This is a known issue with SlowAPI's type annotations not perfectly matching FastAPI's exception handler signature.

# Add middleware (execute in reverse order of registration)
app.add_middleware(DatabaseMiddleware)
app.add_middleware(RequestValidationMiddleware)
app.add_middleware(RateLimitMiddleware)  # Rate limiting applied globally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers AFTER app creation to avoid circular imports
from app.routers import db_router, health_router

# Include routers
app.include_router(health_router)
app.include_router(db_router)

