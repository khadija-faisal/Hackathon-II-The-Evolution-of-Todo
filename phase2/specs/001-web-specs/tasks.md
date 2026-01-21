  ---
description: "Phase-Aligned Task Breakdown - Todo App Phase II (Restructured for SDD Compliance)"
version: "2.0.1"
status: "Active"
created: "2026-01-17"
updated: "2026-01-18"
---

# Tasks: Todo App - Phase II
## Phase-Aligned Breakdown with Strict Traceability

**Input Documents**:
- plan.md (Phase 1-5 roadmap with technical steps)
- spec.md, authentication.md, task-crud.md (11 user stories with FR-XXX, SC-XXX)
- schema.md (Database design with SQLModel, composite indexes)
- rest-endpoints.md (8 API endpoints with request/response models)
- pages.md (UI design with WCAG 2.1 AA accessibility)
- constitution.md (7 non-negotiable principles)

**Key Principle**: Every task maps to an explicit specification section. "No Task = No Code."

---

## Phase 1: Setup (Project Initialization)

**Goal**: Establish project structure and environment
**Duration**: ~1 day
**Blocking**: YES - Blocks all downstream work

| Task ID | Description (Technical & Specific) | Reference | Implementation Source |
|---------|-----------------------------------|-----------|----------------------|
| T-001 | Initialize FastAPI backend project with main.py, config.py, and directory structure (/backend/main.py, /backend/config.py, /backend/models/, /backend/routes/, /backend/services/, /backend/middleware/, /backend/schemas/, /backend/utils/) | Infrastructure | plan.md §1.1: Backend Project Structure |
| T-002 | Initialize Next.js 15 frontend project with App Router (/frontend/app/, /frontend/components/, /frontend/lib/, /frontend/middleware.ts) | Infrastructure | plan.md §4.1: Frontend Project Structure |
| T-003 | Create .env.example template with DATABASE_URL, BETTER_AUTH_SECRET, API_PORT, NEXT_PUBLIC_API_URL placeholders | Constitution §VI | plan.md §5.1: Environment Variables |
| T-004 | Configure FastAPI main.py with CORS settings for localhost:3000 (frontend origin), error handling middleware | Constitution §VI | plan.md §1.3: JWT Middleware |
| T-005 | Setup backend/config.py with Settings class for DATABASE_URL (Neon PostgreSQL), BETTER_AUTH_SECRET, JWT_EXPIRATION_HOURS | Constitution §VI, FR-004 (JWT expiration), FR-005 (BETTER_AUTH_SECRET) | plan.md §1.3 |
| T-006 | Create .gitignore: Python (__pycache__, *.pyc, .venv/), Node (node_modules/, .next/), Environment (.env.local, .env) | Constitution §VI (No hardcoded secrets) | plan.md §5.2: Deployment |

**Phase 1 Checkpoint**: Project structure created; dependencies installed; environment template ready

---

## Phase 2: Foundational Infrastructure (BLOCKING PHASE)

**Goal**: Core systems that ALL user stories depend on
**Duration**: ~3-4 days
**⚠️ CRITICAL**: NO user story implementation begins until Phase 2 is 100% complete

### Database & Persistence Layer

| Task ID | Description (Technical & Specific) | Reference | Implementation Source |
|---------|-----------------------------------|-----------|----------------------|
| T-007 | Implement SQLAlchemy session factory in backend/db.py: Create engine with DATABASE_URL, configure connection pool (NullPool for Neon), session maker with expire_on_commit=False | Infrastructure (Database connectivity) | plan.md §1.2: Database Initialization (SQLModel + Neon) |
| T-008 | Create User SQLModel in backend/models/user.py: Table name "users" (plural lowercase), fields: id (UUID, PK), email (VARCHAR 255, UNIQUE, indexed), password_hash (VARCHAR 255), created_at (TIMESTAMP UTC), updated_at (TIMESTAMP UTC) | FR-002 (verify credentials), FR-011 (secure hashing) | schema.md §Table: users |
| T-009 | Create Task SQLModel in backend/models/task.py: Table name "tasks" (plural lowercase), fields: id (UUID, PK), user_id (UUID, FK→users.id), title (VARCHAR 255, NOT NULL), description (TEXT, nullable), completed (BOOLEAN, default=False), created_at (TIMESTAMP UTC), updated_at (TIMESTAMP UTC) | task-crud.md FR-003 (persist task data), FR-002 (user_id association) | schema.md §Table: tasks |
| T-010 | Create composite index idx_tasks_user_id_created_at on (user_id, created_at DESC) in backend/models/task.py with SQLAlchemy Index(): Optimizes query pattern "SELECT * FROM tasks WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 100" for dashboard performance. Index enables: (1) fast user_id lookup, (2) pre-sorted by created_at DESC (newest first), (3) reduces full table scan, (4) satisfies SC-002 (Dashboard < 1 second latency) | task-crud.md FR-004 (user-scoped queries), SC-002 (Dashboard latency) | schema.md §Indexing Strategy §Secondary Indexes, §Performance Implications |
| T-011 | Setup SQLModel.metadata.create_all() on FastAPI startup in backend/main.py to initialize users and tasks tables in Neon PostgreSQL: Call before first request, handles idempotent schema creation, works with connection pooling | Infrastructure (Database schema initialization) | plan.md §1.2: Database Initialization |

