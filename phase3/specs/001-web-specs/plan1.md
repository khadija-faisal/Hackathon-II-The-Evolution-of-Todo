# Phase 2: Full-Stack Web Application - Implementation Plan

**Status**: Active
**Branch**: `001-web-specs`
**Created**: 2026-01-17
**Version**: 1.0.0

---

## Executive Summary

This plan defines the complete implementation roadmap for transforming the Phase 1 CLI todo application into a secure, multi-user web application with JWT-based authentication, a cloud-hosted PostgreSQL database, and modern web UI built with Next.js 15 and FastAPI.

The implementation follows the **Spec-Driven Development (SDD)** methodology with strict adherence to the Constitution principles, particularly:
- **JWT Bridge Pattern** for authentication (Principle I)
- **API-First Backend** architecture (Principle II)
- **Server Components Default** in Next.js (Principle III)
- **User-Scoped Database Queries** with user_id foreign keys (Principle V)

---

## Part 1: Architecture Overview

### 1.1 System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │          Next.js 15 (App Router)                         │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │ Server Components (Default)                       │  │ │
│  │  │ - Authentication checks (server-side)             │  │ │
│  │  │ - Data fetching (server-side)                     │  │ │
│  │  │ - No secrets exposed                              │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │ Client Components (Interactivity Only)            │  │ │
│  │  │ - Forms (Login, Task Create/Edit)                 │  │ │
│  │  │ - Real-time UI updates (checkbox toggle, delete)  │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                    ↓ (HTTP + Bearer Token)
┌────────────────────────────────────────────────────────────────┐
│                      BACKEND API LAYER                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              FastAPI (Python)                           │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ JWT Middleware (Principle II Gatekeeper)           │ │ │
│  │  │ - Verify Bearer token signature                    │ │ │
│  │  │ - Extract user_id from JWT claims                 │ │ │
│  │  │ - Return 401/403 for auth failures                │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ API Routes (/api/v1/*)                            │ │ │
│  │  │ - POST /auth/login (issue JWT token)              │ │ │
│  │  │ - POST /auth/register (create user)               │ │ │
│  │  │ - POST /auth/logout (clear token)                 │ │ │
│  │  │ - POST /tasks (create task)                       │ │ │
│  │  │ - GET /tasks (list user's tasks)                  │ │ │
│  │  │ - GET /tasks/{id} (get specific task)             │ │ │
│  │  │ - PUT /tasks/{id} (update task)                   │ │ │
│  │  │ - PATCH /tasks/{id} (partial update)              │ │ │
│  │  │ - PATCH /tasks/{id}/complete (toggle completion)  │ │ │
│  │  │ - DELETE /tasks/{id} (delete task)                │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ Request/Response Validation (Pydantic Models)     │ │ │
│  │  │ - TaskCreateRequest, TaskUpdateRequest            │ │ │
│  │  │ - TaskResponse, UserResponse                      │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ Business Logic (Stateless)                        │ │ │
│  │  │ - Validate user ownership (user_id filter)        │ │ │
│  │  │ - Process mutations                               │ │ │
│  │  │ - Return consistent API responses                 │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                    ↓ (SQL Queries)
┌────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │       Neon PostgreSQL (Cloud-Hosted)                   │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ users Table                                        │ │ │
│  │  │ - id (UUID, PK)                                    │ │ │
│  │  │ - email (VARCHAR, UNIQUE)                         │ │ │
│  │  │ - password_hash (VARCHAR)                         │ │ │
│  │  │ - created_at, updated_at                          │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ tasks Table (Principle V: User-Scoped)            │ │ │
│  │  │ - id (UUID, PK)                                    │ │ │
│  │  │ - user_id (UUID, FK→users.id) ← PRIMARY FILTER    │ │ │
│  │  │ - title, description, completed                  │ │ │
│  │  │ - created_at, updated_at                          │ │ │
│  │  │ - Indexes: user_id, (user_id, created_at DESC)   │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ Query Pattern (ALL operations):                   │ │ │
│  │  │ WHERE user_id = :authenticated_user_id            │ │ │
│  │  │ (Defense-in-depth: JWT + DB constraint)           │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 1.2 JWT Bridge Pattern (Constitution Principle I)

```
User Action (Frontend)
        ↓
Better Auth Library (Issues JWT)
        ↓
JWT Token: {
  "sub": "<user_id>",        ← Extracted by backend
  "email": "<email>",
  "iat": <issued_at>,
  "exp": <expiration>
}
        ↓
Frontend stores token (httpOnly cookie or secure storage)
        ↓
All API requests include: Authorization: Bearer <token>
        ↓
FastAPI Middleware (Verifies JWT)
        ├─ Verify signature using BETTER_AUTH_SECRET
        ├─ Check expiration
        ├─ Extract user_id from 'sub' claim
        ├─ Return 401 if invalid
        └─ Pass user_id to route handler
        ↓
Backend API Handler
        ├─ Receive authenticated user_id
        ├─ Scope all DB queries: WHERE user_id = :user_id
        └─ Prevent any cross-user data access
        ↓
Database (Final Defense Layer)
        └─ FK constraint ensures task.user_id → users.id
```

### 1.3 Constitutional Compliance

| Principle | Requirement | Implementation |
|-----------|-------------|-----------------|
| **I. JWT Auth & User Isolation** | Extract user_id from JWT; filter all queries by user_id | FastAPI middleware extracts from 'sub' claim; all task queries include WHERE user_id = :user_id |
| **II. API-First Backend** | All business logic in FastAPI; frontend validates for UX only | Backend enforces all validation; 400/401/403 responses as per spec |
| **III. Server Components Default** | Use Server Components; Client Components only for interactivity | Pages use Server Components by default; forms/buttons use Client Components |
| **IV. Stateless Backend** | No session storage; database is only state | FastAPI has no in-memory sessions; Neon PostgreSQL is source of truth |
| **V. User-Scoped DB Queries** | Every SELECT/UPDATE/DELETE includes WHERE user_id = ? | SQLModel models include user_id FK; query builders enforce filter |
| **VI. Error Handling Standards** | 401/403/400/500 responses with consistent structure | All endpoints return Pydantic models with error details |
| **VII. Type Safety & Validation** | All payloads use Pydantic models | Request/response models defined in schema.md; no untyped dicts |

---

## Part 2: Implementation Roadmap

### Phase 1: Foundation & Backend Setup (Priority: P0)

**Goal**: Establish secure backend infrastructure with JWT verification and database connectivity.

**Success Criteria**:
- SC-001: Backend boots with Neon connection verified
- SC-002: JWT middleware validates all tokens correctly
- SC-003: Unauthenticated requests return 401

#### Step 1.1: Backend Project Structure

**Artifacts**: `backend/` directory organized per Constitution naming conventions

```
backend/
├── main.py                  # FastAPI app initialization
├── config.py                # Settings (DB URL, BETTER_AUTH_SECRET)
├── models/
│   ├── __init__.py
│   ├── user.py              # User model (SQLModel)
│   └── task.py              # Task model with user_id FK
├── routes/
│   ├── __init__.py
│   ├── auth.py              # POST /api/v1/auth/login, register, logout
│   └── tasks.py             # POST/GET/PUT/PATCH/DELETE /api/v1/tasks/*
├── middleware/
│   ├── __init__.py
│   └── jwt.py               # JWT verification middleware (Principle II gatekeeper)
├── services/
│   ├── __init__.py
│   ├── auth_service.py      # Login/register business logic
│   └── task_service.py      # Task CRUD business logic
├── schemas/
│   ├── __init__.py
│   ├── auth.py              # Pydantic: LoginRequest, RegisterRequest, AuthResponse
│   └── task.py              # Pydantic: TaskCreateRequest, TaskUpdateRequest, TaskResponse
├── db.py                    # SQLAlchemy session factory + connection pool
└── utils/
    ├── __init__.py
    └── errors.py            # Custom exception classes (401, 403, 404, 422)
```

**Ref**: Constitution §7 (Naming Conventions) / speckit.specify §2 (User Isolation)

---

#### Step 1.2: Database Initialization (SQLModel + Neon)

**Artifacts**:
- `backend/db.py`: Connection string, session factory, engine
- `backend/models/user.py`: User SQLModel with constraints
- `backend/models/task.py`: Task SQLModel with user_id FK

**Key Implementation Details**:
- Use SQLModel for ORM (combines SQLAlchemy + Pydantic)
- Connection pool: `poolclass=NullPool` or standard pool (10 connections)
- Lazy table creation on startup via `SQLModel.metadata.create_all()`
- User table: id (UUID), email (UNIQUE), password_hash, created_at, updated_at
- Task table: id (UUID), user_id (FK), title, description, completed (bool), created_at, updated_at
- Composite index: (user_id, created_at DESC) for dashboard query

**Ref**: specs/database/schema.md / Constitution §5 (User-Scoped DB Queries)

---

#### Step 1.3: JWT Middleware (Principle II Gatekeeper)

**Artifacts**: `backend/middleware/jwt.py`

**Implementation**:
```python
@app.middleware("http")
async def jwt_middleware(request: Request, call_next):
    # Skip public routes: /health, /api/v1/auth/login, /api/v1/auth/register
    if request.url.path in ["/health", "/api/v1/auth/login", "/api/v1/auth/register"]:
        return await call_next(request)

    # Extract Authorization header
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse({"detail": "Unauthorized"}, status_code=401)

    token = auth_header[7:]  # Remove "Bearer " prefix

    try:
        # Verify JWT signature using BETTER_AUTH_SECRET
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            return JSONResponse({"detail": "Unauthorized"}, status_code=401)

        # Attach user_id to request state
        request.state.user_id = user_id
        return await call_next(request)
    except jwt.ExpiredSignatureError:
        return JSONResponse({"detail": "Token expired"}, status_code=401)
    except jwt.InvalidTokenError:
        return JSONResponse({"detail": "Unauthorized"}, status_code=401)
```

**Ref**: Constitution §1 (JWT Auth) / specs/features/authentication.md §2

---

#### Step 1.4: Authentication Endpoints (Login/Register/Logout)

**Artifacts**: `backend/routes/auth.py`, `backend/services/auth_service.py`

**Endpoints**:
- `POST /api/v1/auth/login`: Verify credentials → issue JWT token
- `POST /api/v1/auth/register`: Create user with bcrypt password hash
- `POST /api/v1/auth/logout`: Clear frontend token (backend-optional tracking)

**Implementation**:
- Use `bcrypt` for password hashing (never store plaintext)
- JWT token: HS256 signature, 24-hour expiration, user_id in 'sub' claim
- Return 401 for invalid credentials, 400 for validation errors
- All responses use Pydantic models (AuthResponse, UserResponse)

**Ref**: specs/features/authentication.md / specs/api/rest-endpoints.md §Auth Endpoints

---

### Phase 2: Schema Implementation (Priority: P0)

**Goal**: Implement SQLModel database schema with proper constraints and indexes.

**Success Criteria**:
- SC-001: Users table created with unique email constraint
- SC-002: Tasks table created with user_id FK and proper indexes
- SC-003: All models export Pydantic response classes

#### Step 2.1: User Model

**Artifact**: `backend/models/user.py`

```python
from sqlmodel import SQLModel, Field
from uuid import UUID
from datetime import datetime

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[UUID] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(SQLModel):
    """Response model (no password_hash)"""
    id: UUID
    email: str
    created_at: datetime
```

**Ref**: specs/database/schema.md §Table: users

---

#### Step 2.2: Task Model

**Artifact**: `backend/models/task.py`

```python
from sqlmodel import SQLModel, Field
from uuid import UUID
from datetime import datetime

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[UUID] = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id")
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=4000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TaskResponse(SQLModel):
    """Response model"""
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

class TaskCreateRequest(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=4000)

class TaskUpdateRequest(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=4000)
    completed: Optional[bool] = Field(default=None)
```

**Ref**: specs/database/schema.md §Table: tasks / Constitution §5

---

### Phase 3: CRUD API Endpoints (Priority: P1)

**Goal**: Implement all task CRUD endpoints with user isolation enforced.

**Success Criteria**:
- SC-001: POST /api/v1/tasks creates task for authenticated user
- SC-002: GET /api/v1/tasks returns only user's tasks
- SC-003: PUT/PATCH /api/v1/tasks/{id} updates task if user owns it (403 otherwise)
- SC-004: PATCH /api/v1/tasks/{id}/complete toggles completion status
- SC-005: DELETE /api/v1/tasks/{id} removes task if user owns it
- SC-006: All endpoints return 401 without valid JWT token

#### Step 3.1: Create Task (POST /api/v1/tasks)

**Artifact**: `backend/routes/tasks.py`

**Implementation**:
- Accept TaskCreateRequest (title, optional description)
- Extract user_id from request.state.user_id (set by middleware)
- Insert into tasks table with user_id FK
- Return TaskResponse with 201 Created
- Validation: title non-empty, max 255 chars

**Ref**: specs/features/task-crud.md §User Story 1 / specs/api/rest-endpoints.md §POST /api/v1/tasks

---

#### Step 3.2: List Tasks (GET /api/v1/tasks)

**Artifact**: `backend/routes/tasks.py`

**Implementation**:
- Query: `SELECT * FROM tasks WHERE user_id = :user_id ORDER BY created_at DESC`
- Support pagination: limit (default 100), offset (default 0)
- Optional filtering: ?completed=true/false
- Return list of TaskResponse objects with total count
- Enforce user_id filter (Principle V)

**Ref**: specs/features/task-crud.md §User Story 2 / specs/api/rest-endpoints.md §GET /api/v1/tasks

---

#### Step 3.3: Get Single Task (GET /api/v1/tasks/{task_id})

**Artifact**: `backend/routes/tasks.py`

**Implementation**:
- Query: `SELECT * FROM tasks WHERE id = :task_id AND user_id = :user_id`
- Return 404 if not found OR user doesn't own it (no distinction)
- Return TaskResponse with 200 OK

**Ref**: specs/api/rest-endpoints.md §GET /api/v1/tasks/{task_id}

---

#### Step 3.4: Update Task (PUT /api/v1/tasks/{task_id})

**Artifact**: `backend/routes/tasks.py`

**Implementation**:
- Accept TaskUpdateRequest (all fields optional for PATCH behavior)
- Verify user owns task: `WHERE id = :task_id AND user_id = :user_id`
- Update fields (title, description, completed if provided)
- Refresh updated_at to current timestamp
- Return TaskResponse with 200 OK
- Return 403 if user doesn't own task

**Ref**: specs/api/rest-endpoints.md §PUT /api/v1/tasks/{task_id}

---

#### Step 3.5: Partial Update (PATCH /api/v1/tasks/{task_id})

**Artifact**: `backend/routes/tasks.py`

**Implementation**:
- Functionally identical to PUT (same behavior, same validation)
- Accept TaskUpdateRequest
- Update only provided fields

**Ref**: specs/api/rest-endpoints.md §PATCH /api/v1/tasks/{task_id}

---

#### Step 3.6: Complete Toggle (PATCH /api/v1/tasks/{task_id}/complete)

**Artifact**: `backend/routes/tasks.py`

**Implementation**:
- Specialized endpoint for toggling completion status
- Accept JSON: { "completed": true/false }
- Verify user owns task
- Update only completed field
- Refresh updated_at
- Return TaskResponse with 200 OK
- Identical security guarantees as generic PATCH

**Ref**: specs/api/rest-endpoints.md §PATCH /api/v1/tasks/{task_id}/complete

---

#### Step 3.7: Delete Task (DELETE /api/v1/tasks/{task_id})

**Artifact**: `backend/routes/tasks.py`

**Implementation**:
- Query: `DELETE FROM tasks WHERE id = :task_id AND user_id = :user_id`
- Return 204 No Content on success
- Return 403 if user doesn't own task
- Physical deletion (no soft delete)

**Ref**: specs/api/rest-endpoints.md §DELETE /api/v1/tasks/{task_id}

---

### Phase 4: Frontend Authentication & Setup (Priority: P1)

**Goal**: Integrate Better Auth in Next.js for secure token management.

**Success Criteria**:
- SC-001: Login page accepts email/password; redirects to dashboard on success
- SC-002: JWT token stored securely (httpOnly cookie or secure storage)
- SC-003: All API requests include Bearer token in Authorization header
- SC-004: Unauthenticated users cannot access /dashboard

#### Step 4.1: Project Structure

**Artifacts**: `frontend/` directory

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout with auth context provider
│   ├── page.tsx             # Home/landing page
│   └── auth/
│       └── login/
│           └── page.tsx     # Login page (public)
│   └── dashboard/
│       ├── layout.tsx       # Dashboard layout (protected)
│       ├── page.tsx         # Task list (protected)
│       └── tasks/
│           ├── new/
│           │   └── page.tsx # Create task form
│           └── [id]/
│               └── edit/
│                   └── page.tsx  # Edit task form
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx    # Client Component: Login form
│   │   └── LogoutButton.tsx # Client Component: Logout button
│   ├── tasks/
│   │   ├── TaskCard.tsx     # Client Component: Task display + actions
│   │   ├── TaskList.tsx     # Server Component: Fetch & display tasks
│   │   └── TaskForm.tsx     # Client Component: Create/edit form
│   └── shared/
│       ├── Header.tsx       # Server Component: Navigation header
│       └── LoadingSpinner.tsx
├── lib/
│   ├── api.ts               # HTTP client (fetch wrapper with Bearer token)
│   ├── auth.ts              # Better Auth setup + token management
│   ├── types.ts             # TypeScript interfaces (API responses)
│   └── utils.ts             # Utility functions
├── middleware.ts            # Next.js middleware (redirect unauthenticated users)
└── env.local                # Environment variables (gitignored)
```

**Ref**: Constitution §7 (Naming Conventions) / Constitution §3 (Server Components Default)

---

#### Step 4.2: Better Auth Integration

**Artifact**: `frontend/lib/auth.ts`

**Implementation**:
- Configure Better Auth client with API endpoint
- Manage JWT token lifecycle (store, retrieve, refresh, clear)
- Provide functions: login(email, password), logout(), getToken()
- Handle token expiration (401 → redirect to login)

**Ref**: specs/features/authentication.md

---

#### Step 4.3: API Client Setup

**Artifact**: `frontend/lib/api.ts`

**Implementation**:
```typescript
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid
    await logout();
    window.location.href = '/auth/login';
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export const getTasks = () => apiCall<TaskResponse[]>('/api/v1/tasks');
export const createTask = (data: TaskCreateRequest) =>
  apiCall('/api/v1/tasks', { method: 'POST', body: JSON.stringify(data) });
// ... etc.
```

**Ref**: Constitution §2 (API-First Backend)

---

#### Step 4.4: Next.js Middleware (Protection)

**Artifact**: `frontend/middleware.ts`

**Implementation**:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/tasks')) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Public routes
  if (pathname.startsWith('/auth/login')) {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**Ref**: Constitution §3 (Server Components Default)

---

### Phase 5: Frontend UI & Forms (Priority: P2)

**Goal**: Implement login, dashboard, and task form pages with Tailwind CSS styling.

**Success Criteria**:
- SC-001: Login page displays email/password fields with validation
- SC-002: Dashboard shows user's tasks with completion toggles
- SC-003: Create/edit task forms allow title + description input
- SC-004: All pages are responsive (mobile, tablet, desktop)
- SC-005: Accessibility: WCAG 2.1 AA compliance

#### Step 5.1: Login Page (/auth/login)

**Artifact**: `frontend/app/auth/login/page.tsx` + `frontend/components/auth/LoginForm.tsx`

**Layout**:
- Centered card: Email input, Password input, Login button, Register link
- Error message display on failed login
- Redirect to dashboard on success

**Components**:
- Page component (Server Component): Check auth state, redirect if authenticated
- LoginForm (Client Component): Handle form submission, call login API

**Ref**: specs/ui/pages.md §Page 1: Login Page

---

#### Step 5.2: Dashboard Page (/dashboard)

**Artifact**: `frontend/app/dashboard/page.tsx` + `frontend/components/tasks/TaskList.tsx`

**Layout**:
- Header: Logo, "My Tasks", Settings link, Logout button
- Task counter: "My Tasks (4)"
- Task list: Show all user's tasks as cards
- Create button: "+ New Task"
- Empty state: "No tasks yet. Create one to get started."

**Components**:
- Page component (Server Component): Fetch tasks via backend, pass to TaskList
- TaskList (Server Component): Display task list
- TaskCard (Client Component): Handle checkbox toggle, delete, edit actions

**Ref**: specs/ui/pages.md §Page 2: Dashboard Page

---

#### Step 5.3: Task Form (/dashboard/tasks/new, /dashboard/tasks/{id}/edit)

**Artifact**: `frontend/app/dashboard/tasks/new/page.tsx` + `frontend/components/tasks/TaskForm.tsx`

**Layout**:
- Back button (← Back)
- Page title: "Create New Task" or "Edit Task"
- Title input (required): "What needs to be done?"
- Description textarea (optional): "Add notes, details..."
- Save button, Cancel button
- Unsaved changes warning

**Components**:
- Page component (Server Component): Fetch task data if editing
- TaskForm (Client Component): Handle form submission, validation errors

**Ref**: specs/ui/pages.md §Page 3: Task Create/Edit Page

---

#### Step 5.4: Styling & Responsiveness

**Technology**: Tailwind CSS (already in Next.js setup)

**Design System**:
- Colors: Blue (primary), Green (success), Red (error), Gray (neutral)
- Typography: System fonts, responsive sizes
- Animations: Smooth transitions (200-300ms)
- Breakpoints: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)

**Ref**: specs/ui/pages.md §Responsive Design, Color Scheme, Typography

---

#### Step 5.5: Accessibility

**Standards**: WCAG 2.1 AA compliance

**Implementation**:
- Semantic HTML (form, button, input with proper labels)
- ARIA labels for icons and action buttons
- Keyboard navigation: Tab, Enter, Escape
- Focus management: Visible focus ring, focus moves to next item after deletion
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Error messages linked via aria-describedby

**Ref**: specs/ui/pages.md §Accessibility sections

---

## Part 3: Cross-Layer Integration

### 3.1 Data Flow: Create Task

```
User clicks "+ New Task"
    ↓
Navigate to /dashboard/tasks/new
    ↓
TaskForm renders (Client Component)
    ↓
User enters title "Buy groceries" + description "Milk, eggs, bread"
    ↓
User clicks Save
    ↓
TaskForm validates (title non-empty, max 255 chars)
    ↓
TaskForm calls apiCall('POST /api/v1/tasks', { title, description })
    ↓
API client adds Authorization header with Bearer token
    ↓
FastAPI receives request
    ↓
JWT middleware verifies token, extracts user_id → request.state.user_id
    ↓
POST /api/v1/tasks handler:
  - Validate TaskCreateRequest (Pydantic)
  - Create Task instance with user_id from request.state
  - Insert into tasks table (user_id → users.id FK constraint)
  - Return TaskResponse with 201 Created
    ↓
Frontend receives response
    ↓
TaskForm clears form, redirects to /dashboard
    ↓
Dashboard page refreshes task list (Server Component fetches via API)
    ↓
New task appears in list!
```

**Validation Layers**:
1. **Frontend**: HTML5 validation (type="text", required)
2. **Frontend Form**: JavaScript validation (title.length > 0)
3. **Backend (Pydantic)**: title min_length=1, max_length=255
4. **Database**: title VARCHAR(255) NOT NULL
5. **Database Constraint**: user_id FK references users.id

**Ref**: Constitution §2 (API-First Backend) + §6 (Error Handling)

---

### 3.2 Data Flow: Toggle Task Completion

```
User clicks checkbox on task card
    ↓
TaskCard (Client Component) optimistically updates UI (checked ☑)
    ↓
TaskCard calls apiCall('PATCH /api/v1/tasks/{id}/complete', { completed: true })
    ↓
JWT middleware verifies token
    ↓
PATCH handler:
  - Verify task exists and user owns it (WHERE id = :task_id AND user_id = :user_id)
  - Return 403 if user doesn't own task
  - Update completed = true, updated_at = CURRENT_TIMESTAMP
  - Return TaskResponse with 200 OK
    ↓
Frontend receives response
    ↓
If error, revert UI update (show error toast)
If success, keep UI update (already done optimistically)
```

**Security**: Database query scoped by user_id + JWT verification

**Ref**: specs/features/task-crud.md §User Story 3 / specs/api/rest-endpoints.md §PATCH /api/v1/tasks/{id}/complete

---

### 3.3 Data Flow: User Isolation Test

```
User A logs in → Token contains user_id_A
User A creates Task 1 (inserted with user_id = user_id_A)

User B logs in → Token contains user_id_B
User B requests GET /api/v1/tasks/task_1_id

Backend:
  - JWT middleware extracts user_id = user_id_B
  - Query: SELECT * FROM tasks WHERE id = task_1_id AND user_id = user_id_B
  - Result: 0 rows found
  - Return 404 Not Found

User B cannot see User A's task ✓
```

**Defense Layers**:
1. JWT middleware verifies token signature
2. User_id extracted from JWT 'sub' claim
3. Database query filtered by user_id
4. Foreign key constraint prevents orphaned tasks
5. Return 404 regardless of reason (no information leakage)

**Ref**: Constitution §1 (JWT Auth & User Isolation) + §5 (User-Scoped DB Queries)

---

## Part 4: Testing & Validation Strategy

### 4.1 Unit Testing

**Backend**:
- Auth service: Login/register logic, password hashing
- Task service: CRUD operations with user_id filtering
- Pydantic models: Validation rules

**Frontend**:
- TaskForm: Validation, error handling
- API client: Bearer token inclusion, error responses

---

### 4.2 Integration Testing

**Backend**:
- JWT middleware + protected endpoints: Verify 401 without token, 200 with valid token
- User isolation: Two users, verify cross-user operations return 403
- Database constraints: FK enforcement, unique email

**Frontend**:
- Login → Dashboard redirect: Verify token stored and retrieved
- Create task → Appears in list: Full flow test
- Toggle completion: Optimistic update + API sync

---

### 4.3 End-to-End Testing

**Scenario 1: User Registration & Login**
1. Register new account with unique email
2. Verify account created in database
3. Login with same credentials
4. Verify token issued and stored
5. Redirect to dashboard

**Scenario 2: Complete Task Workflow**
1. Login
2. Create 3 tasks
3. Toggle 1 task as complete
4. Delete 1 task
5. Verify task list shows correct state

**Scenario 3: User Isolation**
1. Create User A with Task A
2. Create User B with Task B
3. User A logs in, verifies only Task A visible
4. User B logs in, verifies only Task B visible
5. User A attempts direct API call to User B's task → 403

---

### 4.4 Success Criteria Mapping

| Success Criteria | Test Method | Validation |
|-----------------|------------|-----------|
| SC-001 (Create task < 2s) | Load test with 100 concurrent users | Measure P95 latency |
| SC-002 (Dashboard < 1s) | GET /api/v1/tasks latency | Query plan analysis |
| SC-003 (100% CRUD success) | Functional test suite | All endpoints pass |
| SC-004 (100% user isolation) | Cross-user attack test | No data leakage |
| SC-005 (5-minute workflow) | Manual user test | Timer for full flow |
| SC-006 (Concurrent operations) | Multiple clients, same user | Verify consistency |

---

## Part 5: Deployment & Configuration

### 5.1 Environment Variables

**Backend** (`.env` or environment):
```
DATABASE_URL=postgresql://user:password@neon-instance.neon.tech/dbname
BETTER_AUTH_SECRET=<your-secret-key-min-32-chars>
API_PORT=8000
LOG_LEVEL=info
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Todo App
```

---

### 5.2 Deployment Checklist

- [ ] Backend: Deploy to cloud (Vercel, Railway, Heroku)
- [ ] Frontend: Deploy to Vercel with environment variables
- [ ] Database: Neon PostgreSQL instance created and accessible
- [ ] SSL/HTTPS: Enabled on both frontend and backend
- [ ] CORS: Configured to allow frontend origin
- [ ] Secrets: Stored in environment, never committed
- [ ] Health check: `/health` endpoint responds 200
- [ ] Monitoring: Error tracking (Sentry) configured
- [ ] Backups: Database backups scheduled (Neon handles this)

---

## Part 6: Phase Completion Criteria

### Phase 1: Backend Foundation
**Complete when**:
- FastAPI server boots with Neon connection
- JWT middleware verifies tokens and rejects invalid ones
- Database tables created (users, tasks)
- All authentication endpoints (login, register, logout) working

### Phase 2: Database Schema
**Complete when**:
- User model with email unique constraint
- Task model with user_id FK to users.id
- Indexes created: user_id, (user_id, created_at DESC)
- Pydantic response models defined

### Phase 3: Task CRUD Endpoints
**Complete when**:
- All 7 endpoints implemented and tested
- User isolation verified (403 for cross-user operations)
- Error responses follow Constitution §6
- Pagination working on GET /api/v1/tasks

### Phase 4: Frontend Authentication
**Complete when**:
- Better Auth integrated in Next.js
- Login page functional (email/password → token → dashboard)
- API client includes Bearer token in all requests
- Middleware protects /dashboard routes

### Phase 5: Frontend UI
**Complete when**:
- Login page fully styled and responsive
- Dashboard displays user's tasks
- Create/edit task forms functional
- Accessibility: WCAG 2.1 AA compliance verified

---

## Part 7: Traceability to Requirements

| Requirement | Feature Spec | Plan Section | Implementation Phase |
|-------------|-------------|--------------|---------------------|
| FR-001: Create tasks | task-crud.md | Step 3.1 | Phase 3 |
| FR-002: Associate with user_id | task-crud.md | Step 3.1 | Phase 3 |
| FR-003: Persist task data | database/schema.md | Step 2.2 | Phase 2 |
| FR-004: Retrieve user's tasks | task-crud.md | Step 3.2 | Phase 3 |
| FR-005: Prevent cross-user access | task-crud.md | Step 3.3-3.7 | Phase 3 |
| FR-006: Update tasks | task-crud.md | Step 3.4-3.6 | Phase 3 |
| FR-007: Update updated_at | database/schema.md | Step 2.2 | Phase 2 |
| FR-008: Delete tasks | task-crud.md | Step 3.7 | Phase 3 |
| FR-009: Require JWT Bearer token | authentication.md | Step 1.3 | Phase 1 |
| FR-010: Validate title & description | database/schema.md | Step 2.2 | Phase 2 |
| SC-001: Create < 2s | task-crud.md | Section 4.4 | Testing |
| SC-002: Dashboard < 1s | task-crud.md | Section 4.4 | Testing |
| SC-003: 100% CRUD success | task-crud.md | Section 4.4 | Testing |
| SC-004: 100% user isolation | authentication.md | Section 3.3 | Testing |

---

## Part 8: References

**Constitution**: `/home/khadija/hackthon2/phase2/.specify/memory/constitution.md`

**Feature Specifications**:
- `/home/khadija/hackthon2/phase2/specs/features/authentication.md`
- `/home/khadija/hackthon2/phase2/specs/features/task-crud.md`

**Technical Specifications**:
- `/home/khadija/hackthon2/phase2/specs/database/schema.md`
- `/home/khadija/hackthon2/phase2/specs/api/rest-endpoints.md`
- `/home/khadija/hackthon2/phase2/specs/ui/pages.md`

---

## Governance

**Plan Status**: Active (Ready for Task Generation)

**Approved By**: Spec-Driven Development Process

**Next Step**: Run `sp.tasks` to generate granular Task IDs (T-001, T-002, etc.) with "No Task = No Code" enforcement

**Modification Log**:
- 2026-01-17: Initial plan generated with full alignment to Constitution Principles I-VII
