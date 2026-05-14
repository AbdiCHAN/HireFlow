# HireFlow Flask Backend

This is a Flask + SQLAlchemy equivalent of the existing TypeScript/Express backend. It exposes the same API paths used by the React frontend:

- `/api/auth/register`, `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
- `/api/jobs`, `/api/jobs/my/jobs`, `/api/jobs/<id>`
- `/api/cv`, `/api/cv/my`
- `/api/applications`, `/api/applications/my`, `/api/applications/<id>/status`
- `/api/admin/overview`
- `/api/api-keys`
- `/health`

## Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 -m backend_flask.app
```

Then run the frontend against Flask:

```bash
VITE_API_BASE_URL=http://localhost:5000 npm run dev:client
```

By default it uses the same SQLite file as the Express backend:

```text
backend/data/hireflow.db
```

Useful environment variables:

- `PORT`: Flask server port, default `5000`
- `ACCESS_TOKEN_SECRET`: JWT signing secret
- `DATABASE_URL`: full SQLAlchemy database URL
- `HIREFLOW_DB_PATH`: SQLite path if `DATABASE_URL` is not set
- `HIREFLOW_UPLOAD_FOLDER`: CV upload directory, default `backend/uploads`
- `REMOTIVE_API_URL`: public jobs API URL
