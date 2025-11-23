from datetime import datetime
from pydantic import BaseModel, HttpUrl, field_validator


class PageMetricBase(BaseModel):
    url: str  # Use str instead of HttpUrl to avoid automatic trailing slash addition
    link_count: int
    word_count: int
    image_count: int
    
    @field_validator('url', mode='before')
    @classmethod
    def normalize_url_input(cls, v):
        """Normalize URL by removing trailing slash."""
        if isinstance(v, str):
            # Validate it's a URL first
            try:
                HttpUrl(v)
            except Exception:
                raise ValueError(f"Invalid URL: {v}")
            # Remove trailing slash
            normalized = v.rstrip('/') or '/'
            return normalized
        # If it's already HttpUrl, convert to string and normalize
        if isinstance(v, HttpUrl):
            normalized = str(v).rstrip('/') or '/'
            return normalized
        return v
class PageMetricCreateDTO(PageMetricBase):
    datetime_visited: datetime | None = None
    timezone_offset: float | None = None  # Timezone offset in hours

class PageMetric(PageMetricBase):
    id: int
    datetime_visited: str

    class Config:
        from_attributes = True
class PageMetrics(BaseModel):
    url: str  # Use str instead of HttpUrl
    link_count: int
    word_count: int
    image_count: int
    last_visited: str | None
    visit_count: int
