import sqlite3

from flask import Blueprint, jsonify, request

from ..auth_utils import (
    create_access_token,
    format_user,
    get_current_user,
    get_db_connection,
    hash_password,
    normalize_email,
    normalize_role,
    token_required,
    verify_password,
)


auth_bp = Blueprint("auth", __name__)


def register_user():
    data = request.get_json(silent=True) or {}

    email = data.get("email")
    password = data.get("password")
    username = data.get("username") or data.get("fullName")
    role = normalize_role(data.get("role"), data.get("userType"))

    if not username or not email or not password:
        return jsonify({
            "error": "Username, email, and password are required"
        }), 400

    email = normalize_email(email)
    username = str(username).strip()

    with get_db_connection() as conn:
        existing_user = conn.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,),
        ).fetchone()

        if existing_user:
            return jsonify({
                "error": "User with this email already exists"
            }), 409

        existing_username = conn.execute(
            "SELECT id FROM users WHERE lower(full_name) = lower(?)",
            (username,),
        ).fetchone()

        if existing_username:
            return jsonify({
                "error": "Username already taken"
            }), 409

        try:
            cursor = conn.execute(
                """
                INSERT INTO users (full_name, email, password_hash, role)
                VALUES (?, ?, ?, ?)
                """,
                (username, email, hash_password(password), role),
            )
        except sqlite3.IntegrityError:
            return jsonify({
                "error": "User already exists"
            }), 409

        user = conn.execute(
            """
            SELECT id, full_name, email, role, created_at, updated_at
            FROM users
            WHERE id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()

    token = create_access_token(user)

    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": format_user(user)
    }), 201


@auth_bp.post("/register")
def register():
    return register_user()


@auth_bp.post("/signup")
def signup():
    return register_user()


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    email = normalize_email(email)

    with get_db_connection() as conn:
        user = conn.execute(
            """
            SELECT id, full_name, email, password_hash, role, created_at, updated_at
            FROM users
            WHERE email = ?
            """,
            (email,),
        ).fetchone()

    if not user or not verify_password(user["password_hash"], password):
        return jsonify({
            "error": "Invalid credentials"
        }), 401

    return jsonify({
        "message": "Login successful",
        "token": create_access_token(user),
        "user": format_user(user)
    })


@auth_bp.get("/me")
@token_required
def me():
    user = get_current_user()

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify(user)
