# Task Management System - Full Stack Technical Assessment

A full-stack Task Management web application built for the **Koncepthive Technical Assessment** (Intern – Full Stack Web Developer).

The application allows users to authenticate using JWT tokens and perform complete CRUD operations on daily tasks, featuring interactive real-time statistics counters, dynamic search by title, multi-criteria filtering by status and priority, custom sorting, form validation with inline error messaging, light/dark mode, toast notifications, unit tests, and Docker container support.

---

## Application Screenshots & UI Preview

### 1. User Authentication (Login Page)
![Login Page](docs/screenshots/login_page.png)

### 2. Dashboard Analytics & Task Cards (Dark Mode)
![Dark Mode Dashboard](docs/screenshots/dashboard_dark.png)

### 3. Light Mode & Dynamic Filter State
![Light Mode Dashboard](docs/screenshots/dashboard_light.png)

---

## Technology Stack

### Frontend
- **Framework / Library**: React 18 (TypeScript) + Vite
- **Styling**: Tailwind CSS (with custom dark mode)
- **Icons**: Lucide React
- **HTTP Client**: Axios (with JWT bearer token interceptors & auto 401 handling)

### Backend
- **Runtime & Framework**: Node.js, Express.js (TypeScript)
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs` for secure password hashing
- **Validation**: Strict server-side payload validation middleware
- **Testing**: Vitest + Supertest for automated REST API unit & integration testing

### Database
- **Database Systems**: PostgreSQL / MySQL (Supported via `database/schema.sql` and `database/seed.sql`)
- **Zero-Config Fallback**: Automatic SQLite fallback included so the project runs out-of-the-box locally without needing an external database daemon active.

---

## Default Login Credentials

As specified in the assessment requirements:
- **Email**: `admin@test.com`
- **Password**: `123456`

---

## Project Structure

```
task-manager-assessment/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Auth & Task API business logic
│   │   ├── db/               # PostgreSQL & SQLite abstraction layer & migration seeder
│   │   ├── middleware/       # JWT Auth & Validation middlewares
│   │   ├── routes/           # RESTful API route definitions
│   │   ├── __tests__/        # Automated Vitest integration tests
│   │   └── server.ts         # Express server entry point
│   ├── .env.example          # Environment variable template
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components (Stats, FilterBar, TaskCards, Modals)
│   │   ├── context/          # Auth & Dark Theme state providers
│   │   ├── pages/            # Login & Task Dashboard pages
│   │   ├── services/         # Axios API service layer
│   │   └── types/            # TypeScript data contracts
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── database/
│   ├── schema.sql            # PostgreSQL / MySQL DDL creation script
│   └── seed.sql              # Initial admin & sample task seed script
├── docs/
│   └── screenshots/          # Application UI screenshots
├── docker-compose.yml        # Container orchestration (Postgres, Backend, Frontend)
├── .gitignore
└── README.md
```

---

## Getting Started & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- (Optional) Docker & Docker Compose / PostgreSQL

---

### Step-by-Step Local Setup

#### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Start the backend development server:
```bash
npm run dev
```
> The API server will run at `http://localhost:5000`.

To run automated backend tests:
```bash
npm test
```

#### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
> The React web app will open at `http://localhost:3000`.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Express server port | `5000` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `koncepthive_super_secret_jwt_key_2026` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/taskmanager_db` |
| `USE_POSTGRES` | Set to `true` to use external PostgreSQL | `false` (Auto-fallback to SQLite for 1-click execution) |

---

## Database Setup

- **Option A (Default - Instant Local Execution)**:
  The application automatically initializes an embedded database SQLite file in `database/taskmanager.sqlite` and seeds the admin user `admin@test.com` on first run.

- **Option B (PostgreSQL / MySQL Manual SQL Dump)**:
  Run the SQL scripts located in the `database/` folder:
  ```bash
  psql -U postgres -d taskmanager_db -f database/schema.sql
  psql -U postgres -d taskmanager_db -f database/seed.sql
  ```

- **Option C (Docker Compose)**:
  ```bash
  docker-compose up --build
  ```

---

## REST API Documentation

### Auth Endpoints
- `POST /api/auth/login`
  - **Body**: `{ "email": "admin@test.com", "password": "123456" }`
  - **Response**: JWT Token + User object
- `GET /api/auth/me`
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Authenticated user details

### Task Endpoints
- `GET /api/tasks`
  - **Query Params**: `search`, `status` (`Pending` \| `In Progress` \| `Completed`), `priority` (`Low` \| `Medium` \| `High`), `sortBy` (`newest` \| `oldest` \| `due_date`)
  - **Response**: Array of tasks + Dashboard stats summary
- `GET /api/tasks/:id`
  - **Response**: Task details by ID
- `POST /api/tasks`
  - **Body**: `{ "title": "Task title", "description": "...", "priority": "High", "status": "Pending", "due_date": "YYYY-MM-DD" }`
  - **Validation**: Title is required; due date cannot be earlier than today when creating
- `PUT /api/tasks/:id`
  - **Body**: Fields to update
- `DELETE /api/tasks/:id`
  - **Response**: Success status

---

## Assumptions Made
1. Single tenant default admin user (`admin@test.com` / `123456`) per prompt instructions, with task ownership scoped by `user_id`.
2. Tasks marked as overdue are defined as tasks whose `due_date` is earlier than today's date and whose status is NOT `Completed`.
3. Due date validation checks date component (ignoring time-of-day offsets).

---

## Bonus Features Implemented
- [x] **Dark Mode Toggle**: Built-in sleek dark/light mode with persistence.
- [x] **Toast Notifications**: Interactive toast alerts for success and error actions.
- [x] **Loading Indicators & Skeletons**: Smooth animated skeleton states during fetch.
- [x] **Unit & Integration Tests**: 10 passed Vitest tests verifying backend auth and CRUD.
- [x] **Docker & Docker Compose**: Pre-configured multi-stage build files.
- [x] **Auto DB Fallback**: Immediate 1-click execution without database configuration friction.

---

## Submission Checklist
- [x] GitHub Repository clean commit history
- [x] Database Schema & Seed files (`database/schema.sql`, `database/seed.sql`)
- [x] Full `README.md` with UI Screenshots
- [x] Environment template (`backend/.env.example`)
