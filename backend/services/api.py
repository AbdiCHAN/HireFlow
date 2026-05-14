
import os
import re
import html
import requests
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from urllib.parse import urlencode


REMOTIVE_API_URL = os.getenv(
    "REMOTIVE_API_URL",
    "https://remotive.com/api/remote-jobs"
)


def safe_text(value: Any, fallback: str = "") -> str:
    if value is None:
        return fallback
    return str(value)


def strip_html(raw_html: str = "") -> str:
    text = safe_text(raw_html)

    text = re.sub(r"<style[^>]*>[\s\S]*?</style>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<script[^>]*>[\s\S]*?</script>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)

    text = html.unescape(text)
    text = text.replace("\xa0", " ")
    text = re.sub(r"\s{2,}", " ", text)

    return text.strip()


def normalize_type(job_type: str = "") -> str:
    normalized = safe_text(job_type).lower()
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


def format_date(value: Any) -> str:
    if not value:
        return ""

    try:
        date_value = str(value).replace("Z", "+00:00")
        parsed_date = datetime.fromisoformat(date_value)

        return parsed_date.strftime("%a %b %d %Y")
    except Exception:
        return safe_text(value)


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"(^-|-$)", "", value)

    return value


def normalize_job(job: Dict[str, Any] = None) -> Dict[str, Any]:
    if job is None:
        job = {}

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

    tags = job.get("tags") if isinstance(job.get("tags"), list) else []
    tags = tags[:5]

    raw_category = safe_text(
        job.get("raw_category")
        or job.get("category")
        or job.get("rawCategory"),
        "General"
    )

    job_id = job.get("id")

    if job_id is None:
        job_id = slugify(f"{company}-{title}")

    short_description = (
        f"{full_description[:260]}..."
        if len(full_description) > 260
        else full_description
    )

    return {
        "id": job_id,
        "title": title,
        "company": company,
        "companyLogo": safe_text(
            job.get("company_logo") or job.get("companyLogo") or ""
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
            or job.get("location")
            or "Remote"
        ),
        "salary": safe_text(job.get("salary"), ""),
        "description": short_description or "No description available yet.",
        "fullDescription": full_description or "No description available yet.",
        "url": safe_text(job.get("url") or job.get("job_url") or ""),
        "applicationUrl": safe_text(
            job.get("application_url")
            or job.get("applicationUrl")
            or ""
        ),
        "applyUrl": safe_text(
            job.get("apply_url")
            or job.get("applyUrl")
            or ""
        ),
        "tags": tags,
        "postedAt": (
            job.get("postedAt")
            or format_date(job.get("publication_date"))
            or job.get("publication_date")
        ),
        "source": job.get("source") or "Remotive",
        "featured": bool(job.get("featured")),
    }


def get_jobs_array_from_response(data: Any) -> List[Dict[str, Any]]:
    if isinstance(data, list):
        return data

    if isinstance(data, dict):
        if isinstance(data.get("jobs"), list):
            return data["jobs"]

        if isinstance(data.get("data"), list):
            return data["data"]

        if isinstance(data.get("results"), list):
            return data["results"]

    return []


def build_query_string(params: Dict[str, Any] = None) -> str:
    if params is None:
        params = {}

    query_params = {}

    if params.get("search"):
        query_params["search"] = str(params["search"])

    if params.get("category") and params.get("category") != "All":
        query_params["category"] = str(params["category"])

    if params.get("limit"):
        query_params["limit"] = str(params["limit"])

    query_string = urlencode(query_params)

    return f"?{query_string}" if query_string else ""


def fetch_jobs(
    search: str = "",
    category: str = "",
    limit: Union[int, str] = 40
) -> List[Dict[str, Any]]:
    query_string = build_query_string({
        "search": search,
        "category": category,
        "limit": limit
    })

    url = f"{REMOTIVE_API_URL}{query_string}"

    response = requests.get(
        url,
        headers={"Accept": "application/json"},
        timeout=15
    )

    if not response.ok:
        raise Exception(f"Remote API responded {response.status_code}")

    data = response.json()

    try:
        limit_number = int(limit)
    except Exception:
        limit_number = 40

    jobs = [
        normalize_job(job)
        for job in get_jobs_array_from_response(data)
    ]

    return jobs[:limit_number]


def fetch_job_by_id(job_id: Union[str, int]) -> Optional[Dict[str, Any]]:
    if not job_id:
        return None

    jobs = fetch_jobs(limit=500)

    for job in jobs:
        if str(job["id"]) == str(job_id):
            return job

    return None 