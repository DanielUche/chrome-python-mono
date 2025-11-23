from datetime import datetime, timezone, timedelta
from typing import Any
import os

from app.constants import DATETIME_FORMAT

def format_datetime(dt: Any, tz_offset_hours: float | None = None) -> str:
    if isinstance(dt, datetime):
        if dt.tzinfo is not None:
            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    
        if tz_offset_hours is not None:
            local_dt = dt + timedelta(hours=tz_offset_hours)
        else:
            local_dt = dt.replace(tzinfo=timezone.utc).astimezone().replace(tzinfo=None)
        
        return local_dt.strftime(DATETIME_FORMAT)
    return str(dt)
