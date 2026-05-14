import os
import signal
import sys
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from app.extensions import db
from app.routes.auth import auth_bp
from app.routes.jobs import jobs_bp
from app.routes.cv import cv_bp
from app.routes.applications import applications_bp
from app.routes.admin import admin_bp
from app.routes.api_keys import api_keys_bp


load_dotenv()


def create_app():
    app = Flask(__name__)

    BASE_DIR = Path(__file__).resolve().parent

    # Config
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'instance' / 'hireflow.db'}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["REMOTIVE_API_URL"] = os.getenv(
        "REMOTIVE_API_URL",
        "https://remotive.com/api/remote-jobs"
    )

    # Enable CORS
    CORS(app)

    # Ensure folders exist
    uploads_dir = BASE_DIR / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    instance_dir = BASE_DIR / "instance"
    instance_dir.mkdir(parents=True, exist_ok=True)

    # Initialize database
    db.init_app(app)

    with app.app_context():
        db.create_all()

    # Routes
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
    app.register_blueprint(cv_bp, url_prefix="/api/cv")
    app.register_blueprint(applications_bp, url_prefix="/api/applications")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(api_keys_bp, url_prefix="/api/api-keys")

    # Health check
    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    # Serve frontend in production
    dist_path = BASE_DIR.parent / "dist"

    if dist_path.exists():
        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_frontend(path):
            requested_file = dist_path / path

            if path and requested_file.exists():
                return send_from_directory(dist_path, path)

            return send_from_directory(dist_path, "index.html")

    return app


app = create_app()


def shutdown_handler(signal_received, frame):
    print("Shutting down gracefully...")
    sys.exit(0)


signal.signal(signal.SIGINT, shutdown_handler)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))

    print(f"Backend server running on http://localhost:{port}")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true"
    )