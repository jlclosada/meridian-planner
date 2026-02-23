"""
Meridian Planner — Task Model
"""
from __future__ import annotations

from models.base import build


_DEFAULTS = {
    "id": "",
    "title": "New task",
    "category": "personal",
    "priority": "medium",
    "status": "todo",
    "done": False,
    "date": None,
    "time": None,
    "duration": 30,
    "color": "#3B5EA6",
    "tags": [],
    "notes": "",
    "checklist": [],
    "recurring": None,
    "order": 0,
}


def create_task(data: dict, order: int = 0) -> dict:
    task = build(_DEFAULTS, data)
    task["order"] = data.get("order", order)
    # Ensure tags and checklist are proper lists (not references)
    task["tags"] = list(data.get("tags", []))
    task["checklist"] = list(data.get("checklist", []))
    return task


def sync_done_status(task: dict, data: dict) -> None:
    """Keep ``done`` and ``status`` in sync after a partial update."""
    if "status" in data and "done" not in data:
        task["done"] = data["status"] == "completed"
    elif "done" in data and "status" not in data:
        if data["done"] and task.get("status") != "completed":
            task["status"] = "completed"
        elif not data["done"] and task.get("status") == "completed":
            task["status"] = "todo"

