"""
Meridian Planner — Habit Routes
"""
from datetime import date

from flask import Blueprint, jsonify, request

from middleware.auth import auth_required, get_current_uid
from models.habit import create_habit, recalculate_streak
from services.store import store

bp = Blueprint("habits", __name__, url_prefix="/api/habits")


@bp.route("", methods=["GET"])
def list_habits():
    uid = get_current_uid()
    if not uid:
        return jsonify([])
    return jsonify(store.get_collection(uid, "habits"))


@bp.route("", methods=["POST"])
@auth_required
def create(uid: str):
    data = request.json or {}
    habit = create_habit(data)
    store.add_item(uid, "habits", habit)
    return jsonify(habit), 201


@bp.route("/<hid>/toggle", methods=["POST"])
@auth_required
def toggle(uid: str, hid: str):
    data = request.json or {}
    d = data.get("date", date.today().isoformat())

    habit = store.find_by_id(uid, "habits", hid)
    if not habit:
        return jsonify({"error": "Not found"}), 404

    completions = habit.get("completions", [])
    if d in completions:
        completions.remove(d)
    else:
        completions.append(d)
    habit["completions"] = completions

    recalculate_streak(habit)
    return jsonify(habit)


@bp.route("/<hid>", methods=["PATCH"])
@auth_required
def update(uid: str, hid: str):
    data = request.json or {}
    habit = store.update_item(uid, "habits", hid, data)
    if habit is None:
        return jsonify({"error": "Not found"}), 404
    return jsonify(habit)


@bp.route("/<hid>", methods=["DELETE"])
@auth_required
def delete(uid: str, hid: str):
    store.delete_item(uid, "habits", hid)
    return jsonify({"ok": True})

