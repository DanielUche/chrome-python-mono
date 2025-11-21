from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from ..config import Base


class PageMetric(Base):
    __tablename__ = "page_metrics"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True, nullable=False)
    datetime_visited = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    link_count = Column(Integer, nullable=False)
    word_count = Column(Integer, nullable=False)
    image_count = Column(Integer, nullable=False)
