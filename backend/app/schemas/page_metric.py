from datetime import datetime
from pydantic import BaseModel, HttpUrl


class PageMetricBase(BaseModel):
    url: HttpUrl
    link_count: int
    word_count: int
    image_count: int


class PageMetricCreateDTO(PageMetricBase):
    datetime_visited: datetime | None = None


class PageMetric(PageMetricBase):
    id: int
    datetime_visited: datetime

    class Config:
        orm_mode = True


class PageMetrics(BaseModel):
    url: HttpUrl
    link_count: int
    word_count: int
    image_count: int
    last_visited: datetime | None
    visit_count: int
