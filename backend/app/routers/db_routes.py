from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ..config import get_db
from ..schemas import page_metric as schemas
from ..services import page_metric_services

db_router = APIRouter(
    prefix="",
    tags=["history"],
    dependencies=[Depends(get_db)]
)


def normalize_url_in_dict(data):
    """Recursively normalize URLs in dict/list by removing trailing slash."""
    if isinstance(data, dict):
        if 'url' in data and isinstance(data['url'], str):
            data['url'] = data['url'].rstrip('/') or '/'
        return data
    elif isinstance(data, list):
        return [normalize_url_in_dict(item) for item in data]
    return data


@db_router.get("/metrics")
def get_metrics(url: str, request: Request):
    db: Session = request.state.db
    metrics = page_metric_services.get_latest_metrics_for_url(db, url=url)
    if metrics is None:
        raise HTTPException(status_code=404, detail="No visits recorded for this URL")
    result = metrics.model_dump()
    result = normalize_url_in_dict(result)
    return JSONResponse(result)


@db_router.get("/visits")
def list_visits(url: str, limit: int = 50, request: Request = None):
    db: Session = request.state.db
    visits = page_metric_services.get_visits_for_url(db, url=url, limit=limit)
    if not visits:
        raise HTTPException(status_code=404, detail="No visits recorded for this URL")
    results = [v.model_dump() for v in visits]
    results = normalize_url_in_dict(results)
    return JSONResponse(results)


@db_router.post("/visits")
def create_visit(visit_in: schemas.PageMetricCreateDTO, request: Request):
    db: Session = request.state.db
    visit = page_metric_services.create_page_visit(db, visit_in)
    result = visit.model_dump()
    result = normalize_url_in_dict(result)
    return JSONResponse(result)