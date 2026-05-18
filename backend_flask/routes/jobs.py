from __future__ import annotations

import json
from typing import Any

import requests
from flask import Blueprint, jsonify, request

from ..auth_utils import get_current_user, get_db_connection, require_roles, token_required


jobs_bp = Blueprint("jobs", __name__)

REMOTIVE_API_URL = "https://api.remotive.com/v1/remote-jobs"


def fetch_public_jobs(search: str = "", limit: int = 40) -> list[dict]:
    try:
        params = {"limit": min(limit, 100)}
        if search:
            params["search"] = search

        response = requests.get(REMOTIVE_API_URL, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()

        jobs = []
        for job in data.get("jobs", []):
            jobs.append({
                "id": f"remotive_{job.get('id')}",
                "external_id": job.get("id"),
                "source": "remotive",
                "title": job.get("title", ""),
                "company": job.get("company_name", ""),
                "category": job.get("job_type", "").lower() or "engineering",
                "job_type": "remote",
                "location": "Remote",
                "salary": "",
                "description": job.get("description", "No description available."),
                "tags": [job.get("job_type", "")] if job.get("job_type") else [],
                "posted_at": job.get("publication_date"),
                "apply_url": job.get("url", ""),
                "featured": False,
                "employer_id": None,
                "created_at": job.get("publication_date"),
                "updated_at": job.get("publication_date"),
            })

        return jobs
    except Exception as e:
        print(f"Error fetching public jobs: {e}")
        return []


def clean_text(value: Any, fallback: str = "") -> str:
    if value is None:
        return fallback

    return str(value).strip()


def parse_tags(value: Any) -> list[str]:
    if isinstance(value, list):
        return [clean_text(tag) for tag in value if clean_text(tag)][:8]

    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return parse_tags(parsed)
        except json.JSONDecodeError:
            return [tag.strip() for tag in value.split(",") if tag.strip()][:8]

    return []


def serialize_job(job) -> dict[str, Any]:
    if isinstance(job, dict) and "id" in job and str(job["id"]).startswith("remotive_"):
        tags = parse_tags(job.get("tags", []))
    else:
        job = dict(job) if not isinstance(job, dict) else job
        tags = parse_tags(job.get("tags"))

    posted_at = job.get("posted_at") or job.get("created_at")

    return {
        "id": str(job["id"]),
        "externalId": job.get("external_id"),
        "source": job.get("source") or "local",
        "sourceName": "HireFlow" if job.get("source") == "local" else (job.get("source") or "local").title(),
        "title": job["title"],
        "company": job["company"],
        "companyLogo": "",
        "category": job.get("category") or "engineering",
        "rawCategory": job.get("category") or "engineering",
        "jobType": job.get("job_type") or "remote",
        "location": job.get("location") or "Remote",
        "salary": job.get("salary") or "",
        "description": job.get("description") or "No description available yet.",
        "fullDescription": job.get("description") or "No description available yet.",
        "tags": tags,
        "postedAt": posted_at,
        "applyUrl": job.get("apply_url") or "",
        "applicationUrl": job.get("apply_url") or "",
        "url": job.get("apply_url") or "",
        "featured": bool(job.get("featured", 0)),
        "postedByUserId": job.get("employer_id"),
        "createdAt": job.get("created_at"),
        "updatedAt": job.get("updated_at"),
    }


def get_job_row(conn, job_id: int):
    return conn.execute(
        """
        SELECT *
        FROM jobs
        WHERE id = ?
        """,
        (job_id,),
    ).fetchone()


def is_owner_or_admin(job, user: dict[str, Any]) -> bool:
    return job["employer_id"] == user.get("id") or user.get("role") == "admin"


@jobs_bp.get("/")
def list_jobs():
    search = clean_text(request.args.get("search"))
    category = clean_text(request.args.get("category"))
    source = clean_text(request.args.get("source", "all"))

    try:
        limit = max(1, min(int(request.args.get("limit", 40)), 80))
        offset = max(0, int(request.args.get("offset", 0)))
    except ValueError:
        return jsonify({"error": "Invalid pagination parameters"}), 400

    all_jobs = []

    if source in ["all", "local"]:
        clauses = []
        values: list[Any] = []

        if search:
            clauses.append(
                """
                (
                    lower(title) LIKE lower(?)
                    OR lower(company) LIKE lower(?)
                    OR lower(description) LIKE lower(?)
                    OR lower(location) LIKE lower(?)
                    OR lower(tags) LIKE lower(?)
                )
                """
            )
            like_value = f"%{search}%"
            values.extend([like_value, like_value, like_value, like_value, like_value])

        if category and category.lower() != "all":
            clauses.append("lower(category) = lower(?)")
            values.append(category)

        where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""

        with get_db_connection() as conn:
            rows = conn.execute(
                f"""
                SELECT *
                FROM jobs
                {where_sql}
                ORDER BY datetime(COALESCE(posted_at, created_at)) DESC, id DESC
                """,
                values,
            ).fetchall()

        all_jobs.extend([serialize_job(row) for row in rows])

    if source in ["all", "public"]:
        public_jobs = fetch_public_jobs(search, limit=40)
        if category and category.lower() != "all":
            public_jobs = [j for j in public_jobs if j.get("category", "").lower() == category.lower()]
        all_jobs.extend([serialize_job(job) for job in public_jobs])

    all_jobs.sort(key=lambda x: x.get("postedAt") or "", reverse=True)

    total = len(all_jobs)
    paginated = all_jobs[offset : offset + limit]

    return jsonify({
        "data": paginated,
        "total": total,
        "limit": limit,
        "offset": offset,
    })


@jobs_bp.get("/mine")
@token_required
def my_jobs():
    user = get_current_user()

    with get_db_connection() as conn:
        rows = conn.execute(
            """
            SELECT *
            FROM jobs
            WHERE employer_id = ?
            ORDER BY datetime(COALESCE(posted_at, created_at)) DESC, id DESC
            """,
            (user["id"],),
        ).fetchall()

    return jsonify({"data": [serialize_job(row) for row in rows]})


@jobs_bp.get("/<int:job_id>")
def get_job(job_id: int):
    with get_db_connection() as conn:
        job = get_job_row(conn, job_id)

    if not job:
        return jsonify({"error": "Job not found"}), 404

    return jsonify({"data": serialize_job(job)})


@jobs_bp.post("/")
@require_roles("employer", "admin")
def create_job():
    user = get_current_user()
    data = request.get_json(silent=True) or {}

    title = clean_text(data.get("title"))
    company = clean_text(data.get("company"))

    if len(title) < 3:
        return jsonify({"error": "Job title must be at least 3 characters"}), 400

    if not company:
        return jsonify({"error": "Company name is required"}), 400

    fields = {
        "location": clean_text(data.get("location"), "Remote"),
        "job_type": clean_text(data.get("jobType") or data.get("job_type"), "remote"),
        "salary": clean_text(data.get("salary")),
        "description": clean_text(data.get("description") or data.get("fullDescription")),
        "category": clean_text(data.get("category"), "engineering").lower(),
        "tags": json.dumps(parse_tags(data.get("tags"))),
        "apply_url": clean_text(data.get("applyUrl") or data.get("applicationUrl") or data.get("url")),
        "is_remote": 1 if "remote" in clean_text(data.get("location"), "").lower() else 0,
    }

    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO jobs (
                employer_id, title, company, location, job_type, salary,
                description, source, category, tags, apply_url, posted_at, is_remote
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'local', ?, ?, ?, CURRENT_TIMESTAMP, ?)
            """,
            (
                user["id"],
                title,
                company,
                fields["location"],
                fields["job_type"],
                fields["salary"],
                fields["description"],
                fields["category"],
                fields["tags"],
                fields["apply_url"],
                fields["is_remote"],
            ),
        )
        job = get_job_row(conn, cursor.lastrowid)

    return jsonify({
        "message": "Job posted successfully",
        "data": serialize_job(job),
    }), 201


@jobs_bp.put("/<int:job_id>")
@token_required
def update_job(job_id: int):
    user = get_current_user()
    data = request.get_json(silent=True) or {}

    with get_db_connection() as conn:
        job = get_job_row(conn, job_id)

        if not job:
            return jsonify({"error": "Job not found"}), 404

        if not is_owner_or_admin(job, user):
            return jsonify({"error": "Insufficient permissions"}), 403

        title = clean_text(data.get("title"), job["title"])
        company = clean_text(data.get("company"), job["company"])

        if len(title) < 3:
            return jsonify({"error": "Job title must be at least 3 characters"}), 400

        conn.execute(
            """
            UPDATE jobs
            SET title = ?, company = ?, location = ?, job_type = ?, salary = ?,
                description = ?, category = ?, tags = ?, apply_url = ?,
                is_remote = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                title,
                company,
                clean_text(data.get("location"), job["location"] or "Remote"),
                clean_text(data.get("jobType") or data.get("job_type"), job["job_type"] or "remote"),
                clean_text(data.get("salary"), job["salary"] or ""),
                clean_text(data.get("description") or data.get("fullDescription"), job["description"] or ""),
                clean_text(data.get("category"), job["category"] or "engineering").lower(),
                json.dumps(parse_tags(data.get("tags", job["tags"] or "[]"))),
                clean_text(data.get("applyUrl") or data.get("applicationUrl") or data.get("url"), job["apply_url"] or ""),
                1 if "remote" in clean_text(data.get("location"), job["location"] or "").lower() else 0,
                job_id,
            ),
        )
        updated_job = get_job_row(conn, job_id)

    return jsonify({
        "message": "Job updated successfully",
        "data": serialize_job(updated_job),
    })


@jobs_bp.delete("/<int:job_id>")
@token_required
def delete_job(job_id: int):
    user = get_current_user()

    with get_db_connection() as conn:
        job = get_job_row(conn, job_id)

        if not job:
            return jsonify({"error": "Job not found"}), 404

        if not is_owner_or_admin(job, user):
            return jsonify({"error": "Insufficient permissions"}), 403

        conn.execute("DELETE FROM jobs WHERE id = ?", (job_id,))

    return jsonify({"message": "Job deleted successfully"})
