"""
Meridian Planner — Application Entry Point

This is the only file that creates and configures the Flask application.
All route handlers, models and services live in their own modules.
"""
from flask import Flask
from flask_cors import CORS

from config import get_config
from routes import register_routes
from seed import seed


def create_app() -> Flask:
    """Application factory."""
    cfg = get_config()

    app = Flask(__name__)
    app.secret_key = cfg.SECRET_KEY

    CORS(app, supports_credentials=True, origins=cfg.CORS_ORIGINS)

    # Register all API blueprints
    register_routes(app)

    # Populate demo data
    seed()

    return app


# Gunicorn / direct-run entry point
app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)

