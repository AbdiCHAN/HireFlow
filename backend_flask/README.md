# HireFlow Flask Backend

This Flask API powers HireFlow2 authentication and protected CRUD flows.

## Run

```bash
source ../.venv/bin/activate
python -m backend_flask.app
```

## Responsibilities

- Create SQLite tables on startup.
- Hash passwords and issue JWT access tokens.
- Protect routes with `Authorization: Bearer <token>`.
- Enforce ownership checks for jobs, applications, CV/profile data, and API keys.
- Provide seeded local jobs for reliable demos.

## Core Route Files

```text
app.py                  Flask app factory and blueprint registration
auth_utils.py           SQLite setup, JWT helpers, role decorators
routes/auth.py          Register, login, current user
routes/jobs.py          Public job listing plus employer CRUD
routes/applications.py  Apply, list, update status, delete
routes/cv.py            Signed-in profile/CV save and fetch
routes/api_keys.py      API key create, list, toggle, revoke
routes/admin.py         Admin overview
```

## Health Check

```bash
curl http://localhost:5000/api/health
```
