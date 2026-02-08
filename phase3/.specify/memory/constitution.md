# Todo Full-Stack Web Application with AI Powered Chatbot Interface - Phase 3 Constitution

<!--
  SYNC IMPACT REPORT - Phase 2 → Phase 3
  ─────────────────────────────────────────────────────────────────
  Version: 2.0.0 → 3.0.0 (MAJOR)
  Ratified: 2025-01-14 | Last Amended: 2026-02-07

  ARCHITECTURE EVOLUTION:
  Phase 2: Traditional CRUD API + Web UI
  Phase 3: Conversational AI Chatbot + MCP Tools + OpenAI Agents

  PRINCIPLES ENHANCED (Not Replaced):
  ✅ I. JWT Authentication & User Isolation (retained + chatbot-aware)
  ✅ II. API-First Backend → Expanded: MCP Server Tools (CRUD as Tools)
  ✅ III. Server Components Default (retained for Next.js)
  ✅ IV. Stateless Backend (enhanced: chatbot statelessness enforced)
  ✅ V. User-Scoped Database Queries (retained + conversation isolation)
  ✅ VI. Error Handling Standards (retained + Tool error handling)
  ✅ VII. Type Safety & Validation (retained + Tool schemas)

  NEW PRINCIPLES ADDED:
  + VIII. MCP Server Architecture & Tool Exposition
  + IX. OpenAI Agents Orchestration Framework
  + X. Conversation History & Persistence
  + XI. Natural Language Intent Resolution
  + XII. Stateless Chatbot Mandate

  BACKWARD COMPATIBILITY:
  • Phase 2 CRUD endpoints can coexist (optional)
  • Tool-based approach is primary; REST API secondary/deprecated
  • Database schema fully backward compatible
  • Auth layer unchanged; JWT principles reinforced
  ─────────────────────────────────────────────────────────────────
-->

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

### II. API-First Backend & MCP Tool Exposition

**Non-Negotiable:**
- All business logic lives in FastAPI, not frontend
- CRUD operations exposed as MCP Tools (primary interface for chatbot)
- Tools follow MCP SDK specification format
- Tool names: `todo_create`, `todo_read`, `todo_update`, `todo_delete`, `todo_list`
- All Tools return Pydantic models (strict validation)
- Optional: REST endpoints under `/api/v1/` for backward compatibility
- Backend enforces validation (frontend validation is UX only)
- Contract-first: Define Tools & schemas before implementation
- OpenAI Agents framework calls Tools to execute user intent

**Rationale:** MCP Tools enable conversational AI while keeping API-first principles.
Single source of truth: Tool definitions drive both agent behavior & documentation.
Backward compatible: REST endpoints can coexist if needed for legacy clients.

---

### III. Server Components & ChatKit UI Integration

**Non-Negotiable:**
- Use Next.js Server Components by default
- Client Components only for interactivity (chat form, message display, real-time)
- OpenAI ChatKit provides chat UI components (message history, input, send button)
- Never expose secrets in Client Components
- Server-side data loading with `fetch` (no-store cache)
- Chat UI interacts with chatbot via Tool invocations, not direct API calls
- Conversation thread rendered via ChatKit message component

**Rationale:** Reduces client complexity, improves SEO, smaller bundle, better security.
ChatKit standardizes conversational UI; servers handle all business logic delegation to Tools.

---

### IV. Stateless Backend & Chatbot Architecture

**Non-Negotiable:**
- No session storage on backend
- No shared in-memory caches (including chatbot state)
- Chatbot MUST NOT store conversation state in memory
- Database is ONLY persistent state (including conversation history)
- Each Tool invocation independently processable
- OpenAI Agent state managed by Agent SDK, not backend
- Requests/Tool calls independently processable
- Scales horizontally without affinity

**Critical for Chatbot:**
- Conversation threads retrieved from database, not memory
- Message history persisted after each user/agent exchange
- No in-memory conversation caching above database layer
- Chat state reset between server restarts (by design)

**Rationale:** Infinite horizontal scaling, no single points of failure.
Stateless chatbot ensures consistent behavior across server replicas and prevents data loss.

---

### V. User-Scoped Database Queries & Conversation Isolation

**Non-Negotiable:**
- Every SELECT/UPDATE/DELETE includes `WHERE user_id = ?`
- SQLModel models must have `user_id` foreign key
- Conversation threads include `user_id` field
- Message history scoped to `user_id` and `conversation_id`
- No global queries possible
- Defensive programming: Even if JWT validation fails, DB prevents leaks
- Each Tool invocation validates `user_id` before data access

