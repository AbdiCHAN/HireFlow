import os
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request, g
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import User
from ..auth_utils import authenticate_token


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


ALLOWED_ROLES = {"job_seeker", "employer", "admin"}


def get_secret_key():
    secret = os.getenv("ACCESS_TOKEN_SECRET")

    if not secret:
        print(
            "WARNING: ACCESS_TOKEN_SECRET is not set. "
            "Using development fallback secret. Do NOT use in production."
        )
        secret = "hireflow-dev-secret"

    return secret


def normalize_role(role=None, user_type=None):
    if role == "recruiter" or user_type == "recruiter":
        return "employer"

    if role == "candidate" or user_type == "candidate":
        return "job_seeker"

    if role in ALLOWED_ROLES:
        return role

    return "job_seeker"


def hash_password(password):
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(rounds=10)
    ).decode("utf-8")


def password_matches(password, password_hash):
    return bcrypt.checkpw(
        password.encode("utf-8"),
        password_hash.encode("utf-8")
    )


def create_token(user):
    payload = {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }

    return jwt.encode(
        payload,
        get_secret_key(),
        algorithm="HS256"
    )


def user_to_auth_dict(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    }


def register_user():
    try:
        data = request.get_json(silent=True) or {}

        email = data.get("email")
        password = data.get("password")
        role = data.get("role")
        user_type = data.get("userType")
        username = data.get("username") or data.get("fullName")

        normalized_role = normalize_role(role, user_type)

        if not username or not email or not password:
            return jsonify({
                "error": "Username, email, and password are required"
            }), 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({
                "error": "User with this email already exists"
            }), 409

        existing_username = User.query.filter_by(username=username).first()
        if existing_username:
            return jsonify({
                "error": "Username already taken"
            }), 409

        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role=normalized_role
        )

        db.session.add(user)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({
                "error": "User already exists"
            }), 409

        token = create_token(user)

        return jsonify({
            "message": "User registered successfully",
            "token": token,
            "user": user_to_auth_dict(user)
        }), 201

    except Exception as error:
        print("Register error:", error)
        return jsonify({
            "error": "Internal server error"
        }), 500


@auth_bp.post("/register")
def register():
    return register_user()


@auth_bp.post("/signup")
def signup():
    return register_user()


@auth_bp.post("/login")
def login():
    try:
        data = request.get_json(silent=True) or {}

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({
                "error": "Email and password are required"
            }), 400

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({
                "error": "Invalid credentials"
            }), 401

        if not password_matches(password, user.password_hash):
            return jsonify({
                "error": "Invalid credentials"
            }), 401

        token = create_token(user)

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": user_to_auth_dict(user)
        })

    except Exception as error:
        print("Login error:", error)
        return jsonify({
            "error": "Internal server error"
        }), 500


@auth_bp.get("/me")
@authenticate_token
def me():
    try:
        user_id = g.user.get("id")

        user = db.session.get(User, user_id)

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        return jsonify(user_to_auth_dict(user))

    except Exception as error:
        print("Get me error:", error)
        return jsonify({
            "error": "Internal server error"
        }), 500