"""
Meridian Planner — Event Model
"""
from __future__ import annotations

from datetime import date

from models.base import build


_DEFAULTS = {
    "id": "",
    "title": "New Event",
    "category": "personal",
    "start_date": date.today().isoformat(),
    "end_date": date.today().isoformat(),
    "start_time": None,
    "end_time": None,
    "color": "#3B5EA6",
    "all_day": True,
    "notes": "",
    "location": "",
}


def create_event(data: dict) -> dict:
    return build(_DEFAULTS, data)

