"""
Meridian Planner — Event Routes
"""
from flask import Blueprint, jsonify, request

from middleware.auth import auth_required, get_current_uid
from models.event import create_event
from services.store import store

bp = Blueprint("events", __name__, url_prefix="/api/events")


@bp.route("", methods=["GET"])
def list_events():
    uid = get_current_uid()
    if not uid:
        return jsonify([])

    events = list(store.get_collection(uid, "events"))
    month = request.args.get("month")
    if month:
        events = [
            e
            for e in events
            if e["start_date"].startswith(month) or e["end_date"].startswith(month)
        ]
    return jsonify(events)


@bp.route("", methods=["POST"])
@auth_required
def create(uid: str):
    data = request.json or {}
    event = create_event(data)
    store.add_item(uid, "events", event)
    return jsonify(event), 201


@bp.route("/<eid>", methods=["GET"])
def get_one(eid: str):
    uid = get_current_uid()
    if not uid:
        return jsonify({}), 404
    event = store.find_by_id(uid, "events", eid)
    if not event:
        return jsonify({}), 404
    return jsonify(event)


@bp.route("/<eid>", methods=["PATCH"])
@auth_required
def update(uid: str, eid: str):
    data = request.json or {}
    event = store.update_item(uid, "events", eid, data)
    if event is None:
        return jsonify({"error": "Not found"}), 404
    return jsonify(event)


@bp.route("/<eid>", methods=["DELETE"])
@auth_required
def delete(uid: str, eid: str):
    store.delete_item(uid, "events", eid)
    return jsonify({"ok": True})

