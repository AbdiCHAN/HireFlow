# backend_flask/app.py

from __future__ import annotations

import importlib
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from .auth_utils import ensure_core_tables


BASE_DIR = Path(__file__).resolve().parent


def create_app() -> Flask:
    load_dotenv(BASE_DIR.parent / ".env")

    app = Flask(__name__)
    app.url_map.strict_slashes = False

    app.config["SECRET_KEY"] = (
        os.getenv("JWT_SECRET_KEY")
        or os.getenv("SECRET_KEY")
        or "dev-secret-change-this-before-submission"
    )

    app.config["JSON_SORT_KEYS"] = False
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

    cors_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
    )

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [origin.strip() for origin in cors_origins.split(",")],
                "supports_credentials": True,
                "allow_headers": ["Content-Type", "Authorization"],
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            }
        },
    )

    logging.basicConfig(level=logging.INFO)

    ensure_core_tables()
    register_blueprints(app)

    @app.get("/")
    def root():
        return jsonify(
            {
                "message": "HireFlow2 Flask API is running",
                "status": "success",
                "docs": "/api/health",
            }
        ), 200

    @app.get("/api/health")
    def health_check():
        return jsonify(
            {
                "status": "success",
                "message": "Backend is healthy",
                "service": "HireFlow2 API",
            }
        ), 200

    @app.before_request
    def handle_options_request():
        if request.method == "OPTIONS":
            return "", 204

    @app.errorhandler(404)
    def not_found(error):
        return jsonify(
            {
                "status": "error",
                "message": "Route not found",
            }
        ), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify(
            {
                "status": "error",
                "message": "Method not allowed for this route",
            }
        ), 405

    @app.errorhandler(Exception)
    def internal_error(error):
        app.logger.exception("Unexpected server error: %s", error)

        return jsonify(
            {
                "status": "error",
                "message": "Internal server error",
            }
        ), 500

    return app


def register_blueprints(app: Flask) -> None:
    from .routes.auth import auth_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    optional_blueprints = [
        ("backend_flask.routes.jobs", "jobs_bp", "/api/jobs"),
        ("backend_flask.routes.cv", "cv_bp", "/api/cvs"),
        ("backend_flask.routes.applications", "applications_bp", "/api/applications"),
        ("backend_flask.routes.admin", "admin_bp", "/api/admin"),
        ("backend_flask.routes.api_keys", "api_keys_bp", "/api/api-keys"),
    ]

    for module_name, blueprint_name, url_prefix in optional_blueprints:
        try:
            module = importlib.import_module(module_name)
            blueprint = getattr(module, blueprint_name)
            app.register_blueprint(blueprint, url_prefix=url_prefix)
            app.logger.info("Registered blueprint: %s", module_name)

        except ModuleNotFoundError as error:
            app.logger.info(
                "Optional route file unavailable: %s (%s)",
                module_name,
                error,
            )
            continue

        except AttributeError:
            app.logger.warning(
                "Blueprint %s was not found inside %s",
                blueprint_name,
                module_name,
            )


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=os.getenv("FLASK_DEBUG", "true").lower() == "true",
    )
