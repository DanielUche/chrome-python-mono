from datetime import datetime, timezone
from urllib.parse import urlparse, urlunparse

from sqlalchemy import select, desc, func
from sqlalchemy.orm import Session

from app.models import page_metrics
from app.schemas import page_metric as page_metric_schemas
from app.utils.helpers import format_datetime


def _normalize_url(url: str) -> str:
    """Normalize URL by removing trailing slash for consistent matching."""
    return url.rstrip("/") if url != "/" else url


def _format_page_visit(
    visit: page_metrics.PageMetric,
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
            "datetime_visited": format_datetime(visit.datetime_visited),
        }
    )


def create_page_visit(
    db: Session, visit_in: page_metric_schemas.PageMetricCreateDTO
) -> page_metric_schemas.PageMetric:
    visit = page_metrics.PageMetric(
        url=str(visit_in.url).rstrip('/') or '/',  # Remove trailing slash
        datetime_visited=visit_in.datetime_visited or datetime.now(timezone.utc),
        link_count=visit_in.link_count,
        word_count=visit_in.word_count,
        image_count=visit_in.image_count,
    )
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return _format_page_visit(visit)


def get_visits_for_url(
    db: Session, url: str, limit: int = 50
) -> list[page_metric_schemas.PageMetric]:
    normalized_url = str(url).rstrip('/') or '/'
    stmt = (
        select(page_metrics.PageMetric)
        .where(page_metrics.PageMetric.url == normalized_url)
        .order_by(desc(page_metrics.PageMetric.datetime_visited))
        .limit(limit)
    )
    visits = db.execute(stmt).scalars().all()
    return [_format_page_visit(visit) for visit in visits]


def get_latest_metrics_for_url(
    db: Session, url: str
) -> page_metric_schemas.PageMetrics | None:
    normalized_url = str(url).rstrip('/') or '/'
    latest = (
        db.query(
            page_metrics.PageMetric,
            func.count(page_metrics.PageMetric.id)
            .over(partition_by=page_metrics.PageMetric.url)
            .label("visit_count"),
        )
        .where(page_metrics.PageMetric.url == normalized_url)
        .order_by(desc(page_metrics.PageMetric.datetime_visited))
        .first()
    )

    if latest is None:
        return None

    visit_obj, visit_count = latest
    last_visited_str = format_datetime(visit_obj.datetime_visited)

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
