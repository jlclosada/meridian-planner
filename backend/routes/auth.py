"""
Meridian Planner — Auth Routes
"""
from flask import Blueprint, jsonify, request

from middleware.auth import auth_required
from services.auth_service import auth_service

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    try:
        result = auth_service.login(
            email=data.get("email", ""),
            password=data.get("password", ""),
            name=data.get("name"),
        )
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 401


@bp.route("/me", methods=["GET"])
@auth_required
def me(uid: str):
    user = auth_service.get_user(uid)
    return jsonify(user)


@bp.route("/me", methods=["PATCH"])
@auth_required
def update_me(uid: str):
    data = request.json or {}
    user = auth_service.update_user(uid, data)
    return jsonify(user)

