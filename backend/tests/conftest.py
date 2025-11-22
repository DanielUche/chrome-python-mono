"""Test configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.config import Base, get_db
import app.config.db as db_config


@pytest.fixture(scope="function")
def db():
    """
    Create a FRESH in-memory SQLite database for each test.
    Each test gets its own isolated in-memory database.
    """
    # Create a NEW engine for this test (separate from all other tests)
    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Create tables in the new engine
    Base.metadata.create_all(bind=test_engine)
    
    # Create session factory for this test
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine,
    )
    
    # Create fresh session
    session = TestingSessionLocal()
    
    # Monkey-patch app.config.db to use test engine
    original_engine = db_config.engine
    db_config.engine = test_engine
    
    # Override FastAPI's get_db to use test database
    def override_get_db():
        yield session
        session.rollback()  # Rollback on exit
    
    app.dependency_overrides[get_db] = override_get_db
    
    yield session
    
    # Cleanup after test
    session.rollback()
    session.close()
    db_config.engine = original_engine
    app.dependency_overrides.clear()


@pytest.fixture
def client(db):
    """
    Create FastAPI test client with the isolated test database.
    All API calls use the test database, not PostgreSQL.
    """
    return TestClient(app)


@pytest.fixture(scope="session")
def client_session():
    """Session-scoped test client (use sparingly)."""
    return TestClient(app)
