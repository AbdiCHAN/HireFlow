from __future__ import annotations

from flask import Blueprint, jsonify

from ..auth_utils import get_db_connection, require_roles


admin_bp = Blueprint("admin", __name__)


@admin_bp.get("/overview")
@require_roles("admin")
def admin_overview():
    with get_db_connection() as conn:
        totals = {
            "totalUsers": conn.execute("SELECT COUNT(*) AS total FROM users").fetchone()["total"],
            "totalJobs": conn.execute("SELECT COUNT(*) AS total FROM jobs").fetchone()["total"],
            "totalApplications": conn.execute("SELECT COUNT(*) AS total FROM applications").fetchone()["total"],
            "totalApiKeys": conn.execute("SELECT COUNT(*) AS total FROM api_keys").fetchone()["total"],
        }

        recent_users = conn.execute(
            """
            SELECT id, full_name, email, role, created_at
            FROM users
            ORDER BY datetime(created_at) DESC, id DESC
            LIMIT 8
            """
        ).fetchall()

    return jsonify({
        "status": "success",
        **totals,
        "recentUsers": [dict(user) for user in recent_users],
    })
