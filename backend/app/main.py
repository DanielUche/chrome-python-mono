from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import SessionLocal, get_logger
from app.constants import APP_DESCRIPTION, APP_TITLE, APP_VERSION
from app.exceptions import DatabaseConnectionException
from app.middleware import DatabaseMiddleware

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

# Add middleware (execute in reverse order of registration)
app.add_middleware(DatabaseMiddleware)
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

