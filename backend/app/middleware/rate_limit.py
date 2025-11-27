from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from slowapi.errors import RateLimitExceeded

# Rate limiting configurations centralized in one place
READ_RATE_LIMIT = "300/minute"   # GET endpoints - 300 requests per minute per IP (5 requests/second) - Development setting
WRITE_RATE_LIMIT = "60/minute"   # POST/PUT/DELETE endpoints - 60 requests per minute per IP (1 request/second)

# Create rate limiter instance
limiter = Limiter(key_func=get_remote_address)


def get_rate_limiter():
    """Get the rate limiter instance."""
    return limiter


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to apply rate limits based on HTTP method."""
    
    async def dispatch(self, request: Request, call_next):
        # Apply different rate limits based on HTTP method
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            rate_limit = READ_RATE_LIMIT
        else:  # POST, PUT, DELETE, PATCH
            rate_limit = WRITE_RATE_LIMIT
        
        # Apply rate limit by checking directly
        try:
            # Create a dummy function that takes request as parameter (must be named 'request')
            @limiter.limit(rate_limit)
            async def _check_rate_limit(request: Request):
                pass
            
            await _check_rate_limit(request)
        except RateLimitExceeded:
            raise
        
        response = await call_next(request)
        return response
