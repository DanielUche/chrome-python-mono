from __future__ import annotations

from typing import Optional, List
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.config import get_db
from app.constants import TAG_HISTORY
from app.exceptions import URLNotVisitedException
from app.schemas import page_metric as schemas
from app.services import page_metrics


db_router = APIRouter(
    prefix="",
    tags=[TAG_HISTORY],
    dependencies=[Depends(get_db)],
)

@db_router.get("/metrics", response_model=schemas.PageMetrics | None)
def get_metrics(
    request: Request,
    url: str,
    tz_offset: Optional[float] = None,
) -> schemas.PageMetrics | None:
    db: Session = request.state.db
    metrics = page_metrics.get_latest_metrics_for_url(db, url=url, tz_offset_hours=tz_offset)
    return metrics


@db_router.get("/visits", response_model=List[schemas.PageMetric])
def list_visits(
    request: Request,
    url: str,
    limit: int = 50,
    offset: int = 0,
    tz_offset: Optional[float] = None,
) -> List[schemas.PageMetric]:
    """
    Get paginated list of visits for a URL.
    
    Args:
        url: The URL to get visits for
        limit: Maximum number of results to return (default: 50, max: 100)
        offset: Number of results to skip for pagination (default: 0)
        tz_offset: Timezone offset in hours for datetime formatting
    """
    # Validate pagination parameters
    if limit < 1 or limit > 100:
        raise ValueError("Limit must be between 1 and 100")
    if offset < 0:
        raise ValueError("Offset must be non-negative")
    
    db: Session = request.state.db
    visits = page_metrics.get_visits_for_url(
        db, url=url, limit=limit, offset=offset, tz_offset_hours=tz_offset
    )
    return visits


@db_router.post("/visits", response_model=schemas.PageMetric)
def create_visit(
    request: Request,
    visit_in: schemas.PageMetricCreateDTO,
) -> schemas.PageMetric:
    db: Session = request.state.db
    visit = page_metrics.create_page_visit(db, visit_in)
    return visit
