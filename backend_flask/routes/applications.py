from __future__ import annotations

from typing import Any

from flask import Blueprint, jsonify, request

from ..auth_utils import get_current_user, get_db_connection, token_required


applications_bp = Blueprint("applications", __name__)
VALID_STATUSES = {"submitted", "reviewing", "accepted", "rejected"}


def serialize_application(row) -> dict[str, Any]:
    app = dict(row)

    return {
        "id": app["id"],
        "userId": app["user_id"],
        "jobId": app["job_id"],
        "cvId": app.get("cv_id"),
        "coverLetter": app.get("cover_letter") or "",
        "status": app.get("status") or "submitted",
        "createdAt": app.get("created_at"),
        "updatedAt": app.get("updated_at"),
        "jobTitle": app.get("job_title"),
        "company": app.get("company"),
        "jobLocation": app.get("job_location"),
        "applicantName": app.get("applicant_name"),
        "applicantEmail": app.get("applicant_email"),
        "postedByUserId": app.get("employer_id"),
    }


def application_query(where_sql: str = "", values: tuple[Any, ...] = ()):
    with get_db_connection() as conn:
        return conn.execute(
            f"""
            SELECT
                applications.*,
                jobs.title AS job_title,
                jobs.company,
                jobs.location AS job_location,
                jobs.employer_id,
                users.full_name AS applicant_name,
                users.email AS applicant_email
            FROM applications
            JOIN jobs ON jobs.id = applications.job_id
            JOIN users ON users.id = applications.user_id
            {where_sql}
            ORDER BY datetime(applications.created_at) DESC, applications.id DESC
            """,
            values,
        ).fetchall()


@applications_bp.post("/")
@token_required
def create_application():
    user = get_current_user()
    data = request.get_json(silent=True) or {}

    try:
        job_id = int(data.get("jobId") or data.get("job_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "Valid jobId is required"}), 400

    cover_letter = str(data.get("coverLetter") or data.get("coverNote") or "").strip()

    with get_db_connection() as conn:
        job = conn.execute("SELECT id FROM jobs WHERE id = ?", (job_id,)).fetchone()

        if not job:
            return jsonify({"error": "Job not found"}), 404

        existing = conn.execute(
            "SELECT id FROM applications WHERE user_id = ? AND job_id = ?",
            (user["id"], job_id),
        ).fetchone()

        if existing:
            return jsonify({
                "error": "Already applied for this job",
                "data": {"id": existing["id"], "jobId": job_id, "status": "submitted"},
            }), 409

        cv = conn.execute(
            "SELECT id FROM cvs WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            (user["id"],),
        ).fetchone()

        cursor = conn.execute(
            """
            INSERT INTO applications (user_id, job_id, cv_id, cover_letter, status, updated_at)
            VALUES (?, ?, ?, ?, 'submitted', CURRENT_TIMESTAMP)
            """,
            (user["id"], job_id, cv["id"] if cv else None, cover_letter),
        )

    created = application_query("WHERE applications.id = ?", (cursor.lastrowid,))[0]

    return jsonify({
        "message": "Application submitted successfully",
        "data": serialize_application(created),
    }), 201


@applications_bp.get("/my")
@token_required
def my_applications():
    user = get_current_user()
    rows = application_query("WHERE applications.user_id = ?", (user["id"],))

    return jsonify({"data": [serialize_application(row) for row in rows]})


@applications_bp.get("/")
@token_required
def list_applications():
    user = get_current_user()

    if user["role"] == "admin":
        rows = application_query()
    elif user["role"] == "employer":
        rows = application_query("WHERE jobs.employer_id = ?", (user["id"],))
    else:
        rows = application_query("WHERE applications.user_id = ?", (user["id"],))

    return jsonify({"data": [serialize_application(row) for row in rows]})


@applications_bp.patch("/<int:application_id>/status")
@token_required
def update_status(application_id: int):
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    status = str(data.get("status") or "").strip().lower()

    if status not in VALID_STATUSES:
        return jsonify({"error": "Invalid application status"}), 400

    with get_db_connection() as conn:
        row = conn.execute(
            """
            SELECT applications.*, jobs.employer_id
            FROM applications
            JOIN jobs ON jobs.id = applications.job_id
            WHERE applications.id = ?
            """,
            (application_id,),
        ).fetchone()

        if not row:
            return jsonify({"error": "Application not found"}), 404

        if row["employer_id"] != user["id"] and user["role"] != "admin":
            return jsonify({"error": "Insufficient permissions"}), 403

        conn.execute(
            """
            UPDATE applications
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (status, application_id),
        )

    updated = application_query("WHERE applications.id = ?", (application_id,))[0]

    return jsonify({
        "message": "Application status updated",
        "data": serialize_application(updated),
    })


@applications_bp.delete("/<int:application_id>")
@token_required
def delete_application(application_id: int):
    user = get_current_user()

    with get_db_connection() as conn:
        row = conn.execute(
            """
            SELECT applications.*, jobs.employer_id
            FROM applications
            JOIN jobs ON jobs.id = applications.job_id
            WHERE applications.id = ?
            """,
            (application_id,),
        ).fetchone()

        if not row:
            return jsonify({"error": "Application not found"}), 404

        is_applicant = row["user_id"] == user["id"]
        is_employer = row["employer_id"] == user["id"]

        if not is_applicant and not is_employer and user["role"] != "admin":
            return jsonify({"error": "Insufficient permissions"}), 403

        conn.execute("DELETE FROM applications WHERE id = ?", (application_id,))

    return jsonify({"message": "Application deleted"})
