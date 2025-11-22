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

@db_router.get("/metrics", response_model=schemas.PageMetrics)
def get_metrics(url: str, request: Request) -> schemas.PageMetrics:
    db: Session = request.state.db
    metrics = page_metrics.get_latest_metrics_for_url(db, url=url)
    if metrics is None:
        raise URLNotVisitedException(url)
    return metrics


@db_router.get("/visits", response_model=list[schemas.PageMetric])
def list_visits(url: str, request: Request) -> list[schemas.PageMetric]:
    db: Session = request.state.db
    visits = page_metrics.get_visits_for_url(db, url=url)
    return visits


@db_router.post("/visits", response_model=schemas.PageMetric)
def create_visit(
    visit_in: schemas.PageMetricCreateDTO, request: Request
) -> schemas.PageMetric:
    db: Session = request.state.db
    visit = page_metrics.create_page_visit(db, visit_in)
    return visit
