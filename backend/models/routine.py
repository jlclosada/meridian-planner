"""
Meridian Planner — Routine Model
"""
from __future__ import annotations

from models.base import build


_DEFAULTS = {
    "id": "",
    "name": "New Routine",
    "icon": "🔄",
    "time": "08:00",
    "days": "daily",
    "color": "#3B5EA6",
    "steps": [],
    "duration": 30,
    "active": True,
}


def create_routine(data: dict) -> dict:
    routine = build(_DEFAULTS, data)
    routine["steps"] = list(data.get("steps", []))
    return routine

