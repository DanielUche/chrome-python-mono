from datetime import datetime
from typing import Any

from app.constants import DATETIME_FORMAT


def format_datetime(dt: Any) -> str:
    if isinstance(dt, datetime):
        return dt.strftime(DATETIME_FORMAT)
    return str(dt)
