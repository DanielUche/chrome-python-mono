"""Tests for page metrics service functions."""

import pytest
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models import PageMetric
from app.services import page_metrics
from app.schemas import page_metric as schemas


class TestCreatePageVisit:
    """Tests for create_page_visit service function."""

    def test_create_page_visit_basic(self, db):
        """Test creating a basic page visit."""
        visit_in = schemas.PageMetricCreateDTO(
            url="https://example.com",
            link_count=10,
            word_count=500,
            image_count=5,
        )
        
        result = page_metrics.create_page_visit(db, visit_in)
        
        assert result.id is not None
        assert result.url == "https://example.com"
        assert result.link_count == 10
        assert result.word_count == 500
        assert result.image_count == 5
        assert result.datetime_visited is not None

    def test_create_page_visit_url_normalization(self, db):
        """Test that URL is normalized when creating visit."""
        visit_in = schemas.PageMetricCreateDTO(
            url="https://example.com/",
            link_count=10,
            word_count=500,
            image_count=5,
        )
        
        result = page_metrics.create_page_visit(db, visit_in)
        
        # Trailing slash should be removed
        assert result.url == "https://example.com"


    def test_create_page_visit_persists(self, db):
        """Test that created visit is persisted to database."""
        visit_in = schemas.PageMetricCreateDTO(
            url="https://example.com",
            link_count=10,
            word_count=500,
            image_count=5,
        )
        
        result = page_metrics.create_page_visit(db, visit_in)
        visit_id = result.id
        
        # Verify in database
        persisted = db.query(PageMetric).filter(PageMetric.id == visit_id).first()
        assert persisted is not None
        assert persisted.url == "https://example.com"
        assert persisted.link_count == 10


class TestGetVisitsForUrl:
    """Tests for get_visits_for_url service function."""

    def test_get_visits_empty_result(self, db):
        """Test getting visits for URL with no data."""
        result = page_metrics.get_visits_for_url(db, "https://example.com")
        assert result == []

    def test_get_visits_single(self, db):
        """Test getting single visit."""
        # Create a visit
        visit = PageMetric(
            url="https://example.com",
            link_count=10,
            word_count=500,
            image_count=5,
            datetime_visited=datetime.now(timezone.utc),
        )
        db.add(visit)
        db.commit()

        result = page_metrics.get_visits_for_url(db, "https://example.com")
        
        assert len(result) == 1
        assert result[0].url == "https://example.com"
        assert result[0].link_count == 10

    def test_get_visits_multiple(self, db):
        """Test getting multiple visits ordered by most recent."""
        url = "https://example.com"
        
        # Create multiple visits in different order
        for i in range(3):
            visit = PageMetric(
                url=url,
                link_count=10 + i,
                word_count=500,
                image_count=5,
                datetime_visited=datetime.now(timezone.utc),
            )
            db.add(visit)
        db.commit()

        result = page_metrics.get_visits_for_url(db, url)
        
        assert len(result) == 3
        # Should be ordered by most recent first (descending)
        assert result[0].link_count >= result[1].link_count >= result[2].link_count

    def test_get_visits_with_limit(self, db):
        """Test getting visits with limit parameter."""
        url = "https://example.com"
        
        # Create 10 visits
        for i in range(10):
            visit = PageMetric(
                url=url,
                link_count=10 + i,
                word_count=500,
                image_count=5,
                datetime_visited=datetime.now(timezone.utc),
            )
            db.add(visit)
        db.commit()

        result = page_metrics.get_visits_for_url(db, url, limit=5)
        
        assert len(result) == 5
