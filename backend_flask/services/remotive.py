import html
import re
from datetime import datetime

import requests
from flask import current_app


def safe_text(value, fallback=""):
    if value is None:
        return fallback

    return str(value)


def strip_html(value=""):
    cleaned = safe_text(value)

    cleaned = re.sub(
        r"<style[^>]*>[\s\S]*?</style>",
        "",
        cleaned,
        flags=re.IGNORECASE
    )

    cleaned = re.sub(
        r"<script[^>]*>[\s\S]*?</script>",
        "",
        cleaned,
        flags=re.IGNORECASE
    )

    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    cleaned = html.unescape(cleaned)
    cleaned = re.sub(r"\s{2,}", " ", cleaned)

    return cleaned.strip()


def normalize_type(value=""):
    normalized = safe_text(value).lower()
    normalized = re.sub(r"[_\s-]", "", normalized)

    if "fulltime" in normalized or normalized == "full":
        return "full-time"

    if "contract" in normalized:
        return "contract"

    if "parttime" in normalized or normalized == "part":
        return "part-time"

    if "freelance" in normalized:
        return "freelance"

    if "remote" in normalized:
        return "remote"

    return normalized or "remote"


def format_date(value):
    if not value:
        return ""

    try:
        cleaned = str(value).replace("Z", "+00:00")
        parsed_date = datetime.fromisoformat(cleaned)

        return parsed_date.strftime("%a %b %d %Y")

    except ValueError:
        return safe_text(value)


def normalize_job(job=None):
    job = job or {}

    full_description = strip_html(
        job.get("fullDescription")
        or job.get("description")
        or job.get("description_text")
        or ""
    )

    title = safe_text(job.get("title"), "Untitled Job")

    company = safe_text(
        job.get("company") or job.get("company_name"),
        "Unknown Company"
    )

    raw_category = safe_text(
        job.get("raw_category")
        or job.get("category")
        or job.get("rawCategory"),
        "General"
    )

    tags = job.get("tags") if isinstance(job.get("tags"), list) else []

    generated_id = re.sub(
        r"[^a-z0-9]+",
        "-",
        f"{company}-{title}".lower()
    ).strip("-")

    if len(full_description) > 260:
        short_description = f"{full_description[:260]}..."
    else:
        short_description = full_description or "No description available yet."

    return {
        "id": job.get("id") or generated_id,
        "title": title,
        "company": company,
        "companyLogo": safe_text(
            job.get("company_logo")
            or job.get("companyLogo")
        ),
        "category": job.get("category") or raw_category,
        "rawCategory": raw_category,
        "jobType": normalize_type(
            job.get("job_type")
            or job.get("jobType")
            or job.get("type")
            or "remote"
        ),
        "location": safe_text(
            job.get("candidate_required_location")
            or job.get("location"),
            "Remote"
        ),
        "salary": safe_text(job.get("salary")),
        "description": short_description,
        "fullDescription": full_description or "No description available yet.",
        "url": safe_text(
            job.get("url")
            or job.get("job_url")
        ),
        "applicationUrl": safe_text(
            job.get("application_url")
            or job.get("applicationUrl")
        ),
        "applyUrl": safe_text(
            job.get("apply_url")
            or job.get("applyUrl")
        ),
        "tags": [str(tag) for tag in tags[:5] if tag],
        "postedAt": (
            job.get("postedAt")
            or format_date(job.get("publication_date"))
            or job.get("publication_date")
        ),
        "source": job.get("source") or "Remotive",
        "featured": bool(job.get("featured")),
    }


def response_jobs(data):
    if isinstance(data, list):
        return data

    if isinstance(data, dict):
        for key in ("jobs", "data", "results"):
            if isinstance(data.get(key), list):
                return data[key]

    return []


def fetch_jobs(search="", category="", limit=40):
    params = {}

    if search:
        params["search"] = search

    if category and category != "All":
        params["category"] = category

    if limit:
        params["limit"] = limit

    response = requests.get(
        current_app.config["REMOTIVE_API_URL"],
        params=params,
        headers={"Accept": "application/json"},
        timeout=8,
    )

    response.raise_for_status()

    data = response.json()

    try:
        numeric_limit = int(limit or 40)
    except ValueError:
        numeric_limit = 40

    jobs = [normalize_job(job) for job in response_jobs(data)]

    return jobs[:numeric_limit]


def fetch_job_by_id(job_id):
    if not job_id:
        return None

    jobs = fetch_jobs(limit=500)

    for job in jobs:
        if str(job["id"]) == str(job_id):
            return job

    return None