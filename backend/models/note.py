"""
Meridian Planner — Note Model
"""
from __future__ import annotations

from datetime import datetime

from models.base import build


_DEFAULTS = {
    "id": "",
    "title": "New Note",
    "content": "",
    "color": "#FAF8F4",
    "pinned": False,
    "created_at": "",
    "updated_at": "",
}


def create_note(data: dict) -> dict:
    note = build(_DEFAULTS, data)
    now = datetime.now().isoformat()
    note["created_at"] = note.get("created_at") or now
    note["updated_at"] = note.get("updated_at") or now
    return note

