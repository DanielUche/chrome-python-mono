from datetime import datetime
from typing import Any

from app.constants import DATETIME_FORMAT


def format_datetime(dt: Any) -> str:
    if isinstance(dt, datetime):
        # Convert UTC datetime to local timezone
        if dt.tzinfo is not None:
            # If datetime has timezone info, convert to local time
            local_dt = dt.astimezone()
        else:
            # If naive datetime, assume it's already local
            local_dt = dt
        return local_dt.strftime(DATETIME_FORMAT)
    return str(dt)
