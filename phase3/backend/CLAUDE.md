# Backend Guidelines (Phase 2 + Phase 3 Unified)

## Stack
- **FastAPI** - REST + MCP server framework
- **SQLModel** - ORM with Pydantic integration
- **Neon PostgreSQL** - Multi-tenant database
- **Official MCP SDK** - Tool/resource definitions
- **OpenAI Agents SDK** - Agent orchestration

## Core Architecture
Backend serves **two access patterns** from a single codebase:
1. **Phase 2 (REST)**: Web forms → `/api/v1/tasks` endpoints
2. **Phase 3 (MCP)**: Chat UI → OpenAI Agent → MCP Tools

**KEY**: The backend IS an MCP Server. All CRUD operations exposed as Tools, with REST endpoints wrapping Tool calls (optional reuse).

## Project Structure
```
backend/
├── main.py                 # FastAPI + MCP Server setup
├── models.py              # SQLModel tables (Users, Tasks, Messages, Conversations)
├── db.py                  # Database engine, session management
├── routes/
│   ├── tasks.py           # REST endpoints (Phase 2)
│   └── chat.py            # Chat endpoint (Phase 3)
├── tools/
│   ├── todo_tools.py      # MCP Tool definitions (todo_create, etc.)
│   └── schemas.py         # Pydantic schemas for Tool I/O
├── auth/
│   ├── jwt.py             # JWT verification from BETTER_AUTH_SECRET
│   └── deps.py            # Dependency injection for user_id extraction
└── agents/
    └── chat_agent.py      # OpenAI Agent orchestration (stateless)
```

## Security & User Isolation

### JWT Verification
- Extract `Authorization: Bearer <token>` header on all requests
- Use `BETTER_AUTH_SECRET` to decode and validate
- Extract `user_id` from JWT claims (never from request body)
- All database queries MUST include `WHERE user_id = :user_id`

### Tool Execution
- Before ANY Tool call: verify `user_id` from JWT
- Every database query must scope by user
- Error messages must NOT leak sensitive data or system details

### Database Constraints
Add a `user_id` column to all relevant tables (tasks, messages, conversations):
```sql
-- Example in models.py
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str  # ← Always scoped
    title: str
    ...
```

## MCP Tools (Phase 3)

### Tool Naming Convention
All tools follow `todo_<verb>` pattern:
- `todo_create` - Add new task
- `todo_read` - Fetch task details
- `todo_update` - Modify task
- `todo_delete` - Remove task
- `todo_list` - Fetch all user tasks

### Tool Structure
Each Tool must have:
1. **Input Schema**: Pydantic model defining required/optional parameters
2. **Output Schema**: Pydantic model for success/error responses
3. **Execution Logic**: Call internal function with user_id verification
4. **Error Handling**: User-friendly messages (no stack traces)

### Tool Integration Example (Pattern, Not Full Code)
```
Tool Name: todo_create
Input: { title, description, priority, user_id }
Execution:
  1. Verify JWT contains user_id (from token, not request)
  2. Validate input schema
  3. INSERT INTO tasks WHERE user_id = :user_id
  4. Return: { success: true, task_id, message }
Output: { success: bool, task_id: int, error: str (optional) }
```

## REST Endpoints (Phase 2 - Preserved)

### Conventions
- Base path: `/api/v1/`
- Routes: `/api/v1/tasks`, `/api/v1/auth`, `/api/v1/chat`
- Methods: GET, POST, PUT, DELETE
- Return JSON + HTTP status codes
- Use Pydantic models for request/response

### Phase 2 CRUD Routes
- `GET /api/v1/tasks` - List user's tasks
- `POST /api/v1/tasks` - Create task (internally calls `todo_create` Tool)
- `PUT /api/v1/tasks/{task_id}` - Update task
- `DELETE /api/v1/tasks/{task_id}` - Delete task

### Phase 3 Chat Route
- `POST /api/v1/chat` - Submit user message to Agent

## Chat Endpoint (`POST /api/v1/chat`)

### Flow
1. Validate JWT from header → extract `user_id`
2. Parse request body: `{ message: string, conversation_id: string (optional) }`
3. Retrieve conversation history from `messages` table (WHERE user_id & conversation_id)
4. Initialize OpenAI Agent with:
   - User message + history (system context)
   - Available MCP Tools (todo_create, todo_read, etc.)
5. Agent processes message, selects/calls Tools as needed
6. **Record all interactions** in `messages` table:
   - User message + timestamp
   - Agent response + timestamp
   - Tool calls array (JSONB) with names, inputs, outputs
7. Return: `{ conversation_id, agent_response, tool_calls }`

### Stateless Guarantee
- **NO** @lru_cache, @cache, or session affinity
- **NO** class-level state for conversations
- **NO** in-memory storage above database layer
- Agent initialized fresh per request; history fetched from DB

## Database Design (Phase 2 + Phase 3)

### Tables
- `users` - Authentication (Better Auth managed)
- `tasks` - Todo items (user_id scoped)
- `conversations` - Chat sessions (user_id scoped)
- `messages` - Chat history + Tool calls (user_id scoped, conversation_id FK)

### Key Patterns
- Every table has `user_id` column
- Every query filters by user_id
- `messages` table stores:
  - `role` (user | assistant)
  - `content` (text message)
  - `tool_calls` (JSONB array with Tool names, inputs, outputs)
  - `created_at` (timestamp)

## Task Traceability

Every code file must include a comment linking to specification:
```python
# [Task]: T-XXX
# [From]: specs/features/task-crud.md §3.2, .specify/plans/ai-chatbot.md §2.1
# [Phase]: II (REST) | III (MCP) | III (Agent Logic)
```

## Running

**Development**:
```bash
cd backend && uvicorn backend.main:app --reload --port 8000
```

**Environment**:
```bash
# .env or .env.local
DATABASE_URL=postgresql://...  # Neon connection
BETTER_AUTH_SECRET=your_secret_key
OPENAI_API_KEY=sk-...
```

## Key Rules (Enforce Strictly)

1. ✅ **All CRUD via Tools** → Tools are source of truth
2. ✅ **User_id ALWAYS** → Every query scoped by user
3. ✅ **Stateless Agent** → No memory above DB layer
4. ✅ **Tool Naming** → Lowercase, underscore-separated, `todo_<verb>`
5. ✅ **Conversation Persistence** → Messages table only source of truth
6. ✅ **JWT Validation** → Always extract user_id from token, never from body
7. ✅ **Error Messages** → User-friendly, no system details leaked
8. ✅ **Task IDs in Code** → Every file references its spec origin

## References
- Spec: `/specs/features/task-crud.md` (Phase 2) + `/specs/002-ai-chatbot-specs/` (Phase 3)
- Architecture: `.specify/plans/ai-chatbot.md`
- Principles: `.specify/memory/constitution.md`
