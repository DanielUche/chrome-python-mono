from datetime import datetime, timezone

from sqlalchemy import select, desc, func
from sqlalchemy.orm import Session

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