# HireFlow

HireFlow is a job search and hiring web application built with React.

It helps users browse jobs, search for jobs, filter jobs by category, view job details, and save jobs they like.

---

## Purpose of the Project

The purpose of HireFlow is to make job searching easier and more organized.

Users can:

- View available jobs
- Search for jobs
- Filter jobs by category
- View full job details
- Save jobs
- Visit pages like About, Categories, Candidates, News, Job Post, and CV Post

---

## Team Members and Responsibilities

### 👨‍💻 Athanas – Frontend Lead

**Responsibilities**

- Navbar
- Home page layout
- Page design
- Basic styling
- Mobile responsiveness

**Files**

- `src/components/Navbar.jsx`
- `src/pages/Home.jsx`
- `src/styles/main.css`
- `src/App.css`
- `src/index.css`

---

### 👨‍💻 Cabdi – API & Logic Lead

**Responsibilities**

- API logic
- Fetch logic
- App state management
- Loading and error handling
- Main app logic

**Files**

- `backend/services/api.js`
- `src/App.jsx`

---

### 👨‍💻 Donald – Data Display Lead

**Responsibilities**

- Job cards
- Job list
- Displaying job information

**Files**

- `src/components/JobList.jsx`
- `src/components/JobCard.jsx`

---

### 👨‍💻 Albert – Interaction & UX Lead

**Responsibilities**

- Search
- Filters
- Loader
- Error messages
- User interaction

**Files**

- `src/components/SearchBar.jsx`
- `src/components/Filters.jsx`
- `src/components/Loader.jsx`
- `src/components/Error.jsx`

---

## Main Features

- Browse available jobs
- Search jobs by keyword
- Filter jobs by category
- View job details
- Save jobs
- Navigate between different pages
- Use loading and error states
- Backend API logic for job data

---

## Technologies Used

- React
- JavaScript
- Vite
- CSS
- Node.js
- Git
- GitHub

---

## Folder Structure

```txt
HIREFLOW/
│
├── backend/
│   └── services/
│       └── api.js
│
├── public/
│
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/
│   │   ├── Error.jsx
│   │   ├── Filters.jsx
│   │   ├── JobCard.jsx
│   │   ├── JobList.jsx
│   │   ├── Loader.jsx
│   │   ├── Navbar.jsx
│   │   └── SearchBar.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── InfoPages.jsx
│   │   └── JobDetails.jsx
│   │
│   ├── styles/
│   │   └── main.css
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## Important Files

### `src/main.jsx`

Starts the React app and connects it to `index.html`.

### `src/App.jsx`

Controls the main logic of the app.

It manages:

- Current page
- Selected job
- Saved jobs
- Search term
- Active category

### `src/pages/Home.jsx`

Displays the main home page and jobs section.

### `src/pages/JobDetails.jsx`

Shows full details for a selected job.

### `src/pages/InfoPages.jsx`

Contains extra pages like About, Categories, Candidates, News, Post Job, and CV Post.

### `backend/services/api.js`

Contains the API/job data logic.

---

## How to Run the Project

### 1. Clone the repository

```bash
git clone <repository-url>
```

### 2. Open the project folder

```bash
cd hireflow
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the project

```bash
npm run dev
```

### 5. Open the app in the browser

```txt
http://localhost:5173
```

---

## How to Use HireFlow

1. Open the website.
2. Browse the available jobs.
3. Use the search bar to search for a job.
4. Use the filters to choose a category.
5. Click on a job card to view full details.
6. Click the save icon to save a job.
7. Use the navbar to move between pages.

---

## Git Branches

The project uses different branches for different team members.

```txt
main
donald
ui-ux-interaction
feature/ui-navbar
feature/api-fetch-logic
```

---

## Branch Responsibilities

### `main`

Main stable branch. Only working code should be merged here.

### `donald`

Used for job display work.

Files:

- `JobList.jsx`
- `JobCard.jsx`

### `ui-ux-interaction`

Used for interaction and UX work.

Files:

- `SearchBar.jsx`
- `Filters.jsx`
- `Loader.jsx`
- `Error.jsx`

### `feature/ui-navbar`

Used for frontend layout and navbar work.

Files:

- `Navbar.jsx`
- `Home.jsx`
- CSS files

### `feature/api-fetch-logic`

Used for API and app logic work.

Files:

- `backend/services/api.js`
- `src/App.jsx`

---

## Git Flow

### 1. Start from main

```bash
git checkout main
git pull origin main
```

### 2. Switch to your branch

```bash
git checkout feature/api-fetch-logic
```

### 3. Make your changes

Work on the files assigned to your role.

### 4. Check changes

```bash
git status
```

### 5. Add changes

```bash
git add .
```

### 6. Commit changes

```bash
git commit -m "Add clear message here"
```

### 7. Push branch

```bash
git push origin feature/api-fetch-logic
```

### 8. Create a pull request

Create a pull request from your branch into `main`.

Example:

```txt
feature/api-fetch-logic → main
```

---

## Example Commit Messages

```txt
Add navbar component
Fix mobile navbar
Add job cards
Add search filter
Fix app logic
Add loader component
Improve home page styling
Update README
```

---

## Project Summary

HireFlow is a React job search platform.

It allows users to:

- Search jobs
- Filter jobs
- View job details
- Save jobs
- Navigate career pages

The project is divided into team roles so each member works on a clear part of the system.