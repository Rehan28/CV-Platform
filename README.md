# CV Platform

A recruiter/candidate CV management system built as a full-stack course project. Recruiters maintain a shared **Attribute Library** and use it to compose **Positions** — reusable, access-controlled CV templates — from which candidate **CVs** are generated, reviewed, published, and discussed.

## Tech Stack

- Frontend: React + TypeScript (Vite)
- Backend: Node.js + Express + TypeScript
- ORM: Sequelize (SQLite by default; Postgres/MySQL/MSSQL via config)
- Auth: Email/password (bcrypt + JWT cookie) with Google/Facebook OAuth wiring
- Search: FlexSearch (full-text)
- i18n: i18next (English + Spanish)

## Core Features

### Attribute Library

A shared, reusable set of structured fields with category, globally unique name, description, and one of eight supported data types:
- string
- markdown text
- image
- numeric
- date
- date range
- boolean
- dropdown

Supports full CRUD, prefix lookup, category filtering, and a recently used list.

### Positions

Customizable CV templates shared across recruiters.

- Basic info: title, description, optional company/level
- Public or restricted access, gated by rules based on Attribute Library values
- Ordered attributes from the library, project tags, and maximum project count
- Create, duplicate, edit, and delete via selection-based actions

### CV Generation (in progress)

CVs are assembled from a candidate's profile, position-selected attributes, and filtered projects. In-place edits update the candidate's profile, missing values are highlighted, and CVs must complete required fields before publishing.

### Discussions & Likes (planned)

Per-position Markdown-formatted discussion threads and one-like-per-recruiter voting on CVs.

## Project Structure

```
.
├── backend/            Express + TypeScript API
│   ├── src/
│   │   ├── config/      Passport/OAuth configuration
│   │   ├── db/          Sequelize connection
│   │   ├── middleware/  Auth + RBAC
│   │   ├── models/      Sequelize models (User, Attribute, Position, CV, ...)
│   │   ├── routes/      REST endpoints
│   │   ├── seed/        Demo data seeding
│   │   └── services/    Access-rule evaluation, etc.
└── frontend/           React + TypeScript SPA (Vite)
    └── src/
        ├── api/          Axios client
        ├── components/   Shared UI and feature components
        ├── context/      Auth context
        ├── i18n/         Translations
        ├── pages/        Route-level pages
        └── theme/        Light/dark design tokens
```

## Implementation Status

| Area                             | Status                                  |
|----------------------------------|-----------------------------------------|
| Data model (all entities)        | ✅ Complete                              |
| Auth (local) + RBAC              | ✅ Complete                              |
| Auth (Google/Facebook OAuth)     | ⚠ Wired, needs live credentials         |
| Attribute Library (API + UI)     | ✅ Complete                              |
| Positions (API + UI)             | ✅ Complete                              |
| Home page stats API              | ✅ Complete                              |
| Candidate profile UI             | 🚧 Not started                           |
| CV generation & publish workflow | 🚧 Not started                           |
| Discussions (live updates)       | 🚧 Not started                           |
| Likes                            | 🚧 Not started                           |
| Full-text search & tag cloud     | 🚧 Not started                           |
| Light/dark theme, i18n toggle    | ✅ Complete                              |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed   # creates demo users and sample attributes
npm run dev    # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

### Demo Accounts

All demo accounts use the password `password123`.

| Email                 | Role(s)                        |
|-----------------------|--------------------------------|
| `admin@demo.io`       | Admin, Recruiter, Candidate    |
| `recruiter@demo.io`   | Recruiter                      |
| `candidate@demo.io`   | Candidate                      |





