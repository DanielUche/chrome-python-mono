from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..config import get_db
from ..schemas import page_metric as schemas
from ..services import page_metric_services

db_router = APIRouter(
    prefix="",
    tags=["history"],
    dependencies=[Depends(get_db)]
)


@db_router.get("/metrics", response_model=schemas.PageMetrics)
def get_metrics(url: str, request: Request):
    db: Session = request.state.db
    metrics = page_metric_services.get_latest_metrics_for_url(db, url=url)
    if metrics is None:
        raise HTTPException(status_code=404, detail="No visits recorded for this URL")
    return metrics


@db_router.get("/visits", response_model=list[schemas.PageMetric])
def list_visits(url: str, request: Request):
    db: Session = request.state.db
    visits = page_metric_services.get_visits_for_url(db, url=url)
    return visits


@db_router.post("/visits", response_model=schemas.PageMetric)
def create_visit(visit_in: schemas.PageMetricCreateDTO, request: Request):
    db: Session = request.state.db
    visit = page_metric_services.create_page_visit(db, visit_in)
    return visit