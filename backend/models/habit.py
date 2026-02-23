"""
Meridian Planner — Habit Model
"""
from __future__ import annotations

from datetime import date, timedelta

from models.base import build


_DEFAULTS = {
    "id": "",
    "name": "New Habit",
    "icon": "⭐",
    "color": "#3B5EA6",
    "category": "personal",
    "target_days": "daily",
    "completions": [],
    "reminder": None,
    "streak": 0,
    "best_streak": 0,
}


def create_habit(data: dict) -> dict:
    habit = build(_DEFAULTS, data)
    habit["completions"] = list(data.get("completions", []))
    return habit


def recalculate_streak(habit: dict) -> None:
    """Walk backwards from today counting consecutive completions."""
    streak = 0
    check = date.today()
    while check.isoformat() in habit.get("completions", []):
        streak += 1
        check -= timedelta(days=1)
    habit["streak"] = streak
    habit["best_streak"] = max(habit.get("best_streak", 0), streak)