**Chatbot-Specific:**
- Users can only access their own conversations
- Users can only manipulate their own tasks (via Tools)
- Tools verify user ownership before CRUD operations

**Rationale:** Defense-in-depth security model. Multi-user isolation enforced at DB level.

---

### VI. Error Handling Standards & Tool Error Contracts

**HTTP Errors (for REST endpoints, if used):**

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

**Tool Errors (MCP):**
- Tool response includes `success: bool` and optional `error: str`
- OpenAI Agent interprets Tool errors and decides retry/escalation
- Tools MUST return structured error messages (not exceptions)
- Examples: "Task not found", "Insufficient permissions", "Invalid input"
- Chatbot relays Tool errors to user in natural language

---

### VII. Type Safety & Validation

**Non-Negotiable:**
- Backend: All request/response payloads use Pydantic models
- Tools: All input/output parameters defined with Pydantic schemas
- Frontend: TypeScript types for all API responses & Tool results
- Database: SQLModel models enforce schema
- Validation at entry points only (Tool inputs, request payloads)
- No untyped dictionaries in API responses or Tool results

**Tool Schema Definitions:**
- Each Tool has explicit input and output schema (Pydantic)
- Tool schemas discoverable by OpenAI Agents framework
- Example: `TodoCreateInput`, `TodoCreateOutput` models

**Naming Conventions:**
- Backend: `TaskCreate`, `TaskResponse`, `UpdateTaskRequest`
- Tools: `TodoCreateRequest`, `TodoCreateResponse`
- Frontend: `getTasks()`, `createTask(data)`, `TaskCardProps`
- Database: `tasks` (table), `user_id` (field), `created_at` (timestamp)
- Conversations: `conversations` (table), `conversation_id`, `user_id`, `created_at`

---

### VIII. MCP Server Architecture & Tool Exposition

**Non-Negotiable:**
- FastAPI backend is an MCP Server (Model Context Protocol, official SDK)
- All CRUD operations exposed as Tools via MCP
- Tools follow Tool Contract standard (name, description, input schema, output schema)
- Tools discoverable by OpenAI Agents SDK
- Tool responses are deterministic and side-effect complete
- Tool naming convention: `todo_<verb>` (e.g., `todo_create`, `todo_list`, `todo_delete`)

**Tool Categories:**
- **Create**: `todo_create(title, description, due_date, user_id)`
- **Read**: `todo_read(task_id, user_id)`
- **Update**: `todo_update(task_id, fields, user_id)`
- **List**: `todo_list(user_id, filter, sort)`
- **Delete**: `todo_delete(task_id, user_id)`

**Rationale:** MCP standardizes tool contracts. Agents discover and invoke Tools autonomously.

---

### IX. OpenAI Agents Orchestration Framework

**Non-Negotiable:**
- OpenAI Agents SDK manages user intent interpretation
- Agent receives user message (natural language)
- Agent determines which Tools to call based on intent
- Agent chains multiple Tool calls if needed (e.g., "create task AND list all tasks")
- Agent synthesizes Tool results into natural language response
- Agent state NOT persisted on backend (stateless)
- All Agent decisions logged for auditability

**Agent Loop:**
1. User sends message (text)
2. Agent analyzes intent
3. Agent selects & calls relevant Tools with parameters
4. Backend Tools execute and return results
5. Agent synthesizes results into response
6. Response sent to user via ChatKit UI

**Rationale:** Declarative intent-based interface. Users describe what they want;
Agent decides how (which Tools). Reduces need for UI hierarchy.

---

### X. Conversation History & Persistence

**Non-Negotiable:**
- Every user-agent exchange persisted in database
- `conversations` table: `id, user_id, created_at, updated_at`
- `messages` table: `id, conversation_id, user_id, role (user|agent), content, tool_calls, created_at`
- Message history retrieved from DB, not cached
- Conversation thread accessible via conversation_id
- Users can view past conversations & task history
- Conversation deletion follows retention policy (if any)

