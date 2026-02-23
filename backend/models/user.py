"""
Meridian Planner — User Model
"""
from __future__ import annotations

from datetime import date


def default_user() -> dict:
    return {
        "id": "",
        "email": "",
        "name": "",
        "avatar": "",
        "timezone": "UTC",
        "created_at": date.today().isoformat(),
        "theme": "light",
        "week_start": "monday",
        "role": "user",
    }