### Authentication & JWT Bridge Pattern

| Task ID | Description (Technical & Specific) | Reference | Implementation Source |
|---------|-----------------------------------|-----------|----------------------|
| T-012 | Implement JWT middleware in backend/middleware/jwt.py per Constitution Principle I (JWT Bridge Pattern): Extract "Authorization: Bearer <token>" header, verify signature using BETTER_AUTH_SECRET with HS256 algorithm, extract user_id from 'sub' claim, attach to request.state.user_id, return 401 for missing/invalid/expired tokens | FR-005, FR-007 | plan.md §1.3: JWT Middleware (Principle II Gatekeeper); Constitution §I |
| T-012.1 | Verify SC-002 JWT Security: Create test case in backend/tests/test_jwt_middleware.py to validate 100% rejection of invalid/expired JWT tokens with 401 Unauthorized response. Test cases: (1) Missing Authorization header → 401, (2) Invalid Bearer format → 401, (3) Tampered token (signature invalid) → 401, (4) Expired token (exp claim < now) → 401, (5) Valid token → 200 (allowed through) | FR-007, SC-002 | plan.md §1.3: JWT Middleware; authentication.md §FR-007 |
| T-013 | Create auth schema in backend/schemas/auth.py: LoginRequest (email, password), RegisterRequest (email, password), AuthResponse (access_token, token_type="Bearer", user: UserResponse) using Pydantic models | FR-001, FR-014 | rest-endpoints.md §Pydantic Models, §POST /api/v1/auth/login |
| T-014 | Create task schemas in backend/schemas/task.py: TaskCreateRequest (title: str min_length=1 max_length=255, description: Optional[str] max_length=4000), TaskUpdateRequest (all fields optional for PATCH), TaskResponse (id, user_id, title, description, completed, created_at, updated_at) | FR-010, FR-014 | rest-endpoints.md §Pydantic Models |
| T-015 | Create response models in backend/schemas/__init__.py: UserResponse (id, email, created_at - no password_hash) | FR-001, FR-014 | rest-endpoints.md §Pydantic Models §UserResponse |

### Error Handling & Utilities

| Task ID | Description (Technical & Specific) | Reference | Implementation Source |
|---------|-----------------------------------|-----------|----------------------|
| T-016 | Create backend/utils/errors.py with custom HTTPException classes: AppException (base), UnauthorizedError (401), ForbiddenError (403), NotFoundError (404), ValidationError (422), ServerError (500) with consistent error response format | Constitution §VI | Constitution §VI: Error Handling Standards |
| T-017 | Create backend/utils/password.py with bcrypt utilities: hash_password(plaintext: str) → bcrypt hash, verify_password(plaintext: str, hashed: str) → bool for secure password comparison | FR-002, FR-011 | authentication.md §FR-002: MUST verify credentials using secure password hashing (bcrypt) |

### Frontend Foundation

