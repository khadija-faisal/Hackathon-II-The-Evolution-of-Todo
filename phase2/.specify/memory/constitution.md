# Todo Full-Stack Web Application - Phase 2 Constitution

<!-- Version: 0.0.1 → 2.0.0 (MAJOR) | Ratified: 2025-01-14 | Last Amended: 2025-01-14 -->

## Core Principles

### I. JWT Authentication & User Isolation

**Non-Negotiable:**
- Better Auth (frontend) issues JWTs using `BETTER_AUTH_SECRET`
- FastAPI backend middleware verifies JWT signature using `BETTER_AUTH_SECRET`
- Extract `user_id` from JWT claims (`sub` field)
- Every database query filters by `user_id` — no global queries
- Return 401 for missing/invalid tokens, 403 for insufficient permissions
- No unauthenticated endpoints except `/health`

**Rationale:** Multi-user SaaS requires absolute isolation. JWT bridge ensures single auth source.

---

### II. API-First Backend

**Non-Negotiable:**
- All business logic lives in FastAPI, not frontend
- Frontend calls backend for all mutations
- Backend enforces validation (frontend validation is UX only)
- All routes under `/api/v1/` prefix
- Responses use Pydantic models (strict validation)
- Contract-first: Define API before implementation

**Rationale:** Enables future mobile/CLI clients. Single source of truth prevents inconsistency.

---

### III. Server Components Default

**Non-Negotiable:**
- Use Next.js Server Components by default
- Client Components only for interactivity (forms, buttons, real-time)
- Never expose secrets in Client Components
- Server-side data loading with `fetch` (no-store cache)

**Rationale:** Reduces client complexity, improves SEO, smaller bundle, better security.

---

### IV. Stateless Backend

**Non-Negotiable:**
- No session storage on backend
- No shared in-memory caches
- Database is ONLY persistent state
- Requests independently processable
- Scales horizontally without affinity

**Rationale:** Infinite horizontal scaling, no single points of failure.

---

### V. User-Scoped Database Queries

**Non-Negotiable:**
- Every SELECT/UPDATE/DELETE includes `WHERE user_id = ?`
- SQLModel models must have `user_id` foreign key
- No global queries possible
- Defensive programming: Even if JWT validation fails, DB prevents leaks

**Rationale:** Defense-in-depth security model.

---

### VI. Error Handling Standards

**401 Unauthorized:**
- Missing/invalid JWT token
- Response: `{"error": "Unauthorized", "code": "AUTH_FAILED"}`
- Frontend action: Redirect to login

**403 Forbidden:**
- User authenticated but lacks permission
- Response: `{"error": "Forbidden", "code": "INSUFFICIENT_PERMS"}`
- Frontend action: Show permission error

**400 Bad Request:**
- Request validation failed (Pydantic error)
- Response: `{"error": "Validation Error", "details": [...]}`
- Frontend action: Display validation errors

**500 Internal Server Error:**
- Unhandled exception
- Response: `{"error": "Internal Server Error", "code": "SERVER_ERROR"}`
- Frontend action: Log error, show generic retry message

---

### VII. Type Safety & Validation

**Non-Negotiable:**
- Backend: All request/response payloads use Pydantic models
- Frontend: TypeScript types for all API responses
- Database: SQLModel models enforce schema
- Validation at entry points only (request payloads)
- No untyped dictionaries in API responses

**Naming Conventions:**
- Backend: `TaskCreate`, `TaskResponse`, `UpdateTaskRequest`
- Frontend: `getTasks()`, `createTask(data)`, `TaskCardProps`
- Database: `tasks` (table), `user_id` (field), `created_at` (timestamp)

---

## Security Requirements

**JWT Bridge:**
- Frontend stores JWT in httpOnly cookie or secure storage
- All backend requests include `Authorization: Bearer <token>`
- Backend verifies signature + expiration + claims
- Shared secret: `BETTER_AUTH_SECRET` environment variable

