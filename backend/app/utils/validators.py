from pydantic import HttpUrl

def validate_url(url: str) -> str:
    if not url:
        raise ValueError("URL cannot be empty")
    return url
