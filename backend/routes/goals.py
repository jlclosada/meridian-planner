"""
Meridian Planner — Goal Routes
"""
from flask import Blueprint, jsonify, request

from middleware.auth import auth_required, get_current_uid
from models.goal import create_goal
from services.store import store

bp = Blueprint("goals", __name__, url_prefix="/api/goals")


@bp.route("", methods=["GET"])
def list_goals():
    uid = get_current_uid()
    if not uid:
        return jsonify([])
    return jsonify(store.get_collection(uid, "goals"))


@bp.route("", methods=["POST"])
@auth_required
def create(uid: str):
    data = request.json or {}
    goal = create_goal(data)
    store.add_item(uid, "goals", goal)
    return jsonify(goal), 201


@bp.route("/<gid>", methods=["GET"])
def get_one(gid: str):
    uid = get_current_uid()
    if not uid:
        return jsonify({}), 404
    goal = store.find_by_id(uid, "goals", gid)
    if not goal:
        return jsonify({}), 404
    return jsonify(goal)


@bp.route("/<gid>", methods=["PATCH"])
@auth_required
def update(uid: str, gid: str):
    data = request.json or {}
    goal = store.update_item(uid, "goals", gid, data)
    if goal is None:
        return jsonify({"error": "Not found"}), 404
    return jsonify(goal)


@bp.route("/<gid>", methods=["DELETE"])
@auth_required
def delete(uid: str, gid: str):
    store.delete_item(uid, "goals", gid)
    return jsonify({"ok": True})

