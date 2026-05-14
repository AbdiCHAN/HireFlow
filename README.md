# HireFlow2

HireFlow2 is a full-stack job search and hiring application. The frontend is built with React JSX and Vite, while the backend is built with Flask and Python. The app supports job browsing, account authentication, CV uploads, job applications, admin review tools, API key management, and public job syncing through the Remotive Jobs API.

The frontend follows a professional LinkedIn-style flow with a home dashboard, job listing workspace, job details page, network page, messages page, profile page, CV upload page, post-job page, admin dashboard, and developer API key page.

## Main Stack

Frontend: React, JSX, Vite, CSS

Backend: Flask, Python, SQLAlchemy

Database: SQLite

Authentication: JWT

Password hashing: bcrypt

File uploads: CV files handled by Flask backend

Public jobs source: Remotive Jobs API

## Core Features

Users can browse jobs from the Flask backend and the public Remotive API. Jobs can be searched and filtered by category, type, company, location, skills, and description.

Users can sign up, log in, upload a CV, apply to jobs, save jobs, and manage their profile. Employers and admins can post jobs, review applications, and manage platform data. The backend also supports app-owned API keys for developer access.

## Project Structure

```text
HireFlow2/
  src/
    App.jsx
    main.jsx
    components/
    pages/
    context/
    services/
    styles/
    assets/

  backend_flask/
    app.py
    config.py
    extensions.py
    models.py
    auth_utils.py
    routes/
    services/

  uploads/
  instance/
  package.json
  requirements.txt
  README.md
```

## Frontend Setup

Install frontend dependencies:

```bash
npm install
```

Start the React frontend:

```bash
npm run dev
```

The frontend uses JSX files and connects to the Flask backend through `VITE_API_BASE_URL`.

Example `.env` frontend value:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

Useful frontend scripts:

```bash
npm run dev
npm run build
npm run lint
```

## Flask Backend Setup

Create and activate a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Run the Flask backend:

```bash
python3 backend_flask/app.py
```

The backend should run on:

```text
http://localhost:5000
```

Check backend health:

```bash
curl http://localhost:5000/health
```

## Environment Variables

Create a `.env` file for backend values:

```bash
PORT=5000
ACCESS_TOKEN_SECRET=your-secure-secret
REMOTIVE_API_URL=https://remotive.com/api/remote-jobs
DATABASE_URL=sqlite:///instance/hireflow.db
```

Do not commit real secrets to GitHub.

## Main API Routes

```text
POST   /api/auth/register
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me

GET    /api/jobs
GET    /api/jobs/<id>
POST   /api/jobs
PUT    /api/jobs/<id>
DELETE /api/jobs/<id>

POST   /api/cv
GET    /api/cv/my

POST   /api/applications
GET    /api/applications/my
GET    /api/applications
PATCH  /api/applications/<id>/status

GET    /api/admin/overview

GET    /api/api-keys
POST   /api/api-keys
DELETE /api/api-keys/<id>

GET    /health
```

## GitHub Pages Note

GitHub Pages only hosts the static React frontend. It does not run the Flask backend.

This means features like login, signup, CV upload, job posting, applications, admin overview, and API key management need the Flask backend to be hosted separately.

To build the frontend with a hosted backend URL:

```bash
VITE_API_BASE_URL=https://your-backend-url.example.com npm run build
```

Then deploy the frontend:

```bash
npm run deploy
```

## Team Responsibilities

Abdirahman is the Team Lead and Full-Stack Integration Lead.

Abdirahman handles the main app flow, frontend/backend connection, authentication flow, API service connection, and Flask backend startup.

Frontend files:

```text
src/App.jsx
src/main.jsx
src/context/AuthContext.jsx
src/services/api.js
src/pages/Login.jsx
src/pages/Signup.jsx
```

Backend files:

```text
backend_flask/app.py
backend_flask/auth_utils.py
backend_flask/routes/auth.py
backend_flask/services/remotive.py
```

Athanas is the Frontend Layout Lead and Database Structure Lead.

Athanas handles the navbar, homepage layout, global styling, responsive design, database setup, and model structure.

Frontend files:

```text
src/components/Navbar.jsx
src/pages/Home.jsx
src/styles/main.css
src/index.css
src/App.css
```

Backend files:

```text
backend_flask/config.py
backend_flask/extensions.py
backend_flask/models.py
backend_flask/__init__.py
```

Donald is the Jobs, Applications, and Workflow Lead.

Donald handles job cards, job lists, job details, loading/error states, job routes, application routes, and API key routes.

Frontend files:

```text
src/components/JobCard.jsx
src/components/JobList.jsx
src/pages/JobDetails.jsx
src/components/Loader.jsx
src/components/Error.jsx
```

Backend files:

```text
backend_flask/routes/jobs.py
backend_flask/routes/applications.py
backend_flask/routes/api_keys.py
backend_flask/routes/__init__.py
```

Albert is the Forms, CV, Admin, and Developer Access Lead.

Albert handles search, filters, information pages, admin dashboard, CV uploads, admin routes, and developer access documentation.

Frontend files:

```text
src/components/Filters.jsx
src/components/SearchBar.jsx
src/pages/InfoPages.jsx
src/pages/AdminDashboard.jsx
src/index.html
```

Backend files:

```text
backend_flask/routes/cv.py
backend_flask/routes/admin.py
backend_flask/services/__init__.py
backend_flask/README.md
```

## Backend Coordination Rules

If a change touches another person's backend file, tell that person before merging.

Keep Flask API responses aligned with what the React frontend expects.

Do not commit generated database files, uploaded CV files, virtual environment folders, `dist`, or `node_modules`.

Before submitting changes, run:

```bash
npm run build
npm run lint
```

Then smoke-test the backend:

```bash
curl http://localhost:5000/health
curl "http://localhost:5000/api/jobs?sync=false"
```


HireFlow2 is now a React JSX and Flask Python project. The frontend handles the user interface, while the Flask backend handles authentication, database operations, CV uploads, job applications, admin tools, API keys, and public job syncing.
