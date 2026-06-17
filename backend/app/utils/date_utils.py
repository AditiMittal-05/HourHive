from datetime import date, timedelta
from typing import Tuple


def get_week_start_end(d: date) -> Tuple[date, date]:
    """Returns Monday–Sunday for the week containing `d`."""
    start = d - timedelta(days=d.weekday())
    end = start + timedelta(days=6)
    return start, end


def get_month_date_range(month: int, year: int) -> Tuple[date, date]:
    import calendar
    first = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    last = date(year, month, last_day)
    return first, last


def working_days_in_range(start: date, end: date) -> int:
    count = 0
    current = start
    while current <= end:
        if current.weekday() < 5:  # Mon–Fri
            count += 1
        current += timedelta(days=1)
    return count
