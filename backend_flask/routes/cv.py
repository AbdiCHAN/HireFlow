from __future__ import annotations

from typing import Any

from flask import Blueprint, jsonify, request

from ..auth_utils import get_current_user, get_db_connection, token_required


cv_bp = Blueprint("cvs", __name__)


def serialize_cv(row) -> dict[str, Any] | None:
    if not row:
        return None

    cv = dict(row)

    return {
        "id": cv["id"],
        "userId": cv["user_id"],
        "fullName": cv.get("full_name") or "",
        "email": cv.get("email") or "",
        "phone": cv.get("phone") or "",
        "currentRole": cv.get("current_role") or "",
        "skills": cv.get("skills") or "",
        "summary": cv.get("summary") or "",
        "expectedSalary": cv.get("expected_salary") or "",
        "fileName": cv.get("original_filename") or "profile.json",
        "createdAt": cv.get("created_at"),
    }


@cv_bp.get("/me")
@token_required
def get_my_cv():
    user = get_current_user()

    with get_db_connection() as conn:
        row = conn.execute(
            """
            SELECT *
            FROM cvs
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (user["id"],),
        ).fetchone()

    return jsonify({"data": serialize_cv(row)})


@cv_bp.post("/")
@token_required
def upsert_cv():
    user = get_current_user()
    data = request.get_json(silent=True) or {}

    fields: dict[str, Any] = {
        "full_name": str(data.get("fullName") or data.get("full_name") or user["name"]).strip(),
        "email": str(data.get("email") or user["email"]).strip(),
        "phone": str(data.get("phone") or "").strip(),
        "current_role": str(data.get("currentRole") or data.get("current_role") or "").strip(),
        "skills": str(data.get("skills") or "").strip(),
        "summary": str(data.get("summary") or "").strip(),
        "expected_salary": str(data.get("expectedSalary") or data.get("expected_salary") or "").strip(),
    }

    with get_db_connection() as conn:
        existing = conn.execute(
            "SELECT id FROM cvs WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            (user["id"],),
        ).fetchone()

        if existing:
            conn.execute(
                """
                UPDATE cvs
                SET full_name = ?, email = ?, phone = ?, current_role = ?,
                    skills = ?, summary = ?, expected_salary = ?
                WHERE id = ? AND user_id = ?
                """,
                (
                    fields["full_name"],
                    fields["email"],
                    fields["phone"],
                    fields["current_role"],
                    fields["skills"],
                    fields["summary"],
                    fields["expected_salary"],
                    existing["id"],
                    user["id"],
                ),
            )
            cv_id = existing["id"]
        else:
            cursor = conn.execute(
                """
                INSERT INTO cvs (
                    user_id, original_filename, stored_filename, file_path,
                    full_name, email, phone, current_role, skills, summary, expected_salary
                )
                VALUES (?, 'profile.json', 'profile.json', 'profile.json', ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user["id"],
                    fields["full_name"],
                    fields["email"],
                    fields["phone"],
                    fields["current_role"],
                    fields["skills"],
                    fields["summary"],
                    fields["expected_salary"],
                ),
            )
            cv_id = cursor.lastrowid

        row = conn.execute("SELECT * FROM cvs WHERE id = ?", (cv_id,)).fetchone()

    return jsonify({
        "message": "Profile saved successfully",
        "data": serialize_cv(row),
    })
