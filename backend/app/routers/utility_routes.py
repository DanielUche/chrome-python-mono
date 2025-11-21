from fastapi import APIRouter

utility_router = APIRouter(
    prefix="",
    tags=["utility"],
)


@utility_router.get("/health")
def health_check():
    return {"status": "ok"}
