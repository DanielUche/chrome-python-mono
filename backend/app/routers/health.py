from fastapi import APIRouter, Request
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime
from app.constants import TAG_HEALTH, APP_VERSION

health_router = APIRouter(
    prefix="",
    tags=[TAG_HEALTH],
)

@health_router.get("/health")
def health_check(request: Request) -> dict:
    """
    Enhanced health check endpoint with database connectivity status.
    
    Returns:
        dict: Health status including timestamp, version, and database connectivity
    """
    health_status = {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": APP_VERSION,
        "checks": {
            "database": "unknown"
        }
    }
    
    # Check database connectivity
    try:
        db: Session = request.state.db
        db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = "healthy"
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["checks"]["database"] = f"unhealthy: {str(e)}"
    
    return health_status


@health_router.get("/")
def home() -> str:
    return "Welcome to the History Sidepanel API"
