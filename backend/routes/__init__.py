"""
Meridian Planner — Routes Package

Registers all API blueprints on the Flask app.
"""
from __future__ import annotations

from flask import Flask


def register_routes(app: Flask) -> None:
    from routes.auth import bp as auth_bp
    from routes.tasks import bp as tasks_bp
    from routes.habits import bp as habits_bp
    from routes.events import bp as events_bp
    from routes.routines import bp as routines_bp
    from routes.goals import bp as goals_bp
    from routes.notes import bp as notes_bp
    from routes.dashboard import bp as dashboard_bp
    from routes.admin import bp as admin_bp
    from routes.health import bp as health_bp

    for blueprint in (
        auth_bp,
        tasks_bp,
        habits_bp,
        events_bp,
        routines_bp,
        goals_bp,
        notes_bp,
        dashboard_bp,
        admin_bp,
        health_bp,
    ):
        app.register_blueprint(blueprint)

