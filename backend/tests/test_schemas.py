"""Tests for models and schemas."""

import pytest
from datetime import datetime, timezone
from pydantic import ValidationError

from app.models import PageMetric
from app.schemas import page_metric as schemas
from app.config import SessionLocal


class TestPageMetricModel:
    """Tests for PageMetric SQLAlchemy model."""

    def test_page_metric_creation(self):
        """Test creating a PageMetric model instance."""
        now = datetime.now(timezone.utc)
        metric = PageMetric(
            url="https://example.com",
            link_count=10,
            word_count=500,
            image_count=5,
            datetime_visited=now,
        )
        
        assert str(metric.url) == "https://example.com"  # type: ignore
        assert metric.link_count == 10  # type: ignore
        assert metric.word_count == 500  # type: ignore
        assert metric.image_count == 5  # type: ignore
        assert metric.datetime_visited == now  # type: ignore

class TestPageMetricCreateDTO:
    """Tests for PageMetricCreateDTO schema."""

    def test_create_dto_without_datetime(self):
        """Test creating DTO without datetime."""
        data = {
            "url": "https://example.com",
            "link_count": 10,
            "word_count": 500,
            "image_count": 5,
        }
        dto = schemas.PageMetricCreateDTO(**data)
        
        assert dto.url == "https://example.com"
        assert dto.datetime_visited is None

class TestPageMetricSchema:
    """Tests for PageMetric response schema."""

    def test_page_metric_schema_valid(self):
        """Test creating valid PageMetric schema."""
        data = {
            "id": 1,
            "url": "https://example.com",
            "link_count": 10,
            "word_count": 500,
            "image_count": 5,
            "datetime_visited": "November 22, 2025 at 12:59 PM",
        }
        schema = schemas.PageMetric(**data)
        
        assert schema.id == 1
        assert schema.url == "https://example.com"
        assert schema.datetime_visited == "November 22, 2025 at 12:59 PM"

    def test_page_metric_schema_missing_id(self):
        """Test that missing id raises validation error."""
        data = {
            "url": "https://example.com",
            "link_count": 10,
            "word_count": 500,
            "image_count": 5,
            "datetime_visited": "November 22, 2025 at 12:59 PM",
        }
        with pytest.raises(ValidationError):
            schemas.PageMetric(**data)
