"""
Meridian Planner — Application Configuration
"""
import os


class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get("SECRET_KEY", "meridian-secret-2024")
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
    DEBUG = False


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    pass


_configs = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}


def get_config():
    env = os.environ.get("FLASK_ENV", "development")
    return _configs.get(env, DevelopmentConfig)

