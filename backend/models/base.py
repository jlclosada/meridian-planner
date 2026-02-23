"""
Meridian Planner — Base Model

Provides factory / validation helpers shared by all models.
"""
from __future__ import annotations

import uuid
from typing import Any


def new_id() -> str:
    """Generate a new unique identifier."""
    return str(uuid.uuid4())


def build(defaults: dict[str, Any], data: dict[str, Any]) -> dict[str, Any]:
    """
    Create a new model dict from *defaults*, overriding with values from
    *data* where keys match.  Always stamps a fresh ``id``.
    """
    result = {**defaults}
    for key in defaults:
        if key == "id":
            continue
        if key in data:
            result[key] = data[key]
    result["id"] = new_id()
    return result

