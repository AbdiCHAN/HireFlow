from __future__ import annotations

import hashlib
import secrets
from typing import Any

from flask import Blueprint, jsonify, request

from ..auth_utils import get_current_user, get_db_connection, token_required


api_keys_bp = Blueprint("api_keys", __name__)


def serialize_key(row) -> dict[str, Any]:
    key = dict(row)

    return {
        "id": key["id"],
        "name": key["name"],
        "keyPreview": key["key_preview"],
        "isActive": bool(key["is_active"]),
        "createdAt": key.get("created_at"),
        "updatedAt": key.get("updated_at") or key.get("created_at"),
        "lastUsed": key.get("last_used_at"),
    }


@api_keys_bp.get("/")
@token_required
def list_api_keys():
    user = get_current_user()

    with get_db_connection() as conn:
        rows = conn.execute(
            """
            SELECT *
            FROM api_keys
            WHERE user_id = ?
            ORDER BY datetime(created_at) DESC, id DESC
            """,
            (user["id"],),
        ).fetchall()

    return jsonify({"data": [serialize_key(row) for row in rows]})


@api_keys_bp.post("/")
@token_required
def create_api_key():
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    name = str(data.get("name") or "HireFlow API Key").strip() or "HireFlow API Key"
    raw_key = f"hf_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
    preview = f"{raw_key[:8]}...{raw_key[-4:]}"

    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO api_keys (user_id, name, key_hash, key_preview, is_active, updated_at)
            VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
            """,
            (user["id"], name, key_hash, preview),
        )
        row = conn.execute(
            "SELECT * FROM api_keys WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()

    return jsonify({
        "message": "API key created. Copy it now; it will not be shown again.",
        "data": {
            **serialize_key(row),
            "key": raw_key,
        },
    }), 201


@api_keys_bp.patch("/<int:key_id>/toggle")
@token_required
def toggle_api_key(key_id: int):
    user = get_current_user()

    with get_db_connection() as conn:
        key = conn.execute(
            "SELECT * FROM api_keys WHERE id = ? AND user_id = ?",
            (key_id, user["id"]),
        ).fetchone()

        if not key:
            return jsonify({"error": "API key not found"}), 404

        conn.execute(
            """
            UPDATE api_keys
            SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
            """,
            (key_id, user["id"]),
        )
        updated_key = conn.execute(
            "SELECT * FROM api_keys WHERE id = ? AND user_id = ?",
            (key_id, user["id"]),
        ).fetchone()

    return jsonify({
        "message": "API key updated",
        "data": serialize_key(updated_key),
    })


@api_keys_bp.delete("/<int:key_id>")
@token_required
def revoke_api_key(key_id: int):
    user = get_current_user()

    with get_db_connection() as conn:
        key = conn.execute(
            "SELECT id FROM api_keys WHERE id = ? AND user_id = ?",
            (key_id, user["id"]),
        ).fetchone()

        if not key:
            return jsonify({"error": "API key not found"}), 404

        conn.execute(
            "DELETE FROM api_keys WHERE id = ? AND user_id = ?",
            (key_id, user["id"]),
        )

    return jsonify({"message": "API key revoked successfully"})
