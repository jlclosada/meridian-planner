"""
Meridian Planner — Admin Routes
"""
from flask import Blueprint, jsonify

from middleware.auth import admin_required
from services.store import store

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@bp.route("/stats", methods=["GET"])
@admin_required
def stats(uid: str):
    return jsonify(
        {
            "users": len(store.users),
            "tasks": sum(len(v) for v in store.tasks.values()),
            "habits": sum(len(v) for v in store.habits.values()),
            "goals": sum(len(v) for v in store.goals.values()),
            "notes": sum(len(v) for v in store.notes.values()),
            "sessions": len(store.sessions),
            "user_list": [
                {
                    "id": u["id"],
                    "name": u["name"],
                    "email": u["email"],
                    "role": u.get("role", "user"),
                }
                for u in store.users.values()
            ],
        }
    )

