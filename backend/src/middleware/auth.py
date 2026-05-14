import os
import jwt
from functools import wraps
from datetime import datetime, timedelta, timezone
from flask import request, jsonify, g


def get_secret_key():
    secret = os.getenv("ACCESS_TOKEN_SECRET")

    if not secret:
        print(
            "WARNING: ACCESS_TOKEN_SECRET is not set. "
            "Using development fallback secret. Do NOT use in production."
        )
        secret = "hireflow-dev-secret"

    return secret


def authenticate_token(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "error": "Authentication token is required"
            }), 401

        parts = auth_header.split(" ")

        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "error": "Invalid authorization header format"
            }), 401

        token = parts[1]

        try:
            user = jwt.decode(
                token,
                get_secret_key(),
                algorithms=["HS256"]
            )

            g.user = user

        except jwt.ExpiredSignatureError:
            return jsonify({
                "error": "Invalid or expired token"
            }), 403

        except jwt.InvalidTokenError:
            return jsonify({
                "error": "Invalid or expired token"
            }), 403

        return func(*args, **kwargs)

    return wrapper


def authorize_role(roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user = getattr(g, "user", None)

            if not user:
                return jsonify({
                    "error": "Authentication token is required"
                }), 401

            if user.get("role") not in roles:
                return jsonify({
                    "error": "Insufficient permissions"
                }), 403

            return func(*args, **kwargs)

        return wrapper

    return decorator


def make_token(user):
    payload = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }

    return jwt.encode(
        payload,
        get_secret_key(),
        algorithm="HS256"
    )


def normalize_role(role=None, user_type=None):
    selected_role = role or user_type or "user"
    selected_role = str(selected_role).lower().strip()

    allowed_roles = ["user", "manager", "admin"]

    if selected_role not in allowed_roles:
        return "user"

    return selected_role