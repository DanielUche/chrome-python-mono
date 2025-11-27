from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, List
from urllib.parse import urlparse, urlunparse

from sqlalchemy import select, desc, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models import page_metrics
from app.schemas import page_metric as page_metric_schemas
from app.utils.helpers import format_datetime
from app.exceptions import DatabaseConnectionException

# URL validation constants
MAX_URL_LENGTH = 2048  # Standard max URL length
MIN_URL_LENGTH = 1


def _normalize_url(url: str) -> str:
    """Normalize URL by removing trailing slash for consistent matching."""
    return url.rstrip("/") if url != "/" else url


def _validate_url(url: str) -> None:
    """Validate URL length and basic format."""
    if not url or len(url) < MIN_URL_LENGTH:
        raise ValueError(f"URL must be at least {MIN_URL_LENGTH} character long")
    if len(url) > MAX_URL_LENGTH:
        raise ValueError(f"URL exceeds maximum length of {MAX_URL_LENGTH} characters")
    # Basic URL format validation
    if not url.startswith(('http://', 'https://')):
        raise ValueError("URL must start with http:// or https://")


def _format_page_visit(
    visit: page_metrics.PageMetric,
    tz_offset_hours: Optional[float] = None,
) -> page_metric_schemas.PageMetric:
    # Ensure URL is normalized (without trailing slash)
    url_normalized = str(visit.url).rstrip('/') or '/'
    
    return page_metric_schemas.PageMetric.model_validate(
        {
            "id": visit.id,
            "url": url_normalized,  # Pass normalized URL
            "link_count": visit.link_count,
            "word_count": visit.word_count,
            "image_count": visit.image_count,
            "datetime_visited": format_datetime(visit.datetime_visited, tz_offset_hours),
        }
    )


def create_page_visit(
    db: Session, visit_in: page_metric_schemas.PageMetricCreateDTO
) -> page_metric_schemas.PageMetric:
    # Validate URL
    url_str = str(visit_in.url)
    _validate_url(url_str)
    
    # Validate timezone offset if provided
    if visit_in.timezone_offset is not None:
        if not -12 <= visit_in.timezone_offset <= 14:
            raise ValueError("Timezone offset must be between -12 and +14 hours")
    
    try:
        # Parse the datetime string if provided
        if visit_in.datetime_visited:
            if isinstance(visit_in.datetime_visited, str):
                # Parse ISO format datetime string (replace Z with +00:00 for compatibility)
                iso_str = visit_in.datetime_visited
                if iso_str.endswith('Z'):
                    iso_str = iso_str[:-1] + '+00:00'
                dt_visited = datetime.fromisoformat(iso_str)
            else:
                dt_visited = visit_in.datetime_visited
        else:
            dt_visited = datetime.now(timezone.utc)
        
        visit = page_metrics.PageMetric(
            url=url_str.rstrip('/') or '/',  # Remove trailing slash
            datetime_visited=dt_visited,
            link_count=visit_in.link_count,
            word_count=visit_in.word_count,
            image_count=visit_in.image_count,
        )
        db.add(visit)
        db.commit()
        db.refresh(visit)
        return _format_page_visit(visit, visit_in.timezone_offset)
    except SQLAlchemyError as e:
        db.rollback()
        raise DatabaseConnectionException(f"Failed to create page visit: {str(e)}")
    except Exception as e:
        db.rollback()
        raise


def get_visits_for_url(
    db: Session, 
    url: str, 
    limit: int = 50, 
    offset: int = 0,
    tz_offset_hours: Optional[float] = None
) -> List[page_metric_schemas.PageMetric]:
    # Validate URL
    _validate_url(url)
    
    # Validate timezone offset if provided
    if tz_offset_hours is not None:
        if not -12 <= tz_offset_hours <= 14:
            raise ValueError("Timezone offset must be between -12 and +14 hours")
    
    normalized_url = str(url).rstrip('/') or '/'
    stmt = (
        select(page_metrics.PageMetric)
        .where(page_metrics.PageMetric.url == normalized_url)
        .order_by(desc(page_metrics.PageMetric.datetime_visited))
        .limit(limit)
        .offset(offset)
    )
    visits = db.execute(stmt).scalars().all()
    return [_format_page_visit(visit, tz_offset_hours) for visit in visits]


def get_latest_metrics_for_url(
    db: Session, url: str, tz_offset_hours: Optional[float] = None
) -> Optional[page_metric_schemas.PageMetrics]:
    # Validate URL
    _validate_url(url)
    
    # Validate timezone offset if provided
    if tz_offset_hours is not None:
        if not -12 <= tz_offset_hours <= 14:
            raise ValueError("Timezone offset must be between -12 and +14 hours")
    
    normalized_url = str(url).rstrip('/') or '/'
    
    # Replace deprecated db.query() with db.execute(select())
    stmt = (
        select(
            page_metrics.PageMetric,
            func.count(page_metrics.PageMetric.id)
            .over(partition_by=page_metrics.PageMetric.url)
            .label("visit_count"),
        )
        .where(page_metrics.PageMetric.url == normalized_url)
        .order_by(desc(page_metrics.PageMetric.datetime_visited))
        .limit(1)
    )
    result = db.execute(stmt).first()

    if result is None:
        return None

    visit_obj, visit_count = result
    last_visited_str = format_datetime(visit_obj.datetime_visited, tz_offset_hours)

    return page_metric_schemas.PageMetrics.model_validate(
        {
            "url": visit_obj.url,
            "link_count": visit_obj.link_count,
            "word_count": visit_obj.word_count,
            "image_count": visit_obj.image_count,
            "last_visited": last_visited_str,
            "visit_count": visit_count,
        }
    )