**Message Schema:**
```python
class Message(SQLModel, table=True):
    id: int = Field(primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id")
    user_id: int = Field(foreign_key="users.id")
    role: str  # "user" or "agent"
    content: str  # Message text
    tool_calls: Optional[str] = None  # JSON array of called Tools
    results: Optional[str] = None  # Tool results (JSON)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Rationale:** Persistence enables conversation replay, auditability, and future analytics.

---

### XI. Natural Language Intent Resolution

**Non-Negotiable:**
- User inputs are freeform natural language (not structured forms)
- Agent interprets intent without explicit command syntax
- Examples:
  - "Create a task to buy groceries due tomorrow"
  - "List all my tasks for this week"
  - "Mark the grocery task as done"
- Agent MUST understand task-related intents (CRUD + filtering)
- Agent SHOULD gracefully handle unclear or out-of-scope requests
- Agent responses are conversational (not JSON/structured output)

**Rationale:** Conversational interface improves UX. Users interact naturally, not via forms.

---

### XII. Stateless Chatbot Mandate

**CRITICAL - Non-Negotiable:**
- Chatbot session state MUST NOT be stored in memory
- Conversation history retrieved entirely from database
- Each message processed independently
- No in-memory caches for tasks, conversations, or agent state
- User session scoped to browser (JWT in cookie)
- Backend session is stateless (horizontal scaling required)

**Enforcement:**
- Code review MUST verify no `self.state` or `@cache` decorators
- Tests MUST verify statelessness (restart backend between calls)
- Architecture review catches any persistent session patterns

**Rationale:** Ensures reliability, enables horizontal scaling, prevents data loss on restarts.

---

## Security Requirements

**JWT Bridge:**
- Frontend stores JWT in httpOnly cookie or secure storage
- All backend requests include `Authorization: Bearer <token>`
- Backend verifies signature + expiration + claims
- Shared secret: `BETTER_AUTH_SECRET` environment variable
- JWT decoded and `user_id` extracted before Tool invocation

**Tool Security:**
- Every Tool MUST validate caller's JWT before executing
- Every Tool MUST verify user ownership of affected resources
- Tools MUST filter results by `user_id` without exception
- Tool errors MUST NOT expose system details (user-friendly messages only)

**No Hardcoded Secrets:**
- All secrets via environment variables
- `.env.local` gitignored
- Never commit credentials
- OpenAI API key stored securely (env var)

**Multi-Tenancy:**
- Every data table has `user_id` field
- Foreign key: `user_id` references `users(id)`
- Query patterns enforce isolation
- Conversation tables include `user_id` isolation

---

## Database Constraints

**Schema Rules:**
- Migrations via SQLAlchemy
- Indexes on `user_id`, `conversation_id`, and frequently-filtered fields
- Query timeout: 5 seconds (fail fast)
- No N+1 queries (use eager loading)

**Phase 3 Tables:**
- `users` - user accounts (Phase 2, retained)
- `tasks` - user tasks (Phase 2, retained, now manipulated via Tools)
- `conversations` - conversation threads (NEW, Phase 3)
- `messages` - message history (NEW, Phase 3)

**Backward Compatibility:**
- Schema changes tracked in migrations
- Backward compatibility required unless major version bump
- Phase 2 data (users, tasks) fully compatible with Phase 3

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
- Frontend: UI state, chat message display, layout, JWT storage
- Backend: Business logic, Tool execution, persistence, conversation state
- OpenAI Agent: Intent interpretation, Tool orchestration (no state persistence)

**Request Flow (REST, if used):**
1. User action → Frontend
2. Frontend validates (UX only)
3. Frontend calls backend API
4. Backend validates (MUST)
5. Backend executes logic
6. Frontend updates UI

**Chatbot Request Flow (Primary, Phase 3):**
1. User types message → ChatKit UI
2. Frontend sends message to backend chat endpoint
3. Backend stores message in `messages` table
4. Backend passes message to OpenAI Agent
5. Agent calls relevant Tools (backend executes CRUD)
6. Backend stores Tool calls & results in message row
7. Agent synthesizes response
8. Backend stores agent message in `messages` table
9. Frontend retrieves updated conversation thread
10. ChatKit renders messages (user + agent)

**Caching:**
- Frontend: In-memory only (no persistence)
- Backend: Stateless (optional local cache for hot data)
- Conversation cache invalidated after each message
- Invalidate on Tool calls (mutations)

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

**Database Models & Naming:**
- **Phase 2 Tables (retained):** `users`, `tasks` (plural, lowercase)
- **Phase 3 Tables (new):** `conversations`, `messages`
- **Fields:** `id`, `user_id`, `created_at`, `updated_at`
- **Foreign keys:** `user_id: int = Field(foreign_key="users.id")`, `conversation_id`, `message_id`
- **Tools:** `todo_create`, `todo_read`, `todo_update`, `todo_delete`, `todo_list` (verb_noun pattern)
- **Models:** `TaskCreate`, `TaskResponse`, `ConversationResponse`, `MessageResponse`

*Detailed backend/frontend file structures defined in `speckit.plan` per feature.*

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

**Version**: 3.0.0 | **Ratified**: 2025-01-14 | **Last Amended**: 2026-02-07
