from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.config.logger import get_logger

logger = get_logger(__name__)


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """
    Middleware to validate incoming requests.
    - Ensures request body size limits
    - Validates content types for POST/PUT requests
    """
    
    MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10 MB max request size
    
    async def dispatch(self, request: Request, call_next):
        # Check content length if present
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                content_length = int(content_length)
                if content_length > self.MAX_REQUEST_SIZE:
                    client_host = request.client.host if request.client else "unknown"
                    logger.warning(f"Request too large: {content_length} bytes from {client_host}")
                    return JSONResponse(
                        status_code=413,
                        content={"detail": f"Request body too large. Maximum size: {self.MAX_REQUEST_SIZE} bytes"}
                    )
            except ValueError:
                pass
        
        # Validate content-type for POST/PUT requests
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            if not content_type.startswith(("application/json", "multipart/form-data", "application/x-www-form-urlencoded")):
                client_host = request.client.host if request.client else "unknown"
                logger.warning(f"Invalid content-type: {content_type} from {client_host}")
                return JSONResponse(
                    status_code=415,
                    content={"detail": "Unsupported media type. Use application/json"}
                )
        
        response = await call_next(request)
        return response
