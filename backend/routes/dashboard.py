"""
Meridian Planner — Dashboard Route
"""
from flask import Blueprint, jsonify

from middleware.auth import auth_required
from services.dashboard_service import dashboard_service

bp = Blueprint("dashboard", __name__, url_prefix="/api")


@bp.route("/dashboard", methods=["GET"])
@auth_required
def dashboard(uid: str):
    stats = dashboard_service.get_stats(uid)
    return jsonify(stats)

