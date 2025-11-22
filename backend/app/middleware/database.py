
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.config.db import SessionLocal


class DatabaseMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        db = SessionLocal()
        request.state.db = db
        try:
            response = await call_next(request)
        finally:
            db.close()
        return response
