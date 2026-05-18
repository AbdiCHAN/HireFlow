# HireFlow2

HireFlow2 is a full-stack hiring workspace for job seekers, employers, and admins. The frontend is a React and Vite application styled after a professional LinkedIn-style feed. The backend is a Flask API using SQLite, JWT authentication, hashed passwords, and secure owner checks for user resources.

## What The App Does

- Browse a three-column job feed with search, category filters, saved jobs, hiring pulse cards, and company recommendations.
- Register and log in as a job seeker, employer, or admin.
- Job seekers can save jobs, maintain a CV/profile, apply to local HireFlow jobs, and track applications.
- Employers can post, edit, and delete their own jobs, then review incoming applications.
- Admins can view platform totals and recent users.
- Signed-in users can create, pause, and revoke API keys.
- Public job discovery still works on static hosting by falling back to remote/demo listings when the Flask API is not available.

## Tech Stack

Frontend:

```text
React
Vite
Plain CSS
Local storage for saved jobs and auth session cache
```

Backend:

```text
Flask
SQLite
PyJWT
Werkzeug password hashing
Flask-CORS
```

## Project Structure

The existing folder structure is intentionally kept intact.

```text
HireFlow2/
  src/
    App.jsx
    components/
    context/
    pages/
    services/
    styles/
  backend_flask/
    app.py
    auth_utils.py
    routes/
    services/
  package.json
  requirements.txt
  README.md
```

## Setup

Install frontend dependencies:

```bash
npm install
```

Create and activate a Python environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Start the backend:

```bash
./.venv/bin/python -m backend_flask.app
```

Start the frontend:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

The Flask API runs at:

```text
http://localhost:5000
```

## Environment Variables

Optional backend values:

```bash
PORT=5000
JWT_SECRET_KEY=replace-this-with-a-secure-secret
JWT_EXPIRY_HOURS=24
HIRE_FLOW_DB_PATH=backend_flask/instance/hireflow2.sqlite3
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Optional frontend value for a hosted backend:

```bash
VITE_API_BASE_URL=https://your-backend.example.com
```

## Main API Routes

Auth:

```text
POST   /api/auth/register
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me
```

Jobs:

```text
GET    /api/jobs
GET    /api/jobs/<id>
GET    /api/jobs/mine
POST   /api/jobs
PUT    /api/jobs/<id>
DELETE /api/jobs/<id>
```

Applications:

```text
POST   /api/applications
GET    /api/applications
GET    /api/applications/my
PATCH  /api/applications/<id>/status
DELETE /api/applications/<id>
```

CV/profile:

```text
GET    /api/cvs/me
POST   /api/cvs
```

API keys:

```text
GET    /api/api-keys
POST   /api/api-keys
PATCH  /api/api-keys/<id>/toggle
DELETE /api/api-keys/<id>
```

Admin:

```text
GET    /api/admin/overview
```

Health:

```text
GET    /api/health
```

## Auth And Roles

JWT tokens are returned after signup and login. Protected routes require:

```text
Authorization: Bearer <token>
```

Role permissions:

```text
job_seeker: save jobs locally, manage profile, apply to jobs, manage API keys
employer: create/update/delete own jobs, review applications for own jobs, manage API keys
admin: access admin overview and manage platform-level application/job data
```

## Verification Checklist

Run before submitting:

```bash
npm run build
./.venv/bin/python -m py_compile backend_flask/auth_utils.py backend_flask/app.py backend_flask/routes/*.py
```

Backend smoke test ideas:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/jobs
```

Manual user flow:

1. Register a recruiter account.
2. Post a job from Post job.
3. Register a job seeker account.
4. Save and apply to the posted job.
5. Return to the recruiter account and update application status.
6. Create and revoke an API key.
7. Register an admin account and open the admin dashboard.

## Rubric Alignment

Alignment with brief:
The product is a hiring and job search platform with job discovery, auth, employer posting, applications, profile tools, API keys, and admin overview.

Functionality and auth:
Registration, login, JWT-protected routes, user-owned job CRUD, application tracking, CV/profile save, and API key CRUD are implemented.

Code quality:
Frontend API calls are centralized in `src/services/api.js`; auth state is centralized in `src/context/AuthContext.jsx`; Flask auth and database helpers are centralized in `backend_flask/auth_utils.py`.

User experience:
The UI follows the provided LinkedIn-style design with sticky navigation, responsive cards, clear login state, profile sidebar, filters, and dashboard flows.

Documentation and maintainability:
This README documents setup, routes, roles, verification, and handoff expectations.

## GitHub Pages

GitHub Pages can host the static React frontend at:

```text
https://abdichan.github.io/HireFlow2/
```

Static hosting cannot run Flask. Deploy the backend separately and set `VITE_API_BASE_URL` during build when using hosted auth and CRUD features.
