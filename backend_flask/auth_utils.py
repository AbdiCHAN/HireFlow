# backend_flask/auth_utils.py

from __future__ import annotations

import os
import re
import sqlite3
from datetime import datetime, timedelta, timezone
from functools import wraps
from pathlib import Path
from typing import Any, Callable

import jwt
from flask import current_app, g, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash


BASE_DIR = Path(__file__).resolve().parent
INSTANCE_DIR = BASE_DIR / "instance"
INSTANCE_DIR.mkdir(exist_ok=True)


def get_db_path() -> Path:
    custom_path = os.getenv("HIRE_FLOW_DB_PATH") or os.getenv("DATABASE_PATH")

    if custom_path:
        db_path = Path(custom_path)
    else:
        db_path = INSTANCE_DIR / "hireflow2.sqlite3"

    db_path.parent.mkdir(parents=True, exist_ok=True)

    return db_path


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")

    return conn


def ensure_core_tables() -> None:
    with get_db_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'job_seeker'
                    CHECK (role IN ('job_seeker', 'employer', 'admin')),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employer_id INTEGER,
                title TEXT NOT NULL,
                company TEXT NOT NULL,
                location TEXT,
                job_type TEXT,
                salary TEXT,
                description TEXT,
                source TEXT NOT NULL DEFAULT 'local',
                external_id TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS cvs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                original_filename TEXT NOT NULL,
                stored_filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                job_id INTEGER NOT NULL,
                cv_id INTEGER,
                cover_letter TEXT,
                status TEXT NOT NULL DEFAULT 'submitted'
                    CHECK (status IN ('submitted', 'reviewing', 'accepted', 'rejected')),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, job_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS api_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                key_hash TEXT NOT NULL,
                key_preview TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_used_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
            CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
            CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
            CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
            CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
            """
        )
        _add_column_if_missing(conn, "jobs", "category", "TEXT DEFAULT 'engineering'")
        _add_column_if_missing(conn, "jobs", "tags", "TEXT DEFAULT '[]'")
        _add_column_if_missing(conn, "jobs", "apply_url", "TEXT")
        _add_column_if_missing(conn, "jobs", "posted_at", "TEXT")
        _add_column_if_missing(conn, "jobs", "is_remote", "INTEGER NOT NULL DEFAULT 0")
        _add_column_if_missing(conn, "api_keys", "updated_at", "TEXT")
        _add_column_if_missing(conn, "cvs", "full_name", "TEXT")
        _add_column_if_missing(conn, "cvs", "email", "TEXT")
        _add_column_if_missing(conn, "cvs", "phone", "TEXT")
        _add_column_if_missing(conn, "cvs", "current_role", "TEXT")
        _add_column_if_missing(conn, "cvs", "skills", "TEXT")
        _add_column_if_missing(conn, "cvs", "summary", "TEXT")
        _add_column_if_missing(conn, "cvs", "expected_salary", "TEXT")
        _seed_jobs(conn)


def _add_column_if_missing(conn: sqlite3.Connection, table: str, column: str, sql_type: str) -> None:
    columns = {
        row["name"]
        for row in conn.execute(f"PRAGMA table_info({table})").fetchall()
    }

    if column not in columns:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {sql_type}")


def _seed_jobs(conn: sqlite3.Connection) -> None:
    existing_jobs = conn.execute("SELECT COUNT(*) AS total FROM jobs").fetchone()

    if existing_jobs and existing_jobs["total"] > 0:
        return

    seed_jobs = [
        (
            "Senior Independent Software Developer",
            "A.Team",
            "Americas, Europe, Israel",
            "contract",
            "$90 - $150 /hour",
            "You must be located in the Americas, Europe, or Israel to apply. A.Team is a VC-backed, stealth, application-only home of senior builders.",
            "engineering",
            '["go", "wordpress", "chat", "apple", "testing"]',
            "https://www.a.team/",
            1,
        ),
        (
            "Senior Independent AI Engineer / Architect",
            "A.Team",
            "Americas, Europe, Israel",
            "contract",
            "$120 - $170 /hour",
            "Join A.Team's invite-only network of senior builders and access high-trust AI engineering projects.",
            "engineering",
            '["AI", "UI/UX", "wordpress", "chat", "apple"]',
            "https://www.a.team/",
            1,
        ),
        (
            "Senior Full-stack Product Engineer",
            "Lemon.io",
            "Americas, Europe, Asia, Oceania",
            "contract",
            "$75 - $120 /hour",
            "Build production features for funded startups while working remotely with vetted teams and clear project scopes.",
            "development",
            '["react", "node", "postgres", "testing"]',
            "https://lemon.io/",
            1,
        ),
        (
            "Marketing Operations Lead",
            "Expion Health",
            "USA",
            "full-time",
            "$95k - $130k",
            "Own marketing operations, funnel reporting, automation, and campaign performance for a growing health technology company.",
            "marketing",
            '["hubspot", "analytics", "campaigns", "crm"]',
            "https://expionhealth.com/",
            0,
        ),
        (
            "Finance Systems Analyst",
            "Mitre Media",
            "USA, Canada, USA timezones",
            "full-time",
            "$80k - $115k",
            "Partner with finance and operations teams to improve reporting systems, forecasts, and recurring business insights.",
            "finance",
            '["excel", "sql", "forecasting", "reporting"]',
            "https://www.mitremedia.com/",
            1,
        ),
        (
            "Product Manager, Web Platforms",
            "Coalition Technologies",
            "Worldwide",
            "full-time",
            "$70k - $105k",
            "Lead delivery for distributed web teams, define scope, and keep client-facing product work moving with high clarity.",
            "management",
            '["roadmaps", "scrum", "web", "analytics"]',
            "https://coalitiontechnologies.com/",
            1,
        ),
    ]

    conn.executemany(
        """
        INSERT INTO jobs (
            title, company, location, job_type, salary, description, source,
            category, tags, apply_url, posted_at, is_remote
        )
        VALUES (?, ?, ?, ?, ?, ?, 'local', ?, ?, ?, CURRENT_TIMESTAMP, ?)
        """,
        seed_jobs,
    )


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None

    return dict(row)


def format_user(user: sqlite3.Row | dict[str, Any]) -> dict[str, Any]:
    user_dict = dict(user)

    return {
        "id": user_dict["id"],
        "full_name": user_dict["full_name"],
        "name": user_dict["full_name"],
        "username": user_dict["full_name"],
        "email": user_dict["email"],
        "role": user_dict["role"],
        "created_at": user_dict.get("created_at"),
        "updated_at": user_dict.get("updated_at"),
    }


def normalize_role(role: str | None = None, user_type: str | None = None) -> str:
    selected_role = role or user_type or "job_seeker"
    selected_role = str(selected_role).lower().strip()

    role_aliases = {
        "candidate": "job_seeker",
        "recruiter": "employer",
        "user": "job_seeker",
        "manager": "employer",
    }

    selected_role = role_aliases.get(selected_role, selected_role)

    if selected_role not in {"job_seeker", "employer", "admin"}:
        return "job_seeker"

    return selected_role


def normalize_email(email: str) -> str:
    return email.strip().lower()


def validate_email(email: str) -> bool:
    pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"

    return bool(re.match(pattern, email))


def validate_password(password: str) -> str | None:
    if len(password) < 8:
        return "Password must be at least 8 characters long."

    if not re.search(r"[A-Za-z]", password):
        return "Password must include at least one letter."

    if not re.search(r"\d", password):
        return "Password must include at least one number."

    return None


def hash_password(password: str) -> str:
    return generate_password_hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    return check_password_hash(password_hash, password)


def get_jwt_secret() -> str:
    return (
        current_app.config.get("SECRET_KEY")
        or os.getenv("JWT_SECRET_KEY")
        or os.getenv("SECRET_KEY")
        or "dev-secret-change-this-before-submission"
    )


def create_access_token(user: sqlite3.Row | dict[str, Any]) -> str:
    user_dict = dict(user)

    expiry_hours = int(os.getenv("JWT_EXPIRY_HOURS", "24"))
    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(user_dict["id"]),
        "email": user_dict["email"],
        "role": user_dict["role"],
        "iat": now,
        "exp": now + timedelta(hours=expiry_hours),
    }

    token = jwt.encode(payload, get_jwt_secret(), algorithm="HS256")

    if isinstance(token, bytes):
        token = token.decode("utf-8")

    return token


def make_token(user: sqlite3.Row | dict[str, Any]) -> str:
    return create_access_token(user)


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, get_jwt_secret(), algorithms=["HS256"])


def extract_bearer_token() -> str | None:
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return None

    return auth_header.replace("Bearer ", "", 1).strip()


def json_error(message: str, status_code: int):
    return jsonify(
        {
            "status": "error",
            "message": message,
        }
    ), status_code


def get_current_user() -> dict[str, Any] | None:
    return getattr(g, "current_user", None)


def token_required(view_function: Callable):
    @wraps(view_function)
    def wrapper(*args, **kwargs):
        if request.method == "OPTIONS":
            return "", 204

        token = extract_bearer_token()

        if not token:
            return json_error("Authorization token is missing. Use Bearer token.", 401)

        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")

            if not user_id:
                return json_error("Invalid token payload.", 401)

            with get_db_connection() as conn:
                user = conn.execute(
                    """
                    SELECT id, full_name, email, role, created_at, updated_at
                    FROM users
                    WHERE id = ?
                    """,
                    (user_id,),
                ).fetchone()

            if user is None:
                return json_error("User account no longer exists.", 401)

            g.current_user = format_user(user)
            g.user = g.current_user
            request.user = g.current_user

        except jwt.ExpiredSignatureError:
            return json_error("Session expired. Please log in again.", 401)

        except jwt.InvalidTokenError:
            return json_error("Invalid token. Please log in again.", 401)

        return view_function(*args, **kwargs)

    return wrapper


def authenticate_token(view_function: Callable):
    return token_required(view_function)


def require_roles(*allowed_roles: str):
    def decorator(view_function: Callable):
        @wraps(view_function)
        @token_required
        def wrapper(*args, **kwargs):
            current_user = get_current_user()

            if current_user is None:
                return json_error("Authentication required.", 401)

            if current_user["role"] not in allowed_roles:
                return json_error("You do not have permission to access this resource.", 403)

            return view_function(*args, **kwargs)

        return wrapper

    return decorator


def authorize_role(*allowed_roles: str):
    return require_roles(*allowed_roles)


def require_json_body() -> dict[str, Any] | None:
    data = request.get_json(silent=True)

    if data is None:
        return None

    return data
