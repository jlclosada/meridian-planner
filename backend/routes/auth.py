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


@bp.route("/signup", methods=["POST"])
def signup():
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password", "")
    name = data.get("name", "")
    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not name:
        return jsonify({"error": "Name is required"}), 400
    if len(password) < 4:
        return jsonify({"error": "Password must be at least 4 characters"}), 400
    try:
        result = auth_service.signup(email=email, password=password, name=name)
        return jsonify(result), 201
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 409


@bp.route("/google", methods=["POST"])
def google_login():
    """
    Accept a Google ID token, verify it (simplified for demo),
    and create or login the user.
    """
    data = request.json or {}
    token = data.get("token", "")
    if not token:
        return jsonify({"error": "Google token required"}), 400
    try:
        result = auth_service.google_login(token)
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


@bp.route("/logout", methods=["POST"])
@auth_required
def logout(uid: str):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    auth_service.logout(token)
    return jsonify({"ok": True})