**No Hardcoded Secrets:**
- All secrets via environment variables
- `.env.local` gitignored
- Never commit credentials

**Multi-Tenancy:**
- Every data table has `user_id` field
- Foreign key: `user_id` references `users(id)`
- Query patterns enforce isolation

---

## Database Constraints

**Schema Rules:**
- Migrations via SQLAlchemy
- Indexes on `user_id` and frequently-filtered fields
- Query timeout: 5 seconds (fail fast)
- No N+1 queries (use eager loading)

**Backward Compatibility:**
- Schema changes tracked in migrations
- Backward compatibility required unless major version bump

---

## API Response Standards

**Success Response:**
```json
{
  "data": { /* payload */ },
  "error": null,
  "meta": { "timestamp": "2025-01-14T12:00:00Z", "request_id": "uuid" }
}
```

**List Response:**
```json
{
  "data": [ /* items */ ],
  "meta": { "total": 100, "limit": 10, "offset": 0, "timestamp": "..." }
}
```

**Error Response:**
```json
{
  "data": null,
  "error": { "code": "ERROR_CODE", "message": "User message", "details": [] },
  "meta": { "timestamp": "..." }
}
```

---

## Frontend-Backend Contract

**Data Ownership:**
- Frontend: UI state, form state, layout
- Backend: Business logic, validation, persistence

**Request Flow:**
1. User action → Frontend
2. Frontend validates (UX only)
3. Frontend calls backend API
4. Backend validates (MUST)
5. Backend executes logic
6. Frontend updates UI

**Caching:**
- Frontend: In-memory only (no persistence)
- Backend: Stateless (optional local cache)
- Invalidate on mutations (POST/PUT/DELETE)

---

## Development Workflow

**No Task = No Code (ENFORCED):**
1. Specify: Define requirements
2. Plan: Design architecture
3. Tasks: Break into task IDs
4. Implement: Only with Task ID reference

**Code Linking:**
Every file must link to task:
```
# [Task]: T-XXX
# [From]: speckit.specify §X, speckit.plan §X
```

**PR Requirements:**
- Title: `[T-XXX] Description`
- Body: Link to task, justification, test plan
- Review: Verify Task ID + spec alignment
- Tests: Must pass

---

## Naming Conventions

**Backend Files:**
```
backend/
├── main.py              # FastAPI app
├── config.py            # Settings
├── models/              # SQLModel definitions
├── routes/              # Endpoint handlers (/api/v1/*)
├── services/            # Business logic
├── middleware/          # Auth middleware
└── db.py                # Database connection
```

**Frontend Files:**
```
frontend/
├── app/                 # Pages (App Router)
├── components/          # Reusable components
├── lib/api.ts           # API client
├── lib/auth.ts          # Better Auth setup
└── lib/types.ts         # TypeScript types
```

**Database Models:**
- Table: `users`, `tasks` (plural, lowercase)
- Fields: `id`, `user_id`, `created_at`, `updated_at`
- Foreign keys: `user_id: int = Field(foreign_key="user.id")`

---

## Governance

**Amendment Procedure:**
1. Proposal: Document change in issue/PR
2. Justification: Explain why needed
3. Review: Approval from tech lead
4. Versioning: Determine MAJOR/MINOR/PATCH
5. Migration: Plan code updates
6. Commit: Include amendment rationale

**Version Bumping:**
- **MAJOR** (X.0.0): Backward incompatible principle changes
- **MINOR** (X.Y.0): New principle or expanded guidance
- **PATCH** (X.Y.Z): Clarifications, typo fixes, wording

**Compliance Checklist:**
- [ ] Code references Task ID
- [ ] Task maps to spec
- [ ] No principle violations
- [ ] API responses follow standards
- [ ] Error handling correct
- [ ] Naming conventions followed
- [ ] Type safety verified

**Review Cycle:**
- Quarterly or when: security vulnerability, performance bottleneck, new pattern needed

---

**Version**: 2.0.0 | **Ratified**: 2025-01-14 | **Last Amended**: 2025-01-14
