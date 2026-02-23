"""
Meridian Planner — Health Check Route
"""
from datetime import datetime

from flask import Blueprint, jsonify

bp = Blueprint("health", __name__, url_prefix="/api")


@bp.route("/health")
def health():
    return jsonify({"status": "ok", "ts": datetime.now().isoformat()})

