"""
Meridian Planner — Goal Model
"""
from __future__ import annotations

from datetime import date, timedelta

from models.base import build

_CATEGORY_COLORS = {
    "work": "#3B5EA6",
    "health": "#5C7A6A",
    "learning": "#7B4F8A",
    "personal": "#B8860B",
}

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
    # Auto-set color from category if not explicitly provided
    if "color" not in data:
        goal["color"] = _CATEGORY_COLORS.get(goal["category"], "#3B5EA6")
    return goal

