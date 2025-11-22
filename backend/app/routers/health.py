from fastapi import APIRouter
from app.constants import TAG_HEALTH

health_router = APIRouter(
    prefix="",
    tags=[TAG_HEALTH],
)

@health_router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@health_router.get("/")
def home() -> str:
    return "Welcome to the History Sidepanel API"
