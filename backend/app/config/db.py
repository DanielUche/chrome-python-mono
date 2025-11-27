from typing import Generator

from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base

from .settings import Settings

# Initialize settings
settings = Settings()

# Create database engine with connection pooling configuration
engine: Engine = create_engine(
    settings.DATABASE_URL,
    future=True,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=10,  # Maximum number of connections to keep in pool
    max_overflow=20,  # Maximum number of connections that can be created beyond pool_size
    pool_timeout=30,  # Seconds to wait before giving up on getting a connection
    pool_recycle=3600,  # Recycle connections after 1 hour to avoid stale connections
)

# Create session factory
SessionLocal: sessionmaker = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    future=True,
    expire_on_commit=False,
)

# Declarative base for ORM models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()