import bcrypt
from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..auth_utils import authenticate_token, make_token, normalize_role
from ..extensions import db
from ..models import User


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


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

    if User.query.filter_by(email=email).first():
        return jsonify({
            "error": "User with this email already exists"
        }), 409

    if User.query.filter_by(username=username).first():
        return jsonify({
            "error": "Username already taken"
        }), 409

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role=role
    )

    db.session.add(user)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "error": "User already exists"
        }), 409

    token = make_token(user)

    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": user.to_auth_dict()
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

    user = User.query.filter_by(email=email).first()

    if not user or not password_matches(password, user.password_hash):
        return jsonify({
            "error": "Invalid credentials"
        }), 401

    return jsonify({
        "message": "Login successful",
        "token": make_token(user),
        "user": user.to_auth_dict()
    })


@auth_bp.get("/me")
@authenticate_token
def me():
    from flask import g

    user = db.session.get(User, g.user.get("id"))

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify(user.to_auth_dict())