"""
Meridian Planner — Note Routes
"""
from datetime import datetime

from flask import Blueprint, jsonify, request

from middleware.auth import auth_required, get_current_uid
from models.note import create_note
from services.store import store

bp = Blueprint("notes", __name__, url_prefix="/api/notes")


@bp.route("", methods=["GET"])
def list_notes():
    uid = get_current_uid()
    if not uid:
        return jsonify([])
    notes = store.get_collection(uid, "notes")
    # Pinned first, then by updated_at
    sorted_notes = sorted(
        notes, key=lambda n: (not n.get("pinned", False), n.get("updated_at", ""))
    )
    return jsonify(sorted_notes)


@bp.route("", methods=["POST"])
@auth_required
def create(uid: str):
    data = request.json or {}
    note = create_note(data)
    store.add_item(uid, "notes", note)
    return jsonify(note), 201


@bp.route("/<nid>", methods=["PATCH"])
@auth_required
def update(uid: str, nid: str):
    data = request.json or {}
    note = store.update_item(uid, "notes", nid, data)
    if note is None:
        return jsonify({"error": "Not found"}), 404
    note["updated_at"] = datetime.now().isoformat()
    return jsonify(note)


@bp.route("/<nid>", methods=["DELETE"])
@auth_required
def delete(uid: str, nid: str):
    store.delete_item(uid, "notes", nid)
    return jsonify({"ok": True})

