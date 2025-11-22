from fastapi import HTTPException


class URLNotVisitedException(HTTPException):
    """Raised when a URL has no visit records."""
    def __init__(self, url: str):
        super().__init__(
            status_code=404,
            detail=f"No visits recorded for URL: {url}",
        )

class DatabaseConnectionException(Exception):
    """Raised when database connection fails."""
    def __init__(self, message: str = "Failed to connect to database"):
        self.message = message
        super().__init__(self.message)


class MigrationException(Exception):
    """Raised when database migrations fail."""
    def __init__(self, message: str = "Failed to run database migrations"):
        self.message = message
        super().__init__(self.message)
