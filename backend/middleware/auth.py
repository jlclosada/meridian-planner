"""
Meridian Planner — Authentication Middleware
"""
from __future__ import annotations

from functools import wraps
from typing import Callable

from flask import jsonify, request

from services.store import store


def _extract_uid() -> str | None:
    """Extract user id from the Authorization header."""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return None
    return store.sessions.get(token)


def auth_required(fn: Callable) -> Callable:
    """Decorator — injects ``uid`` as first positional arg."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        uid = _extract_uid()
        if not uid or uid not in store.users:
            return jsonify({"error": "Unauthorized"}), 401
        return fn(uid, *args, **kwargs)

    return wrapper


def admin_required(fn: Callable) -> Callable:
    """Decorator — same as auth_required but also checks admin role."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        uid = _extract_uid()
        if not uid or uid not in store.users:
            return jsonify({"error": "Unauthorized"}), 401
        if store.users[uid].get("role") != "admin":
            return jsonify({"error": "Forbidden"}), 403
        return fn(uid, *args, **kwargs)

    return wrapper


def get_current_uid() -> str | None:
    """Non-decorator variant — returns uid or None."""
    return _extract_uid()