| Task ID | Description (Technical & Specific) | Reference | Implementation Source |
|---------|-----------------------------------|-----------|----------------------|
| T-018 | Implement frontend/lib/auth.ts (Better Auth integration): Setup Better Auth client with API endpoint, provide functions: login(email, password), logout(), getToken(), isAuthenticated() | FR-008, FR-009 | plan.md §4.2: Better Auth Integration |
| T-019 | Create frontend/lib/api.ts (API client with Bearer token injection): apiCall<T>(endpoint, options) wrapper that: (1) gets token via getToken(), (2) adds "Authorization: Bearer <token>" header, (3) handles 401 responses by redirecting to login, (4) returns typed response | Constitution §II | plan.md §4.3: API Client Setup |
| T-020 | Create frontend/lib/types.ts with TypeScript types: TaskResponse, UserResponse, AuthResponse matching backend Pydantic models | Constitution §VII | rest-endpoints.md §Pydantic Models |
| T-021 | Setup frontend/middleware.ts (Next.js route protection): Redirect unauthenticated users from /dashboard and /tasks/* routes to /auth/login; redirect authenticated users from /auth/login to /dashboard | FR-004 | plan.md §4.4: Next.js Middleware (Protection) |

**Phase 2 Checkpoint**:
- ✅ JWT middleware verifies all tokens correctly; returns 401 for invalid
- ✅ Database tables created with correct schema and indexes
- ✅ API client automatically includes Bearer token in all requests
- ✅ Frontend middleware protects routes correctly
- ✅ No sensitive data exposed in frontend code

---

## Phase 3: Task CRUD Operations (Priority: P1 Backend)

**Goal**: Implement full task creation, reading, updating, and deletion API endpoints with user isolation enforced
**Duration**: ~3-4 days
**Dependencies**: Phase 2 (foundational) must be complete

### Backend Services & Endpoints (User Isolation ENFORCED on all queries)

| Task ID | Description (Technical & Specific) | Reference | Implementation Source |
|---------|-----------------------------------|-----------|----------------------|
| T-022 | Create backend/services/task_service.py with create_task(user_id: UUID, title: str, description: Optional[str]) → Task: Insert task with user_id from JWT claims (NOT request body), set completed=False, created_at/updated_at to UTC now | FR-001, FR-002 | plan.md §3.1: Create Task; task-crud.md §User Story 1; rest-endpoints.md §POST /api/v1/tasks |
| T-023 | Implement get_user_tasks(user_id: UUID, completed: Optional[bool], limit: int=100, offset: int=0) → List[Task]: Query "SELECT * FROM tasks WHERE user_id = :user_id [AND completed = :completed] ORDER BY created_at DESC LIMIT :limit OFFSET :offset" (user_id filtering MANDATORY per Constitution §V) | FR-004 | plan.md §3.2: List Tasks; rest-endpoints.md §GET /api/v1/tasks |
| T-024 | Implement get_task_by_id(user_id: UUID, task_id: UUID) → Task: Query "SELECT * FROM tasks WHERE id = :task_id AND user_id = :user_id" (verify ownership before returning; return None if not found OR user doesn't own task) | FR-004, FR-005 | plan.md §3.3: Get Single Task; task-crud.md §Edge Cases |
| T-025 | Implement update_task(user_id: UUID, task_id: UUID, updates: TaskUpdateRequest) → Task: Verify user owns task (WHERE id AND user_id), update only provided fields, refresh updated_at to UTC now, return updated task | FR-006, FR-007 | plan.md §3.4, §3.5, §3.6: Update Task, Partial Update, Complete Toggle; rest-endpoints.md §PUT, PATCH /api/v1/tasks/{id} |
| T-026 | Implement delete_task(user_id: UUID, task_id: UUID) → None: Verify user owns task (WHERE id AND user_id), physically delete from database, raise 404 if not found | FR-008 | plan.md §3.7: Delete Task; rest-endpoints.md §DELETE /api/v1/tasks/{id} |
| T-027 | Create backend/routes/tasks.py with endpoint POST /api/v1/tasks: PREREQUISITE - Ensure Pydantic models (TaskCreateRequest, TaskResponse) are defined per T-014 as per rest-endpoints.md before implementing. Accept TaskCreateRequest, extract user_id from request.state.user_id (set by JWT middleware T-012), call task_service.create_task(), return TaskResponse with 201 Created status | FR-001, FR-014 | rest-endpoints.md §POST /api/v1/tasks §Pydantic Models; plan.md §3.1: Create Task |
| T-028 | Create backend/routes/tasks.py endpoint GET /api/v1/tasks: Accept query params completed (optional bool), limit (default 100), offset (default 0), extract user_id from request.state, call task_service.get_user_tasks(), return {"tasks": List[TaskResponse], "total": int} with 200 OK | FR-004 | rest-endpoints.md §GET /api/v1/tasks |
| T-029 | Create backend/routes/tasks.py endpoint GET /api/v1/tasks/{task_id}: Extract user_id from request.state, call get_task_by_id(user_id, task_id), return TaskResponse with 200 OK or 404 if not found (return 404 regardless of reason - no info leakage) | FR-004, FR-005 | rest-endpoints.md §GET /api/v1/tasks/{task_id} |
| T-030 | Create backend/routes/tasks.py endpoint PUT /api/v1/tasks/{task_id}: Accept TaskUpdateRequest (all fields optional), extract user_id from request.state, verify ownership, update task, return TaskResponse with 200 OK; return 403 if user doesn't own task | FR-006 | rest-endpoints.md §PUT /api/v1/tasks/{task_id} |
| T-031 | Create backend/routes/tasks.py endpoint PATCH /api/v1/tasks/{task_id}: Functionally identical to PUT (accept optional fields, update only provided, refresh updated_at) | FR-006 | rest-endpoints.md §PATCH /api/v1/tasks/{task_id} |
| T-032 | Create backend/routes/tasks.py convenience endpoint PATCH /api/v1/tasks/{task_id}/complete: Accept {"completed": bool}, extract user_id, verify ownership, update only completed field, refresh updated_at, return TaskResponse with 200 OK; return 403 if user doesn't own task | FR-006 | rest-endpoints.md §PATCH /api/v1/tasks/{task_id}/complete; plan.md §3.6: Complete Toggle |
| T-033 | Create backend/routes/tasks.py endpoint DELETE /api/v1/tasks/{task_id}: Extract user_id from request.state, verify ownership, physically delete task, return 204 No Content; return 403 if user doesn't own task, 404 if not found | FR-008 | rest-endpoints.md §DELETE /api/v1/tasks/{task_id} |
| T-034 | Add error handling to all task endpoints in backend/routes/tasks.py: Return 400 for validation errors (title too short/long), 401 for missing token (caught by middleware), 403 for permission denied, 404 for not found, 500 for server errors | Constitution §VI | Constitution §VI: Error Handling Standards |

**Phase 3 Checkpoint**:
- ✅ All 7 CRUD endpoints implemented and functional
- ✅ Every endpoint filters by user_id from JWT (user isolation enforced)
- ✅ Pagination working on GET /api/v1/tasks
- ✅ Error responses follow Constitution §VI standards
- ✅ Test: Two users verify they cannot see each other's tasks (403 or 404)

---

## Phase 4: Frontend UI & Integration (Priority: P1-P3 Frontend)

**Goal**: Implement login page, dashboard, and task forms with full integration to backend API
**Duration**: ~3-4 days
**Dependencies**: Phase 2 (foundational) + Phase 3 (backend endpoints) must be complete

### Authentication UI (User Story 1 & 4: Login + Registration)

| Task ID | Description (Technical & Specific) | Reference | Implementation Source |
|---------|-----------------------------------|-----------|----------------------|
| T-035 | Create frontend/app/auth/login/page.tsx (Server Component): Check if user is authenticated via getAuth(); if yes, redirect to /dashboard; if no, render LoginForm component | FR-001 | pages.md §Page 1: Login Page; plan.md §4.1 |
| T-036 | Create frontend/components/auth/LoginForm.tsx (Client Component): Form with email input (type="email", placeholder="you@example.com"), password input (type="password"), error message display area (red background, auto-dismiss 5s), "Login" button with loading state (spinner), optional "Register" link | FR-001 | pages.md §Page 1: Login Page Layout & Components |
| T-037 | Implement form validation in LoginForm.tsx: On form submit, validate email format (HTML5 email type), password not empty (min 8 chars recommended); on validation fail, show specific error message | pages.md §Page 1 | pages.md §Page 1: Email Input Field, Password Input Field |
| T-038 | Implement login API call in LoginForm.tsx: Call apiCall<AuthResponse>("/api/v1/auth/login", {method: "POST", body: JSON.stringify({email, password})}), on success store token via auth.ts login(), redirect to /dashboard; on 401/404 show error message, re-enable form | FR-001, FR-008 | rest-endpoints.md §POST /api/v1/auth/login |
| T-038.1 | Create frontend/context/AuthContext.tsx (AuthProvider/Context): Implement React Context to manage JWT persistence and authenticated user state across all protected routes. Provider must: (1) Read token from localStorage/secure storage on app load, (2) Expose getToken(), setToken(token), clearToken() methods, (3) Provide user state (id, email) to all components via useAuth() hook, (4) Sync with auth.ts login/logout functions from T-018, (5) Allow dashboard/protected pages to access auth state without prop drilling | FR-008, FR-009 | pages.md §State Management §Authenticated User State; plan.md §4.2: Better Auth Integration |
| T-039 | Add accessibility to LoginForm.tsx: Associate labels with inputs (htmlFor attribute), link error messages via aria-describedby, ensure keyboard navigation (Tab, Enter), visible focus ring on inputs | pages.md §Page 1 Accessibility | pages.md §Page 1: Accessibility Section |
| T-040 | Create frontend/app/auth/register/page.tsx (Server Component, optional for MVP): Similar structure to login page but render RegisterForm | FR-012 | pages.md §Page 1 (future); authentication.md §User Story 4 |
| T-041 | Create frontend/components/auth/RegisterForm.tsx (Client Component, optional for MVP): Email and password inputs, validation, call POST /api/v1/auth/register, handle duplicate email error (400), redirect to login on success | FR-012 | rest-endpoints.md §POST /api/v1/auth/register |

### Dashboard & Task List UI (User Story 2: Read/List Tasks)

| Task ID | Description (Technical & Specific) | Reference | Implementation Source |
|---------|-----------------------------------|-----------|----------------------|
| T-042 | Create frontend/app/dashboard/page.tsx (Server Component): Fetch user's tasks on server using apiCall("/api/v1/tasks"), render Header component and TaskList component; show loading skeleton while fetching | FR-004 | pages.md §Page 2: Dashboard Page; plan.md §4.1 |
| T-043 | Create frontend/components/shared/Header.tsx (Server Component): Display app logo/name, "My Tasks" title, task counter (total count), Settings icon (future), Logout button | pages.md §Page 2: Header | pages.md §Page 2: Components §Header |
| T-044 | Create frontend/components/tasks/TaskList.tsx (Server Component): Receive tasks array as prop, render list of TaskCard components in descending created_at order, show empty state message "No tasks yet. Create one to get started." if no tasks; include "+ New Task" button linking to /dashboard/tasks/new | FR-004 | pages.md §Page 2: Task List Container |
| T-045 | Create frontend/components/tasks/TaskCard.tsx (Client Component): Display task as card with: checkbox (onClick calls PATCH /api/v1/tasks/{id}/complete with optimistic UI), title (bold), description (gray, smaller), Edit button (→ /dashboard/tasks/{id}/edit), Delete button (→ confirmation modal) | FR-005, FR-006, FR-008 | pages.md §Page 2: Task Item Card |
| T-046 | Implement checkbox toggle in TaskCard.tsx: On click, optimistically update UI (mark as complete), call apiCall("PATCH /api/v1/tasks/{id}/complete", {method: "PATCH", body: JSON.stringify({completed: !task.completed})}); on error revert UI, show error toast | FR-006 | pages.md §Page 2: User Interactions §User toggles task completion |
| T-047 | Implement delete confirmation in TaskCard.tsx: On delete button click, show modal "Delete this task?"; on confirm, call apiCall("DELETE /api/v1/tasks/{id}", {method: "DELETE"}), remove task from list (or refresh list); on cancel, close modal | FR-008 | pages.md §Page 2: User Interactions §User deletes task |
| T-048 | Add styling to dashboard components (Header, TaskList, TaskCard) using Tailwind CSS: Header with bg-slate-50, TaskCard with border border-gray-200 and hover shadow, completed tasks with line-through text-gray-500, responsive layout (mobile: full-width, desktop: max-800px centered) | pages.md §Page 2 | pages.md §Responsive Design §Color Scheme §Typography |
| T-049 | Add Logout button to Header.tsx: On click, show confirmation "Log out?"; on confirm, call auth.logout(), clear token, redirect to /auth/login; on cancel, close modal | FR-009 | authentication.md §User Story 3; pages.md §Page 2 |
| T-050 | Add accessibility to TaskList/TaskCard: Semantic HTML (ul/li or appropriate roles), checkbox with proper label, delete button aria-label="Delete task: {title}", focus management (focus moves to next item after deletion), keyboard navigation (Tab through items) | pages.md §Page 2 Accessibility | pages.md §Page 2: Accessibility Section |

### Task Form UI (User Story 5 & 7: Create + Update Tasks)

| Task ID | Description (Technical & Specific) | Reference | Implementation Source |
|---------|-----------------------------------|-----------|----------------------|
| T-051 | Create frontend/app/dashboard/tasks/new/page.tsx (Server Component): Render TaskForm component in create mode; TaskForm should fetch nothing (empty form) | FR-001 | pages.md §Page 3: Task Create/Edit Page |
| T-052 | Create frontend/app/dashboard/tasks/[id]/edit/page.tsx (Server Component): Extract task_id from params, fetch task via apiCall("/api/v1/tasks/{id}"), render TaskForm component in edit mode with pre-populated data | FR-006 | pages.md §Page 3: User Interactions §Edit Existing Task |
| T-053 | Create frontend/components/tasks/TaskForm.tsx (Client Component): Form with: Back button (← Back), Page title ("Create New Task" or "Edit Task"), Title input (required, max 255 chars, placeholder "What needs to be done?"), Description textarea (optional, max 4000 chars), Save & Cancel buttons | FR-001, FR-006 | pages.md §Page 3: Layout & Components |
| T-054 | Implement form validation in TaskForm.tsx: On Save click, validate title is non-empty and ≤255 chars; if validation fails, show error message; if validation passes, disable form and send request | FR-010 | pages.md §Page 3: User Interactions §Validation Flow |
| T-055 | Implement create flow in TaskForm.tsx: Call apiCall("/api/v1/tasks", {method: "POST", body: JSON.stringify({title, description})}); on 201 success, show "Task saved!" toast, redirect to /dashboard; on 400 error, show validation error message, re-enable form | FR-001 | rest-endpoints.md §POST /api/v1/tasks |
| T-056 | Implement edit flow in TaskForm.tsx: Call apiCall("/api/v1/tasks/{id}", {method: "PUT", body: JSON.stringify({title, description, completed: existing_completed})}); on 200 success, show "Task saved!", redirect to /dashboard; on 403 error, show "Permission denied", redirect to /dashboard; on 404, redirect to /dashboard | FR-006 | rest-endpoints.md §PUT /api/v1/tasks/{id} |
| T-057 | Implement unsaved changes detection in TaskForm.tsx: Track if form has been modified; on Back/Cancel click, if modified, show confirmation "Discard unsaved changes?"; on confirm, navigate away; on cancel, keep form open | pages.md §Page 3 | pages.md §Page 3: User Interactions §Discard Changes |
| T-058 | Add styling to TaskForm using Tailwind CSS: Card layout, centered, max-width 600px, input fields with proper spacing, error messages in red, Save button primary (blue), Cancel button secondary (outline) | pages.md §Page 3 | pages.md §Color Scheme §Typography |
| T-059 | Add accessibility to TaskForm: Form labels associated with inputs (htmlFor), error messages linked via aria-describedby, Submit/Cancel buttons have clear labels, keyboard navigation (Tab, Enter to submit, Escape to cancel), focus management (focus to first error field on validation fail) | pages.md §Page 3 Accessibility | pages.md §Page 3: Accessibility Section |

### Global UI Polish

| Task ID | Description (Technical & Specific) | Reference | Implementation Source |
|---------|-----------------------------------|-----------|----------------------|
| T-060 | Create frontend/app/layout.tsx (Root Server Component): Setup global Tailwind styles, auth context provider, ensure httpOnly cookie handling for JWT token | Constitution §III | pages.md §Design Principles |
| T-061 | Create frontend/app/page.tsx (Home/Landing Server Component): Redirect authenticated users to /dashboard, unauthenticated users to /auth/login, or show landing page | pages.md §Page 1, §Page 2 | pages.md |
| T-062 | Implement animations in frontend components: Checkbox toggle (200ms bounce + fade), task creation (300ms slide in), task deletion (200ms fade out), button hover (100ms shadow increase), error message (150ms fade in, 200ms fade out) | pages.md §Animations | pages.md §Animations Table |
| T-063 | Add error boundary component in frontend/components/ErrorBoundary.tsx: Catch errors, display user-friendly message ("Something went wrong. Please refresh."), log error to console/monitoring | pages.md §Error Handling | pages.md §Error Handling §User-Facing Errors |

**Phase 4 Checkpoint**:
- ✅ Login page fully functional: email/password form → token stored → redirect to dashboard
- ✅ Dashboard displays user's tasks only (user isolation verified)
- ✅ Task CRUD fully works: create → read → update (checkbox, edit) → delete
- ✅ Forms have validation; error messages display correctly
- ✅ All pages responsive (mobile, tablet, desktop)
- ✅ Accessibility: WCAG 2.1 AA compliance verified (labels, ARIA, keyboard nav)
- ✅ Test: Manual E2E: Register → Login → Create 3 tasks → Toggle 1 → Delete 1 → Logout (< 5 min per SC-005)

---

## Cross-Phase Integration & Validation

### Data Flow: Complete Task Lifecycle

**Create Task**: LoginForm → Dashboard → TaskForm (create) → POST /api/v1/tasks → task_service.create_task (user_id from JWT) → DB insert → TaskResponse → Dashboard refresh

**Update Completion**: TaskCard checkbox → PATCH /api/v1/tasks/{id}/complete → task_service.update_task (verify user_id ownership) → DB update → TaskResponse → UI optimistic already applied

**Delete Task**: TaskCard delete button → Confirmation → DELETE /api/v1/tasks/{id} → task_service.delete_task (verify user_id ownership) → DB delete → 204 No Content → TaskList refresh

**User Isolation Check**: User A logs in (gets token with user_id=A), creates task → User B logs in (gets token with user_id=B), tries to GET /api/v1/tasks/A's_task_id → Backend query: "SELECT * WHERE id=task_id AND user_id=B" → 0 rows → 404 returned → User B never sees User A's task ✅

---

## Success Criteria Validation

| SC-ID | Requirement | Validation Method | Phase |
|-------|-------------|------------------|-------|
| SC-001 | Login < 2 seconds | Time from form submit to dashboard redirect | Phase 4 |
| SC-002 | 100% valid tokens accepted; 100% invalid rejected | Send 1000 valid tokens (200 OK), 1000 invalid tokens (401) | Phase 2 |
| SC-003 | Users switch accounts; each sees only their data | User A creates task, User B logs in, verify User B cannot see User A's task | Phase 4 |
| SC-004 | Zero cross-user data leakage | Comprehensive test: 5 users, 20 tasks, verify 100% isolation | Phase 4 |
| SC-005 | User completes workflow (create 3, complete 1, delete 1) in < 5 minutes | Manual user test with timer | Phase 4 |
| SC-006 | Consistency across concurrent operations | 10 users create 5 tasks each simultaneously, verify all 50 tasks persist | Phase 4 |

---

## Constitution Principles Enforcement

| Principle | Requirement | Task(s) Enforcing |
|-----------|-------------|------------------|
| **I. JWT Auth & User Isolation** | Extract user_id from 'sub' claim; filter all queries by user_id | T-012 (middleware), T-022-033 (all endpoints use WHERE user_id=) |
| **II. API-First Backend** | All business logic in FastAPI; frontend validates for UX only | T-022-033 (services + endpoints), T-037-056 (frontend validates then calls API) |
| **III. Server Components Default** | Use Server Components; Client only for interactivity | T-035, T-042, T-051, T-052, T-060, T-061 (Server); T-036, T-045-046, T-053-056 (Client for forms) |
| **IV. Stateless Backend** | No session storage; database is only state | T-007 (session factory), T-012 (JWT token is stateless) |
| **V. User-Scoped DB Queries** | Every SELECT/UPDATE/DELETE includes WHERE user_id=? | T-023-033 (all queries explicitly filter) |
| **VI. Error Handling Standards** | 401/403/400/500 responses with consistent structure | T-016 (error classes), T-034 (error handling in routes) |
| **VII. Type Safety & Validation** | All payloads use Pydantic models | T-013-015 (Pydantic schemas), T-020 (TypeScript types) |

---

## Dependencies & Execution Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundation) ← BLOCKING GATE
    ↓
Phase 3 (Task CRUD Backend) ← Can start after Phase 2
    ↓
Phase 4 (Frontend UI) ← Can start after Phase 2, benefits from Phase 3 complete
```

### Critical Path (Single Developer, Sequential)

```
Week 1:
  T-001 through T-006 (Setup)
  T-007 through T-021 (Foundation) ← BLOCKING
  T-022 through T-034 (Backend CRUD)

Week 2:
  T-035 through T-063 (Frontend UI)

Validation & Polish:
  End-to-end testing, performance profiling, documentation
```

### Parallel Strategy (2-3 Developers)

```
Developer A (Backend):
  → Phases 1-2 together
  → Then Phase 3 independently

Developer B (Frontend):
  → Waits for Phase 2 complete
  → Then Phase 4 independently

Result: Foundation is bottleneck; all downstream parallelizable
```

---

## MVP Scope (Fast Track)

To ship a working MVP in ~10 days:

1. **Phase 1**: Setup (1 day)
2. **Phase 2**: Foundation (3-4 days) - MUST COMPLETE
3. **Phase 3**: Task CRUD Backend (2-3 days)
4. **Phase 4 (Partial)**: Minimal Frontend (2-3 days)
   - T-035 through T-050 (Auth + Dashboard minimum)
   - T-051 through T-056 (Task Form minimum)
   - Skip: T-040, T-041 (Registration - can be P3 post-MVP)
   - Skip: T-062, T-063 (Animations, Error Boundary - can be polish)

**MVP Features**:
- ✅ User Login (email/password → JWT token)
- ✅ Dashboard (view own tasks only)
- ✅ Create Task
- ✅ Complete Task (checkbox toggle)
- ✅ Edit Task
- ✅ Delete Task
- ✅ Logout

**Deferred to Phase 2**:
- ⏭️ User Registration (P3)
- ⏭️ Animations & polish
- ⏭️ Advanced error handling

---

## Implementation Checklist

### Pre-Implementation Review
- [ ] Read plan.md §1-5 (entire architecture)
- [ ] Read schema.md (database design)
- [ ] Read rest-endpoints.md (API contract)
- [ ] Read constitution.md (7 principles)
- [ ] Verify all task descriptions are clear and specific

### Phase 1 Sign-Off
- [ ] Project structure initialized (backend/, frontend/, .env.example)
- [ ] All dependencies installed (FastAPI, SQLAlchemy, Next.js, etc.)
- [ ] CORS configured for localhost:3000
- [ ] .gitignore excludes sensitive files

### Phase 2 Sign-Off
- [ ] JWT middleware rejects 401 for missing/invalid tokens
- [ ] Database tables created (users, tasks) with correct schema
- [ ] Composite index idx_tasks_user_id_created_at exists
- [ ] API client automatically adds Bearer token header
- [ ] Frontend middleware protects routes correctly

### Phase 3 Sign-Off
- [ ] All 7 endpoints (POST/GET/GET/{id}/PUT/PATCH/PATCH/{id}/complete/DELETE) work correctly
- [ ] Every endpoint filters queries by user_id (WHERE clause on all reads/writes)
- [ ] Error handling returns correct status codes (201, 200, 204, 400, 403, 404)
- [ ] Manual test: User A creates task, User B cannot access (403 or 404)

### Phase 4 Sign-Off
- [ ] Login page: email/password form → token → redirect works
- [ ] Dashboard: displays only current user's tasks
- [ ] Create Task: form → POST → appears in list
- [ ] Edit Task: pre-populate → PUT → updates in list
- [ ] Delete Task: confirmation → DELETE → removed from list
- [ ] Logout: clears token, redirects to login
- [ ] Responsive: desktop, tablet, mobile all work
- [ ] Accessible: keyboard nav, ARIA labels, WCAG 2.1 AA verified

---

## Code Linking Template

Every code file must reference its Task ID(s):

**Python (Backend)**:
```python
# [Task]: T-022, T-023
# [From]: plan.md §3.1 (Create Task), plan.md §3.2 (List Tasks)
# [Reference]: FR-001, FR-004, Constitution §V (User-Scoped Queries)

from backend.services.task_service import create_task, get_user_tasks
```

**TypeScript (Frontend)**:
```typescript
// [Task]: T-036, T-037, T-038
// [From]: pages.md §Page 1 (Login Page), rest-endpoints.md §POST /api/v1/auth/login
// [Reference]: FR-001, FR-008, Constitution §II (API-First)

export const LoginForm: React.FC = () => {
  // Implementation
}
```

---

## Document References

- **plan.md** (1025 lines): 5 phases with detailed architectural steps
- **spec.md**: Feature overview and user story priorities
- **authentication.md**: 4 auth user stories (FR-001 through FR-014)
- **task-crud.md**: 4 CRUD user stories (FR-001 through FR-011)
- **pages.md**: 3 UI user stories (FR-001 through FR-014)
- **schema.md**: Database design with SQLModel, indexes
- **rest-endpoints.md**: 8 endpoints with request/response models
- **constitution.md**: 7 non-negotiable principles
- **requirements.md**: Quality checklist (SC-001 through SC-006)

---

## Notes & Guidance

### "No Task = No Code" Rule (Enforced)

Every commit must reference a Task ID:
```bash
git commit -m "[T-022] Implement create_task service with user_id isolation

Implements task_service.create_task() per plan.md §3.1
- Accepts title and optional description
- Associates task with user_id from JWT (not request body)
- Sets completed=False, created_at/updated_at to UTC now
- Enforces user isolation per Constitution §V

Reference: FR-001, FR-002, task-crud.md §User Story 1"
```

### Code Review Checklist

Before approving any PR:

- [ ] Task ID(s) referenced in code and commit message
- [ ] Spec alignment verified (FR-XXX/SC-XXX cited)
- [ ] User isolation enforced (all queries include WHERE user_id=)
- [ ] Error handling follows Constitution §VI standards
- [ ] Pydantic models used for all request/response validation
- [ ] TypeScript types match backend models
- [ ] No hardcoded secrets in code
- [ ] Tests pass (if applicable)

### Avoiding Common Pitfalls

❌ **DON'T**:
- Start Phase 4 before Phase 2 is 100% complete
- Commit code without Task ID reference
- Implement queries without WHERE user_id= filter
- Hardcode DATABASE_URL or BETTER_AUTH_SECRET
- Skip JWT signature verification for "internal" endpoints
- Use untyped dictionaries in API responses

✅ **DO**:
- Complete all Phase 2 tasks before any user story work
- Reference Task ID in every commit
- Verify user_id filtering on all data operations
- Use environment variables for all secrets
- Verify JWT middleware on every endpoint
- Use Pydantic models for all request/response

---

## Performance Targets (from SC)

- Login endpoint: < 2 seconds (SC-001)
- Dashboard list load: < 1 second (SC-002)
- Token verification latency: < 50ms per request (SC-005)
- User isolation accuracy: 100% (SC-004)
- Concurrent user consistency: 100% (SC-006)

---

**Version**: 2.0.1
**Created**: 2026-01-17
**Updated**: 2026-01-18
**Status**: ✅ READY FOR IMPLEMENTATION

**Next Action**: Begin Phase 1 tasks (T-001 through T-006) - Project Setup

---

## Task Status Tracker

Copy and track progress:

```
## Phase 1 (Setup)
- [x] T-001 FastAPI backend structure
- [x] T-002 Next.js frontend structure
- [x] T-003 .env.example template
- [x] T-004 FastAPI CORS configuration
- [x] T-005 backend/config.py settings
- [x] T-006 .gitignore configuration

## Phase 2 (Foundation) - BLOCKING
- [x] T-007 SQLAlchemy session factory
- [ ] T-008 User model (SQLModel)
- [ ] T-009 Task model (SQLModel)
- [ ] T-010 Composite index setup
- [ ] T-011 Database initialization on startup
- [ ] T-012 JWT middleware
- [ ] T-012.1 JWT Security Test (SC-002 validation)
- [ ] T-013 Auth schemas
- [ ] T-014 Task schemas
- [ ] T-015 Response models
- [ ] T-016 Error handling utilities
- [ ] T-017 Password hashing utilities
- [ ] T-018 Better Auth integration (frontend)
- [ ] T-019 API client with Bearer token
- [ ] T-020 TypeScript types
- [ ] T-021 Next.js middleware (route protection)

## Phase 3 (Backend CRUD)
- [ ] T-022 create_task service
- [ ] T-023 get_user_tasks service
- [ ] T-024 get_task_by_id service
- [ ] T-025 update_task service
- [ ] T-026 delete_task service
- [ ] T-027 POST /api/v1/tasks endpoint
- [ ] T-028 GET /api/v1/tasks endpoint
- [ ] T-029 GET /api/v1/tasks/{id} endpoint
- [ ] T-030 PUT /api/v1/tasks/{id} endpoint
- [ ] T-031 PATCH /api/v1/tasks/{id} endpoint
- [ ] T-032 PATCH /api/v1/tasks/{id}/complete endpoint
- [ ] T-033 DELETE /api/v1/tasks/{id} endpoint
- [ ] T-034 Error handling in endpoints

## Phase 4 (Frontend UI)
- [ ] T-035 Login page (Server Component)
- [ ] T-036 LoginForm component
- [ ] T-037 Form validation
- [ ] T-038 Login API integration
- [ ] T-038.1 AuthProvider/Context (JWT + user state management)
- [ ] T-039 LoginForm accessibility
- [ ] T-040 Register page (optional for MVP)
- [ ] T-041 RegisterForm component (optional)
- [ ] T-042 Dashboard page (Server Component)
- [ ] T-043 Header component
- [ ] T-044 TaskList component
- [ ] T-045 TaskCard component
- [ ] T-046 Checkbox toggle (completion)
- [ ] T-047 Delete confirmation & action
- [ ] T-048 Dashboard styling (Tailwind)
- [ ] T-049 Logout button & confirmation
- [ ] T-050 TaskList accessibility
- [ ] T-051 Task create page
- [ ] T-052 Task edit page
- [ ] T-053 TaskForm component
- [ ] T-054 Form validation
- [ ] T-055 Create task flow
- [ ] T-056 Edit task flow
- [ ] T-057 Unsaved changes detection
- [ ] T-058 TaskForm styling
- [ ] T-059 TaskForm accessibility
- [ ] T-060 Root layout
- [ ] T-061 Home page
- [ ] T-062 Animations (polish)
- [ ] T-063 Error boundary component
```
