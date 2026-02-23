"""
Meridian Planner — Task Routes
"""
from flask import Blueprint, jsonify, request

from middleware.auth import auth_required, get_current_uid
from models.task import create_task, sync_done_status
from services.store import store

bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


@bp.route("", methods=["GET"])
def list_tasks():
    uid = get_current_uid()
    if not uid:
        return jsonify([])

    tasks = list(store.get_collection(uid, "tasks"))

    # Filters
    date_filter = request.args.get("date")
    if date_filter:
        tasks = [t for t in tasks if t.get("date") == date_filter]

    week_filter = request.args.get("week")
    if week_filter:
        try:
            from datetime import datetime, timedelta

            year, wn = int(week_filter.split("-W")[0]), int(week_filter.split("-W")[1])
            start = datetime.strptime(f"{year}-W{wn:02d}-1", "%Y-W%W-%w").date()
            dates = {(start + timedelta(days=i)).isoformat() for i in range(7)}
            tasks = [t for t in tasks if t.get("date") in dates]
        except Exception:
            pass

    backlog = request.args.get("backlog")
    if backlog:
        tasks = [t for t in tasks if not t.get("date")]

    search = request.args.get("q", "").lower()
    if search:
        tasks = [
            t
            for t in tasks
            if search in t.get("title", "").lower()
            or search in t.get("notes", "").lower()
        ]

    tasks.sort(key=lambda t: (t.get("time") or "99:99", t.get("order", 0)))
    return jsonify(tasks)


@bp.route("", methods=["POST"])
@auth_required
def create(uid: str):
    data = request.json or {}
    order = len(store.get_collection(uid, "tasks"))
    task = create_task(data, order=order)
    store.add_item(uid, "tasks", task)
    return jsonify(task), 201


@bp.route("/<tid>", methods=["GET"])
def get_one(tid: str):
    uid = get_current_uid()
    if not uid:
        return jsonify({}), 404
    task = store.find_by_id(uid, "tasks", tid)
    if not task:
        return jsonify({}), 404
    return jsonify(task)


@bp.route("/<tid>", methods=["PATCH"])
@auth_required
def update(uid: str, tid: str):
    data = request.json or {}
    task = store.update_item(uid, "tasks", tid, data)
    if task is None:
        return jsonify({"error": "Not found"}), 404
    sync_done_status(task, data)
    return jsonify(task)


@bp.route("/<tid>", methods=["DELETE"])
@auth_required
def delete(uid: str, tid: str):
    store.delete_item(uid, "tasks", tid)
    return jsonify({"ok": True})


@bp.route("/reorder", methods=["POST"])
@auth_required
def reorder(uid: str):
    items = request.json or []
    for item in items:
        task = store.find_by_id(uid, "tasks", item.get("id", ""))
        if task:
            task["order"] = item.get("order", task["order"])
            if "date" in item:
                task["date"] = item["date"]
            if "time" in item:
                task["time"] = item["time"]
    return jsonify({"ok": True})

