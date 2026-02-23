"""
Meridian Planner — Goal Model
"""
from __future__ import annotations

from datetime import date, timedelta

from models.base import build


_DEFAULTS = {
    "id": "",
    "title": "New Goal",
    "category": "personal",
    "color": "#3B5EA6",
    "target_date": (date.today() + timedelta(days=30)).isoformat(),
    "progress": 0,
    "milestones": [],
    "notes": "",
}


def create_goal(data: dict) -> dict:
    goal = build(_DEFAULTS, data)
    goal["milestones"] = list(data.get("milestones", []))
    return goal

