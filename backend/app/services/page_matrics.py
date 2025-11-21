from datetime import datetime, timezone

from sqlalchemy import select, desc, func
from sqlalchemy.orm import Session
from collections.abc import Sequence
from pydantic import HttpUrl

from ..models import page_metrics
from ..schemas import page_metric as page_metric_schemas

def create_page_visit(db: Session, visit_in: page_metric_schemas.PageMetricCreateDTO) -> page_metrics.PageMetric:
    visit = page_metrics.PageMetric(
        url=str(visit_in.url),
        datetime_visited=visit_in.datetime_visited or datetime.now(timezone.utc),
        link_count=visit_in.link_count,
        word_count=visit_in.word_count,
        image_count=visit_in.image_count,
    )
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit

def get_visits_for_url(db: Session, url: str, limit: int = 50) -> Sequence[page_metrics.PageMetric]:
    stmt = (
        select(page_metrics.PageMetric)
        .where(page_metrics.PageMetric.url == url)
        .order_by(desc(page_metrics.PageMetric.datetime_visited))
        .limit(limit)
    )
    return db.execute(stmt).scalars().all()


def get_latest_metrics_for_url(db: Session, url: str) -> page_metric_schemas.PageMetrics | None:
    latest_stmt = (
        select(page_metrics.PageMetric)
        .where(page_metrics.PageMetric.url == url)
        .order_by(desc(page_metrics.PageMetric.datetime_visited))
        .limit(1)
    )
    latest = db.execute(latest_stmt).scalar_one_or_none()
    if latest is None:
        return None

    count_stmt = select(func.count(page_metrics.PageMetric.id)).where(
        page_metrics.PageMetric.url == url
    )
    visit_count = db.execute(count_stmt).scalar_one() or 0

    return page_metric_schemas.PageMetrics.model_validate(
        {
            "url": latest.url,
            "link_count": latest.link_count,
            "word_count": latest.word_count,
            "image_count": latest.image_count,
            "last_visited": latest.datetime_visited,
            "visit_count": visit_count,
        }
    )
