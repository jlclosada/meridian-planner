"""
Meridian Planner — Routine Routes
"""
from flask import Blueprint, jsonify, request

from middleware.auth import auth_required, get_current_uid
from models.routine import create_routine
from services.store import store

bp = Blueprint("routines", __name__, url_prefix="/api/routines")


@bp.route("", methods=["GET"])
def list_routines():
    uid = get_current_uid()
    if not uid:
        return jsonify([])
    return jsonify(store.get_collection(uid, "routines"))


@bp.route("", methods=["POST"])
@auth_required
def create(uid: str):
    data = request.json or {}
    routine = create_routine(data)
    store.add_item(uid, "routines", routine)
    return jsonify(routine), 201


@bp.route("/<rid>", methods=["PATCH"])
@auth_required
def update(uid: str, rid: str):
    data = request.json or {}
    routine = store.update_item(uid, "routines", rid, data)
    if routine is None:
        return jsonify({"error": "Not found"}), 404
    return jsonify(routine)


@bp.route("/<rid>", methods=["DELETE"])
@auth_required
def delete(uid: str, rid: str):
    store.delete_item(uid, "routines", rid)
    return jsonify({"ok": True})

