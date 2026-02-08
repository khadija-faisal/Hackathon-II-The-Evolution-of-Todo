# Phase 3: AI-Powered MCP Todo Chatbot - Implementation Plan

**Status**: Ready for Implementation
**Branch**: `002-ai-chatbot-specs`
**Created**: 2026-02-07
**Version**: 1.0.0

---

## Pre-Implementation Analysis

### Codebase Context (Phase 2 Foundation)
**Analyzed**: 2026-02-07

Phase 2 implementation is **COMPLETE and STABLE**:
- ✅ FastAPI backend with JWT middleware (verified in `backend/middleware/jwt.py`)
- ✅ SQLModel ORM with `users` and `tasks` tables (verified in `backend/models/`)
- ✅ User isolation enforced: ALL queries scoped by `user_id` (FK constraint + WHERE filters)
- ✅ Middleware extracts `user_id` from JWT 'sub' claim before route handlers
- ✅ CORS configured for frontend origin (`backend/main.py`)
- ✅ CRUD endpoints: POST/GET/PUT/PATCH/DELETE `/api/v1/tasks`
- ✅ Error handling: 401/403/400/500 responses with structured error details
- ✅ Pydantic schemas for validation (request/response models)

**Critical Infrastructure for Phase 3**:
- JWT middleware acts as **gatekeeper** — user_id flows through `request.state.user_id`
- Database connection: Neon PostgreSQL (cloud-hosted, scalable)
- No in-memory session storage (stateless by design) ✓
- Database indexes optimize user-scoped queries ✓

### Constitution Alignment Check

| Principle | Phase 2 Status | Phase 3 Enhancement |
|-----------|----------------|-------------------|
| **I. JWT Auth & User Isolation** | ✅ Implemented | MCP Tools must validate user_id before execution |
| **II. API-First Backend** | ✅ Implemented | MCP Tools expose CRUD operations; REST optional wrapper |
| **III. Server Components Default** | ✅ Phase 2 UI | ChatKit integration preserves server-first approach |
| **IV. Stateless Backend** | ✅ Enforced | Chat endpoint must retrieve history from DB, NOT memory |
| **V. User-Scoped DB Queries** | ✅ Enforced | Conversation + Message tables add `user_id` FK |
| **VI. Error Handling Standards** | ✅ Implemented | Tool errors return structured responses (success bool + error msg) |
| **VII. Type Safety & Validation** | ✅ Implemented | MCP Tool schemas use Pydantic models |
| **VIII. MCP Server Architecture** | 🔄 **NEW** | FastAPI becomes MCP Server; register tools via SDK |
| **IX. OpenAI Agents Orchestration** | 🔄 **NEW** | Chat endpoint coordinates Agent ↔ Tools invocations |
| **X. Conversation History & Persistence** | 🔄 **NEW** | `conversations` + `messages` tables with user_id isolation |
| **XI. Natural Language Intent Resolution** | 🔄 **NEW** | Agent interprets freeform text; executes Tools |
| **XII. Stateless Chatbot Mandate** | 🔄 **NEW** | **CRITICAL**: No @cache, no class-level state |

---

## Part 1: Executive Summary

### Vision
Transform the Phase 2 REST API + Dashboard into a **conversational, AI-powered task management system** without breaking existing functionality.

### How It Works: Dual-Path Architecture
```
Path A (Phase 2 - Preserved):
User → Web Form (Dashboard) → REST API (/api/v1/tasks) → Task CRUD

Path B (Phase 3 - New):
User → Chat UI (ChatKit) → Chat Endpoint (/api/v1/chat) →
  OpenAI Agent → Calls MCP Tools → Executes CRUD → Returns Markdown Response
```

### Key Design Principle: **One Codebase, Two Interfaces**
- **Same database**: users, tasks, **conversations, messages** (new)
- **Same auth**: JWT + user_id scoping
- **Same CRUD logic**: Extracted into MCP Tools (reusable by both paths)
- **Single source of truth**: Tools (REST endpoints are optional wrappers)

### Outcome
Users can:
- ✅ Use traditional dashboard (Phase 2) to see/create/edit tasks via forms
- ✅ Use chat interface (Phase 3) to manage tasks conversationally ("Create task: Buy groceries")
- ✅ View same task list in both UIs (synced via API)
- ✅ See conversation history alongside task history

---

## Part 2: Technical Architecture

### 2.1 System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Next.js 15 (Dual UI)                                   │  │
│  │                                                         │  │
│  │ [Dashboard (Phase 2)]     [Chat UI (Phase 3)]         │  │
│  │ ├─ Task List              ├─ Message History          │  │
│  │ ├─ Task Form              ├─ Conversation Sidebar     │  │
│  │ └─ CRUD buttons           └─ Chat Input (ChatKit)     │  │
│  │                                                         │  │
│  │ All UI state: API ← no localStorage ✓                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
            ↓ (API Call: Bearer Token in Authorization header)
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ FastAPI + MCP Server                                   │  │
│  │                                                         │  │
│  │ [JWT Middleware] ← Extracts user_id from Bearer token  │  │
│  │        ↓                                                │  │
│  │ [Route Dispatcher]                                     │  │
│  │    ├─ REST Endpoints (Optional, Phase 2 compat)       │  │
│  │    │  └─ POST /api/v1/tasks → calls todo_create Tool  │  │
│  │    │  └─ GET /api/v1/tasks → calls todo_list Tool     │  │
│  │    │  └─ ... (other CRUD wrapped)                     │  │
│  │    │                                                   │  │
│  │    └─ Chat Endpoint (NEW, Primary)                    │  │
│  │       └─ POST /api/v1/chat                            │  │
│  │          ├─ Store user message in `messages` table    │  │
│  │          ├─ Initialize OpenAI Agent (fresh, stateless)│  │
│  │          ├─ Agent reads conversation history from DB  │  │
│  │          ├─ Agent analyzes user intent                │  │
│  │          ├─ Agent calls MCP Tools (todo_create, etc.) │  │
│  │          ├─ Store Tool calls & results in `messages`  │  │
│  │          ├─ Agent synthesizes response                │  │
│  │          └─ Store agent response in `messages` table  │  │
│  │                                                         │  │
│  │ [MCP Tools Layer] (Source of Truth for CRUD)          │  │
│  │    ├─ todo_create(title, description, user_id) ✓      │  │
│  │    ├─ todo_read(task_id, user_id) ✓                   │  │
│  │    ├─ todo_update(task_id, fields, user_id) ✓         │  │
│  │    ├─ todo_delete(task_id, user_id) ✓                 │  │
│  │    └─ todo_list(user_id, filter, sort) ✓              │  │
│  │       [Each Tool validates user_id before DB access]  │  │
│  │                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
            ↓ (SQL Queries scoped by user_id)
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Neon PostgreSQL                                        │  │
│  │                                                         │  │
│  │ [Phase 2 - Retained]    [Phase 3 - NEW]               │  │
│  │ ├─ users table          ├─ conversations table        │  │
│  │ └─ tasks table          │  └─ user_id FK (isolation) │  │
│  │    └─ user_id FK        ├─ messages table            │  │
│  │    └─ indexes           │  ├─ user_id FK            │  │
│  │                         │  ├─ conversation_id FK     │  │
│  │                         │  ├─ role (user|agent)      │  │
│  │                         │  ├─ content                │  │
│  │                         │  ├─ tool_calls (JSONB)     │  │
│  │                         │  └─ created_at             │  │
│  │                                                         │  │
│  │ [ALL Queries Enforce]: WHERE user_id = :authenticated │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Chat Message Flow (Detailed Sequence)

```
1. User types in ChatKit: "Create a task to buy milk tomorrow"
                            ↓
2. Frontend sends: POST /api/v1/chat
   Body: { message: "Create...", conversation_id: "..." (or null) }
   Header: Authorization: Bearer <JWT>
                            ↓
3. Backend JWT Middleware
   ├─ Verify token signature using BETTER_AUTH_SECRET
   ├─ Extract user_id from 'sub' claim
   ├─ Attach to request.state.user_id
                            ↓
4. Chat Handler (Stateless Processor)
   ├─ If conversation_id null: CREATE new conversation
   ├─ STORE user message: INSERT INTO messages (conversation_id, user_id, role='user', content)
   ├─ FETCH conversation history: SELECT * FROM messages WHERE conversation_id AND user_id
                            ↓
5. Initialize OpenAI Agent (FRESH each request - stateless)
   ├─ System prompt: "You are a helpful task assistant..."
   ├─ Context: Conversation history from database + current message
   ├─ Available Tools: [todo_create, todo_read, todo_update, todo_delete, todo_list]
                            ↓
6. Agent Processes Intent
   ├─ Analyzes user message: "Create a task to buy milk tomorrow"
   ├─ Determines intent: MUST call todo_create Tool
   ├─ Plans call: title="Buy milk", due_date="tomorrow"
                            ↓
7. Agent Calls MCP Tool: todo_create
   ├─ Input: { title: "Buy milk", description: null, due_date: "tomorrow", user_id: :user_id }
   ├─ Tool validates: user_id matches authenticated user (GATEKEEPER)
   ├─ Tool executes: INSERT INTO tasks (title, user_id, ...) WHERE user_id = :user_id
   ├─ Tool returns: { success: true, task_id: "uuid-123", title: "Buy milk" }
                            ↓
8. Agent Processes Result
   ├─ Reads Tool output: "Created task: Buy milk (ID: uuid-123)"
   ├─ Synthesizes response: "I've created a task 'Buy milk' for you. It's set for tomorrow."
                            ↓
9. Backend Records Everything
   ├─ STORE Tool call: UPDATE messages SET tool_calls = [{name: 'todo_create', input: {...}, output: {...}}]
   ├─ STORE agent response: INSERT INTO messages (conversation_id, user_id, role='agent', content)
                            ↓
10. Return to Frontend
    ├─ Response: {
         conversation_id: "conv-uuid",
         message_id: "msg-uuid",
         agent_response: "I've created a task...",
         tool_calls: [...],
         created_at: "2026-02-07T..."
       }
                            ↓
11. ChatKit UI Updates
    ├─ Display user message bubble: "Create a task to buy milk tomorrow"
    ├─ Display agent response bubble: "I've created a task..."
    ├─ (Optional) Show task creation notification
                            ↓
12. Task Appears in Dashboard
    ├─ User switches to Dashboard
    ├─ Dashboard calls GET /api/v1/tasks
    ├─ Backend queries: SELECT * FROM tasks WHERE user_id = :user_id
    ├─ Frontend renders: "Buy milk" in task list ✓
```

---

## Part 3: Database Migration Plan

### 3.1 Non-Breaking Schema Addition

**Objective**: Add `conversations` and `messages` tables WITHOUT modifying existing `users` and `tasks` tables.

**Principle**: Defense-in-depth user isolation — every table must have `user_id` for multi-tenancy.

### 3.2 Migration Steps (Backward-Compatible)

#### Constitutional Link: Statelessness Mandate (§XII)

**Critical Connection**:
- **Constitution §XII**: "Chatbot session state MUST NOT be stored in memory"
- **Migration Enforcement**: By creating dedicated `conversations` and `messages` tables, we ensure:
  - ✅ No in-memory state above database layer
  - ✅ Conversation history retrieved from DB every request (fresh Agent initialization)
  - ✅ Horizontal scaling without session affinity
  - ✅ Data persistence across server restarts
  - ✅ Audit trail for Tool calls (tool_calls JSONB column)

**Verification During Implementation**:
- [ ] Code review verifies NO @cache, @lru_cache decorators
- [ ] Tests restart backend between requests and verify data integrity
- [ ] Load test verifies no memory growth with conversation length

#### Step 1: Create `conversations` Table

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversations_user_id (user_id),
    INDEX idx_conversations_user_id_updated_at (user_id, updated_at DESC)
);
```

**Why**:
- `id`: Unique conversation identifier (UUID to match Phase 2 task.id type)
- `user_id`: Foreign key to users.id — **enforces isolation at DB level** (Constitution §I, §V)
- `title`: Optional conversation title (e.g., "Grocery Shopping")
- `created_at`, `updated_at`: Timestamps for sorting/filtering
- Indexes: Enable fast queries by user + ordering by recency
- **Statelessness**: This table is the ONLY persistent layer for conversation state (Constitution §XII)

**Validation**: Verify `conversations.user_id` FK constraint prevents cross-user access

#### Step 2: Create `messages` Table

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'agent')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_messages_conversation_id_created_at (conversation_id, created_at ASC),
    INDEX idx_messages_user_id (user_id),
    CONSTRAINT messages_user_id_matches_conversation CHECK (
        -- Note: This constraint requires a trigger or app-level enforcement
        -- because SQL CHECK cannot reference other tables directly
    )
);
```

**Why**:
- `id`: Unique message identifier
- `conversation_id`: FK to conversations.id — retrieves thread
- `user_id`: Foreign key to users.id — **redundant but enforces ownership**
- `role`: Enum (user | agent) — distinguishes message sender
- `content`: Message text (freeform for user, synthesized for agent)
- `tool_calls`: JSONB array storing Tool invocations with inputs/outputs
- Indexes: Enable fast retrieval by conversation + chronological ordering
- Composite index on `(conversation_id, created_at ASC)` optimizes "fetch thread history" queries

**Validation**: Verify both user_id FKs prevent orphaned messages

#### Step 3: Add Trigger for Conversation `updated_at` Refresh

```sql
CREATE TRIGGER update_conversation_updated_at
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Why**: Refresh `conversations.updated_at` whenever a message is added (enables sorting conversations by most recent)

#### Step 4: Rollback Plan (If Needed)

```sql
DROP TRIGGER update_conversation_updated_at ON messages;
DROP TABLE messages;
DROP TABLE conversations;
```

**Safety**: Drop order respects foreign key constraints (messages first, then conversations)

---

## Part 4: Backend Implementation Strategy

### 4.1 MCP Server Setup (NEW)

#### 4.1.1 MCP SDK Integration

**Files to Create**:
- `backend/mcp/server.py` — MCP Server initialization
- `backend/mcp/tools.py` — Tool definitions
- `backend/mcp/schemas.py` — Pydantic models for Tool I/O

**Implementation Pattern**:

```
backend/
├── mcp/
│   ├── __init__.py
│   ├── server.py         # MCP Server setup (register tools)
│   ├── tools.py          # Tool implementations (todo_create, etc.)
│   └── schemas.py        # Tool request/response Pydantic models
├── agents/
│   ├── __init__.py
│   └── chat_agent.py     # OpenAI Agent orchestration
└── models/
    ├── conversation.py   # NEW: Conversation model
    └── message.py        # NEW: Message model
```

#### 4.1.2 Tool Definition Contract

Each MCP Tool must follow this pattern:

```
Tool: todo_create
Input Schema (Pydantic):
  - title: str (required, 1-255 chars)
  - description: Optional[str] (max 4000 chars)
  - priority: Optional[str] (low|medium|high)
  - user_id: UUID (EXTRACTED from JWT, NOT from request)

Output Schema (Pydantic):
  - success: bool
  - task_id: Optional[UUID]
  - error: Optional[str]
  - message: str

Execution Logic:
  1. Validate input against schema
  2. Verify caller user_id matches authenticated user
  3. INSERT INTO tasks WHERE user_id = :authenticated_user_id
  4. Return structured response
  5. NO EXCEPTIONS raised to agent — all errors in response.error field

Security Enforcement:
  - user_id NEVER accepted from request payload
  - user_id ALWAYS extracted from JWT (request.state.user_id)
  - Every Tool call checks: if task.user_id != authenticated_user_id: raise PermissionError
```

### 4.2 Agent Orchestration (`POST /api/v1/chat`)

#### 4.2.1 Chat Endpoint Handler

**File**: `backend/routes/chat.py` (NEW)

**Signature**:
```python
@router.post("/api/v1/chat")
async def chat_endpoint(
    request: ChatRequest,
    session: Session = Depends(get_session),
    user_id: UUID = Depends(get_authenticated_user_id)
) -> ChatResponse:
    """
    Process user message through OpenAI Agent with MCP Tool support

    Stateless Flow:
    1. Store user message
    2. Fetch conversation history from DB
    3. Initialize fresh Agent instance
    4. Agent calls Tools as needed
    5. Store agent response + Tool calls
    6. Return result

    NO in-memory state; DB is source of truth
    """
```

#### 4.2.2 Statelessness Enforcement (CRITICAL)

**❌ DO NOT**:
```python
# WRONG - Violates Principle XII (Stateless Chatbot Mandate)
class ChatService:
    def __init__(self):
        self.conversation_cache = {}  # ❌ NO class-level state

    @lru_cache(maxsize=100)  # ❌ NO memoization
    def get_conversation(self, conversation_id):
        ...
```

**✅ DO**:
```python
# CORRECT - Stateless implementation
async def chat_endpoint(...) -> ChatResponse:
    # Fresh database query every request
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id  # User isolation
    ).first()

    if not conversation:
        raise 404  # Conversation not found or doesn't belong to user

    # Agent initialized fresh each request
    agent = Agent(model="gpt-4", tools=mcp_tools)

    # History fetched from DB
    history = db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.user_id == user_id
    ).order_by(Message.created_at).all()

    # Process and return
    ...
```

**Verification** (Code Review Checklist):
- [ ] No `self.state` or class-level dictionaries for chat/conversation data
- [ ] No `@cache`, `@lru_cache`, or memoization decorators
- [ ] Every Tool call validates user_id before DB access
- [ ] Conversation history fetched from DB, not memory
- [ ] Agent instance created fresh per request

### 4.3 Security Enforcement

#### 4.3.1 User_id Extraction (JWT → Tool)

**Layer 1: JWT Middleware** (Existing, reused)
```
Authorization: Bearer <token>
  → JWT middleware extracts user_id from 'sub' claim
  → request.state.user_id = user_id
```

**Layer 2: Chat Handler** (NEW)
```
Chat endpoint receives authenticated user_id
  → Pass to Agent initialization
  → Agent includes user_id context in tool calls
```

**Layer 3: Tool Execution** (NEW)
```
Tool receives call with user_id parameter
  → Tool validates: "Is this user authorized for this task?"
  → Query: WHERE id = :task_id AND user_id = :authenticated_user_id
  → Return 403 Forbidden if mismatch
```

**Layer 4: Database** (Existing, strengthened)
```
Foreign key constraint: task.user_id → users.id
  → Prevents orphaned tasks
  → Additional defense layer
```

#### 4.3.2 Tool Error Handling (User-Friendly)

**❌ BAD**:
```python
# Leaks system details
try:
    task = db.query(Task).get(task_id)
    # ...
except SQLAlchemy.exc.DatabaseError as e:
    return {"error": f"Database error: {e.args[0]}"}  # ❌ Exposes DB error
```

**✅ GOOD**:
```python
# User-friendly, no system leaks
try:
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id
    ).first()

    if not task:
        return TodoResponse(
            success=False,
            error="Task not found or you don't have permission to access it"
        )

    # ... process ...

except Exception as e:
    logger.error(f"Tool error: {e}")  # Log for debugging
    return TodoResponse(
        success=False,
        error="An error occurred while processing your request. Please try again."
    )
```

---

## Part 5: Frontend Implementation Strategy

### 5.1 ChatKit Integration (NEW)

#### 5.1.1 UI Layout

**File**: `frontend/app/chat/page.tsx` (NEW)

```
┌────────────────────────────────────────────────┐
│           Chat UI (ChatKit)                    │
├────────────────────────────────────────────────┤
│                                                │
│ [Sidebar]                    [Main Area]       │
│ ┌──────────────┐             ┌──────────────┐ │
│ │ Conversations│             │   Messages   │ │
│ │ ┌──────────┐ │             │  (Scrollable)│ │
│ │ │Grocery   │ │             │              │ │
│ │ │Shopping  │ │ ←────────── │ Agent: I've  │ │
│ │ └──────────┘ │             │ created task │ │
│ │ ┌──────────┐ │             │              │ │
│ │ │Project   │ │             │ User: Create │ │
│ │ │Planning  │ │             │ task...      │ │
│ │ └──────────┘ │             ├──────────────┤ │
│ │ [+ New] btn  │             │ [Input Form] │ │
│ │              │             │ Type msg...  │ │
│ │              │             │ [Send]  btn  │ │
│ └──────────────┘             └──────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

**Layout Components**:
- **Sidebar**: Lists recent conversations, sorted by updated_at DESC
- **Main Area**: Message thread (chronological), input form at bottom
- **ChatKit**: Provides message component, input component, styling
- **Responsive**: Sidebar hides on mobile; stacks vertically

#### 5.1.2 Component Structure

```
frontend/app/chat/
├── page.tsx                    # Server Component: Auth check, load conversations
├── layout.tsx                  # Layout with Navbar (Dashboard toggle)
└── components/
    ├── ChatContainer.tsx       # Client Component: ChatKit wrapper
    ├── ConversationSidebar.tsx # Client Component: List conversations
    └── ChatInputForm.tsx       # Client Component: Message input + send
```

**Why Server/Client Split**:
- **page.tsx (Server)**: Fetch user's conversations on load, pass to sidebar
- **ChatContainer (Client)**: Handle real-time message updates, input state
- **ConversationSidebar (Client)**: Switch conversations, create new thread
- **ChatInputForm (Client)**: Local form state, submission handling

### 5.2 State Management (Minimal, API-Driven)

#### 5.2.1 NO Local Storage for Conversation Data

**❌ WRONG**:
```typescript
// DO NOT do this
const [conversations, setConversations] = useState([]);
localStorage.setItem('conversations', JSON.stringify(conversations));
```

**✅ CORRECT**:
```typescript
// API-driven state
const [conversations, setConversations] = useState<Conversation[]>([]);

useEffect(() => {
  // Fetch fresh on mount
  api.getConversations().then(setConversations);
}, []);

// After sending message:
api.chat(message, conversationId).then(response => {
  // Update local chat display (transient)
  setChatMessages([...chatMessages, response]);

  // Re-fetch conversation list (ensures server state)
  api.getConversations().then(setConversations);
});
```

#### 5.2.2 ChatKit State (Transient UI State Only)

```typescript
// ChatContainer.tsx (Client Component)
"use client"

interface ChatContainerProps {
  conversationId: string;
  initialMessages: Message[]; // From server
}

export default function ChatContainer({ conversationId, initialMessages }: ChatContainerProps) {
  // Transient UI state (NOT persisted)
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // On message send
  const handleSendMessage = async (text: string) => {
    setLoading(true);

    try {
      // Send to backend
      const response = await api.chat({
        message: text,
        conversation_id: conversationId
      });

      // Update local UI (optimistic)
      setMessages(prev => [
        ...prev,
        { role: 'user', content: text },
        { role: 'agent', content: response.agent_response }
      ]);

      setInputValue("");
    } catch (error) {
      // Show error message
      console.error("Message failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatKit
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={loading}
    />
  );
}
```

### 5.3 Streaming & Real-Time Feedback (Optional Enhancement)

#### 5.3.1 Server-Sent Events (SSE) for Agent Streaming

**Future Enhancement** (Phase 3.1):
```
Frontend opens EventSource to /api/v1/chat/stream
Agent starts processing, sends:
  1. {"event": "thinking", "data": "Analyzing your request..."}
  2. {"event": "tool_call", "data": {"name": "todo_create", "args": {...}}}
  3. {"event": "tool_result", "data": {"success": true, "task_id": "..."}}
  4. {"event": "response", "data": {"content": "I've created the task..."}}
  5. {"event": "done"}

Frontend streams updates to UI in real-time
```

**Current Implementation (Phase 3.0)**: Simple request/response (polling)

### 5.4 Task List Sync (Cross-UI Consistency)

#### 5.4.1 Dashboard Reflects Chat Actions

**Flow**:
```
User in Chat: "Create task: Buy milk"
  ↓ (Agent calls todo_create Tool)
  ↓ (Task inserted in database)
  ↓ (Agent responds: "Created task")
  ↓
User switches to Dashboard
  ↓
Dashboard page loads: GET /api/v1/tasks (fresh from DB)
  ↓
"Buy milk" task appears in list ✓
```

**Implementation**:
- Both Dashboard and Chat use same `api.getTasks()` endpoint
- No local caching; each page load fetches fresh from server
- Optional: Refresh task list after chat message completes

---

## Part 6: Step-by-Step Task Roadmap

### Milestone 1: Database & Models Setup

**Goal**: Add conversation persistence layer without breaking Phase 2 data

**Tasks**:
1. **M1-T1**: Create `conversations` table migration [Requirement: FR-U5, SC-007]
   - File: `backend/migrations/002_add_conversations_table.sql`
   - Verifies: Foreign key constraints, indexes created
   - Validation: User_id isolation enforced

2. **M1-T2**: Create `messages` table migration [Requirement: FR-U5, SC-007]
   - File: `backend/migrations/003_add_messages_table.sql`
   - Verifies: Composite indexes, JSONB tool_calls column
   - Validation: Role enum, timestamps in UTC

3. **M1-T3**: Create SQLModel for Conversation [Requirement: FR-U1, FR-U5]
   - File: `backend/models/conversation.py`
   - Fields: id, user_id, title, created_at, updated_at
   - Pydantic: ConversationResponse, ConversationCreateRequest

4. **M1-T4**: Create SQLModel for Message [Requirement: FR-U2, FR-U5, SC-007]
   - File: `backend/models/message.py`
   - Fields: id, conversation_id, user_id, role, content, tool_calls, created_at
   - Pydantic: MessageResponse, with nested ToolCall model

5. **M1-T5**: Update main.py to auto-create new tables [Requirement: FR-003, SC-002]
   - Modify: `backend/main.py` (create_tables() function)
   - Ensures: Conversations + Messages tables created on startup

**Success Criteria**:
- Neon database has new tables with no errors
- Foreign key constraints prevent orphaned data
- Existing tasks/users unchanged ✓
- Indexes created and queryable

---

### Milestone 2: MCP Tools & Agent Backend

**Goal**: Expose CRUD operations as MCP Tools; implement stateless Agent orchestration

**Tasks**:

1. **M2-T1**: Design MCP Tool schemas [Requirement: FR-010, FR-011]
   - File: `backend/mcp/schemas.py`
   - Define: TodoCreateInput, TodoCreateOutput, etc.
   - Validation: Pydantic models with constraints

2. **M2-T2**: Implement todo_create Tool [Requirement: FR-001, FR-002, FR-009]
   - File: `backend/mcp/tools.py`
   - Input: title, description, priority, user_id
   - Logic: Validate user_id from request.state; INSERT task
   - Output: success bool, task_id, error msg
   - Security: Enforce user_id scoping

3. **M2-T3**: Implement todo_list Tool [Requirement: FR-004]
   - File: `backend/mcp/tools.py`
   - Input: user_id, filter (optional), sort (optional)
   - Logic: Query tasks WHERE user_id = :uid; return sorted list
   - Output: Array of task objects, total count

4. **M2-T4**: Implement todo_read, todo_update, todo_delete Tools [Requirement: FR-005, FR-006, FR-007, FR-008]
   - File: `backend/mcp/tools.py`
   - Each Tool: Validates ownership, executes CRUD, returns structured response

5. **M2-T5**: Register MCP Tools with FastAPI [Requirement: FR-U1, FR-U2]
   - File: `backend/mcp/server.py`
   - Initialize MCP Server, register all tools with SDK
   - Verifies: Tools discoverable by OpenAI Agents

6. **M2-T6**: Implement OpenAI Agent orchestration [Requirement: FR-U3, FR-U4, SC-007]
   - File: `backend/agents/chat_agent.py`
   - Logic: Initialize Agent fresh per request, pass MCP tools
   - System prompt: Guide Agent to use tools for task-related intents
   - NO class-level state (stateless mandate)

7. **M2-T7**: Implement chat endpoint (`POST /api/v1/chat`) [Requirement: FR-U1, FR-U5, SC-001, SC-003, SC-006]
   - File: `backend/routes/chat.py`
   - Flow: Store message → Fetch history → Init Agent → Agent calls Tools → Store response
   - Security: Extract user_id from JWT, pass to Tools
   - Statelessness: All history from DB, agent fresh each call

8. **M2-T8**: Implement conversation endpoints [Requirement: FR-U5, SC-001]
   - File: `backend/routes/chat.py`
   - `GET /api/v1/conversations` — List user's conversations
   - `GET /api/v1/conversations/{id}/messages` — Fetch thread
   - Both: Scoped by authenticated user_id

**Success Criteria**:
- All 5 Tools callable and return correct schema
- Chat endpoint stores/retrieves messages correctly
- Statelessness verified: Restart backend, conversations still retrievable
- User isolation: User A cannot access User B's conversations
- Tool errors are user-friendly (no system details leaked)

---

### Milestone 3: ChatKit UI & Integration

**Goal**: Build conversational UI using OpenAI ChatKit; sync with Dashboard

**Tasks**:

1. **M3-T1**: Integrate OpenAI ChatKit package [Requirement: FR-U1, FR-U4]
   - File: `frontend/package.json`
   - Install: `@openai/chatkit` (or equivalent)
   - Verify: Builds without errors

2. **M3-T2**: Create Chat page layout [Requirement: FR-U1, FR-U4]
   - File: `frontend/app/chat/page.tsx`
   - Server Component: Fetch user's conversations
   - Pass: Conversation list to Sidebar, initial message thread

3. **M3-T3**: Create ChatContainer (Client Component) [Requirement: FR-U1, FR-U4]
   - File: `frontend/app/chat/components/ChatContainer.tsx`
   - Wraps: ChatKit component
   - Handles: Message display, input, send button
   - State: Local UI state (transient, no localStorage)

4. **M3-T4**: Create ConversationSidebar [Requirement: FR-U1, FR-U4]
   - File: `frontend/app/chat/components/ConversationSidebar.tsx`
   - Lists: User's recent conversations (sorted by updated_at)
   - Action: Click to load conversation thread
   - Button: "+ New Conversation"

5. **M3-T5**: Create ChatInputForm [Requirement: FR-U1, FR-U4]
   - File: `frontend/app/chat/components/ChatInputForm.tsx`
   - Input: Text field (freeform, no structured forms)
   - Send: Calls `api.chat()` with message text
   - Loading: Show spinner while agent processes

6. **M3-T6**: Update API client for chat endpoints [Requirement: FR-U1, FR-U4]
   - File: `frontend/lib/api.ts`
   - Methods:
     - `api.chat(message, conversationId)` → POST /api/v1/chat
     - `api.getConversations()` → GET /api/v1/conversations
     - `api.getMessages(conversationId)` → GET /api/v1/conversations/{id}/messages

7. **M3-T7**: Update Navbar with chat toggle [Requirement: FR-U1, FR-U4]
   - File: `frontend/components/Navbar.tsx`
   - Add: Button to switch between Dashboard ↔ Chat
   - Active indicator: Show current page

8. **M3-T8**: Styling & responsiveness [Requirement: FR-U1, FR-U4]
   - ChatKit styling overrides via Tailwind
   - Mobile: Sidebar collapses, stacks vertically
   - Accessibility: WCAG AA for chat UI

**Success Criteria**:
- Chat page loads, displays conversation list
- User can create new conversation
- User can send message, receive agent response
- Messages persist across page refreshes (retrieved from DB)
- Mobile responsive ✓
- Dashboard + Chat show same tasks

---

### Milestone 4: End-to-End Testing (Human + Agent)

**Goal**: Verify full workflow: User → Chat → Agent → Tools → Database → Dashboard

**Tasks**:

1. **M4-T1**: Integration test: Create task via chat [Requirement: SC-001, SC-002, SC-003]
   - Scenario: User sends "Create task: Buy groceries"
   - Verify: Agent calls todo_create Tool
   - Verify: Task inserted in database
   - Verify: Agent responds with confirmation

2. **M4-T2**: Integration test: List tasks via chat [Requirement: SC-001, SC-002, SC-004]
   - Scenario: User sends "Show my tasks"
   - Verify: Agent calls todo_list Tool
   - Verify: Agent responds with task list

3. **M4-T3**: Integration test: Complete task via chat [Requirement: SC-001, SC-002, SC-005]
   - Scenario: User sends "Mark Buy groceries as done"
   - Verify: Agent calls todo_update Tool
   - Verify: completed=true in database

4. **M4-T4**: User isolation test [Requirement: SC-006, SC-001]
   - Scenario: User A creates task → User B tries to access
   - Verify: User B gets 403 Forbidden or empty list
   - Verify: No cross-user data leakage

5. **M4-T5**: Statelessness verification [Requirement: SC-001, SC-003, SC-007]
   - Scenario: Start chat → Send message → Restart backend → Fetch history
   - Verify: Old conversation still retrievable (from DB)
   - Verify: No data loss on restart

6. **M4-T6**: Dashboard ↔ Chat sync test [Requirement: SC-001, SC-002, SC-004]
   - Scenario: Create task in Chat → View in Dashboard → Edit in Dashboard → View in Chat
   - Verify: Same task visible in both UIs
   - Verify: Updates reflected immediately

7. **M4-T7**: Error handling test [Requirement: SC-001, SC-003, SC-007]
   - Scenario: Send malformed request, ambiguous intent, permission error
   - Verify: Agent handles gracefully
   - Verify: User-friendly error messages (no system leaks)

8. **M4-T8**: Performance test [Requirement: SC-001, SC-002, SC-007]
   - Scenario: Load test 100 concurrent users sending messages
   - Verify: No N+1 queries
   - Verify: Average response time < 2 seconds
   - Verify: Database connection pool handles load

**Success Criteria**:
- All integration tests pass ✓
- No cross-user data leakage ✓
- Statelessness verified ✓
- Performance meets SLA ✓
- User-friendly error messages ✓

---

## Part 7: Architectural Decision Records (ADRs)

### ADR-001: ChatKit over Custom Chat UI

**Status**: Accepted (Phase 3)

**Context**: Need a professional chat UI for conversational task management

**Decision**: Use OpenAI ChatKit (official component) instead of building custom UI

**Rationale**:
- ✅ Officially maintained by OpenAI
- ✅ Handles streaming, message formatting, accessibility out-of-box
- ✅ Integrates well with OpenAI Agents
- ✅ Reduces implementation time
- ✅ Battle-tested by thousands of users

**Alternatives Considered**:
- Custom React chat component: More control, but high maintenance burden
- Third-party libraries (e.g., Vercel AI SDK): Viable but less integrated

**Consequences**:
- Bundle size increases (~50KB gzipped)
- Learning curve for ChatKit API (minimal)
- Styling customization via Tailwind possible

---

### ADR-002: Stateless Agent per Request

**Status**: Accepted (Enforced by Constitution §XII)

**Context**: Scale chatbot horizontally without session affinity

**Decision**: Initialize OpenAI Agent fresh for each request; retrieve history from DB

**Rationale**:
- ✅ Horizontal scaling without sticky sessions
- ✅ No data loss on server restart
- ✅ Aligns with Constitution Principle IV (Stateless Backend)
- ✅ Simpler deployment (k8s, serverless, etc.)
- ✅ History is audit trail (all messages logged)

**Alternatives Considered**:
- Cache agent state in Redis: More complex, distributed cache issues
- In-memory conversation state: Violates statelessness, breaks scaling

**Consequences**:
- Slight latency overhead (init agent per request) — acceptable trade-off
- Database queries for history on every request (necessary)

---

### ADR-003: MCP Tools as Source of Truth for CRUD

**Status**: Accepted

**Context**: Reuse CRUD logic across REST API and Agent

**Decision**: Implement Tools first; REST endpoints wrap Tool calls (or use Tools directly)

**Rationale**:
- ✅ Single source of truth for business logic
- ✅ Reduces code duplication
- ✅ Easier maintenance (update logic in one place)
- ✅ Enforces consistent validation/error handling
- ✅ Natural progression from REST → Agent

**Alternatives Considered**:
- Duplicate CRUD logic in Tools and REST: Maintenance nightmare
- Use REST endpoints directly from Agent: Bypasses Tool abstraction

**Consequences**:
- Slight indirection (REST → Tool call → DB)
- Performance impact negligible (function call overhead << DB query)

---

### ADR-004: Conversation + Message Tables for History

**Status**: Accepted

**Context**: Persist chat history for auditability and replay

**Decision**: Create dedicated `conversations` and `messages` tables with full Tool call logging

**Rationale**:
- ✅ Audit trail for compliance/debugging
- ✅ User can replay conversations
- ✅ Tool calls logged for transparency
- ✅ Separate from `tasks` table (clean schema)
- ✅ Supports future analytics (e.g., "What intents do users have?")

**Alternatives Considered**:
- Store in `tasks.metadata` JSONB: Conflates task state with conversation
- No persistence: Violates auditability requirement

**Consequences**:
- Additional database tables (manageable)
- Storage for messages grows with usage (acceptable, can be archived)

---

## Part 8: Phase Completion Criteria

### M1: Database & Models
**Complete when**:
- [ ] `conversations` table created with user_id FK
- [ ] `messages` table created with composite indexes
- [ ] SQLModel classes for Conversation and Message
- [ ] Pydantic response schemas defined
- [ ] No errors on `backend/main.py` startup

### M2: MCP Tools & Agent
**Complete when**:
- [ ] All 5 Tools (create, read, update, delete, list) callable
- [ ] Chat endpoint stores/retrieves messages correctly
- [ ] Agent successfully interprets task creation intent
- [ ] Agent successfully interprets list intent
- [ ] Tool calls logged in messages.tool_calls (JSONB)
- [ ] Statelessness verified (restart backend, history still accessible)
- [ ] User isolation verified (cross-user requests return 403 or empty)

### M3: ChatKit UI
**Complete when**:
- [ ] Chat page displays conversation list
- [ ] User can send message and receive agent response
- [ ] Messages persist across page refresh
- [ ] Sidebar allows switching conversations
- [ ] "+ New Conversation" button works
- [ ] Mobile responsive design
- [ ] Dashboard ↔ Chat toggle in Navbar

### M4: End-to-End Testing
**Complete when**:
- [ ] Create task via chat workflow passes
- [ ] List tasks via chat workflow passes
- [ ] Complete task via chat workflow passes
- [ ] Dashboard reflects chat changes
- [ ] User isolation test passes
- [ ] Statelessness test passes
- [ ] Performance test passes (< 2s avg)
- [ ] Error handling test passes

---

## Part 9: Integration Points (Phase 2 → Phase 3)

### 9.1 No Breaking Changes to Phase 2

**Preserved**:
- ✅ `users` table: Unchanged
- ✅ `tasks` table: Unchanged (only new queries via MCP Tools)
- ✅ REST API `/api/v1/tasks/*`: Still functional (optional wrapper around Tools)
- ✅ JWT middleware: Reused for chat endpoint
- ✅ Dashboard UI: Fully functional, unchanged

**New**:
- 🆕 `conversations` table: NEW, non-breaking addition
- 🆕 `messages` table: NEW, non-breaking addition
- 🆕 Chat endpoint: NEW `/api/v1/chat`
- 🆕 Agent service: NEW backend layer
- 🆕 Chat UI: NEW `/chat` page

### 9.2 Unified API Client

**File**: `frontend/lib/api.ts` (Updated)

**Additions**:
```typescript
// Phase 3 additions (Phase 2 methods unchanged)
export const chat = (message: string, conversationId?: string) =>
  apiCall('/api/v1/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId })
  });

export const getConversations = () =>
  apiCall('/api/v1/conversations');

export const getMessages = (conversationId: string) =>
  apiCall(`/api/v1/conversations/${conversationId}/messages`);
```

---

## Part 10: Deployment & Configuration

### 10.1 Environment Variables (NEW for Phase 3)

**Backend** (`.env` or environment):
```bash
# Existing (Phase 2)
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
API_PORT=8000

# NEW (Phase 3)
OPENAI_API_KEY=sk-...          # OpenAI API key for Agent
OPENAI_MODEL=gpt-4             # Model to use (e.g., gpt-4, gpt-3.5-turbo)
MCP_SERVER_PORT=8001           # Optional: MCP server port (if exposed separately)
```

**Frontend** (`.env.local` — unchanged)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 10.2 Dependencies

**Backend** (additions to `pyproject.toml`):
```toml
[project]
dependencies = [
    # Phase 2
    "fastapi",
    "sqlmodel",
    "python-multipart",
    "pydantic",
    "pyJWT",
    "bcrypt",

    # Phase 3 (NEW)
    "openai>=1.0.0",                   # OpenAI Agents SDK
    "mcp>=0.1.0",                      # Model Context Protocol SDK
    "python-dotenv",                   # For .env loading
]
```

**Frontend** (`package.json` — additions):
```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "^19.0.0",
    "@openai/chatkit": "^1.0.0"        // ChatKit component
  }
}
```

---

## Part 7: Traceability to Requirements

| Requirement | Feature Spec | Plan Section | Milestone |
|-------------|-------------|--------------|-----------|
| FR-001: Create tasks | task-crud.md | Part 4.1.2, Part 6 M2-T2 | M2 |
| FR-002: Associate with user_id | task-crud.md | Part 4.3.1, Part 6 M2-T2 | M2 |
| FR-003: Persist task data | task-crud.md | Part 3 (DB), Part 6 M1-T1,2 | M1 |
| FR-004: Retrieve user's tasks | task-crud.md | Part 4.3.1, Part 6 M2-T3 | M2 |
| FR-005: Prevent cross-user access | task-crud.md | Part 4.3.1, Part 6 M2-T2,4 | M2 |
| FR-006: Update task title/description | task-crud.md | Part 6 M2-T4 | M2 |
| FR-007: Update updated_at | task-crud.md | Part 6 M2-T4 | M2 |
| FR-008: Delete tasks | task-crud.md | Part 6 M2-T4 | M2 |
| FR-009: Require JWT Bearer token | task-crud.md | Part 4.3.1 Layer 1, Part 6 M2-T7 | M2 |
| FR-010: Validate title & description | task-crud.md | Part 4.1.2, Part 6 M2-T1 | M2 |
| FR-011: Return proper HTTP status codes | task-crud.md | Part 4.1.2, Part 4.3.2 | M2 |
| FR-U1: Agent interprets creation intent | task-crud.md §User Story 5 | Part 6 M2-T6 | M2 |
| FR-U2: Agent chains multiple Tool calls | task-crud.md §User Story 5 | Part 6 M2-T6,7 | M2 |
| FR-U3: Agent handles Tool failures | task-crud.md §Edge Cases | Part 4.3.2, Part 6 M2-T7 | M2 |
| FR-U4: Agent asks clarifying questions | task-crud.md §User Story 5 | Part 6 M2-T6,7 | M2 |
| FR-U5: Tool calls logged in JSONB | task-crud.md §User Story 5 | Part 3 (messages table), Part 6 M2-T7 | M2 |
| SC-001: Create task < 2s | task-crud.md | Part 6 M4-T8 (Performance) | M4 |
| SC-002: Dashboard < 1s latency | task-crud.md | Part 3 (indexes), Part 6 M4-T8 | M4 |
| SC-003: 100% CRUD success | task-crud.md | Part 6 M4-T1,2,3 | M4 |
| SC-004: 100% user isolation | task-crud.md | Part 4.3.1, Part 6 M4-T4 | M4 |
| SC-005: 5-minute workflow | task-crud.md | Part 6 M4-T1,2,3 | M4 |
| SC-006: Concurrent consistency | task-crud.md | Part 6 M4-T8 | M4 |
| SC-007: Agent 95%+ accuracy | task-crud.md | Part 6 M2-T6,7 | M2 |

---

## References & Links

**Constitution**:
- `.specify/memory/constitution.md` (v3.0.0) — Project principles

**Phase 3 Specifications**:
- `specs/002-ai-chatbot-specs/checklists/requirements.md` — Feature checklist
- `specs/ui/chatbot-ui.md` — ChatKit UI specifications
- `specs/overview.md` — Phase 2 + Phase 3 overview

**Phase 2 Foundation** (Reference):
- `specs/001-web-specs/plan.md` — Phase 2 architecture
- `backend/main.py` — FastAPI setup (reused)
- `backend/middleware/jwt.py` — JWT verification (reused)

---

## Execution Checklist

- [ ] Database migrations created and tested
- [ ] MCP Tools implemented and registered
- [ ] Chat endpoint implemented (stateless)
- [ ] ChatKit UI integrated
- [ ] API client updated with new endpoints
- [ ] Navbar updated with Chat toggle
- [ ] Integration tests pass (M4 criteria)
- [ ] User isolation verified
- [ ] Statelessness verified (restart test)
- [ ] Performance test passes (< 2s avg)
- [ ] Documentation updated (backend/CLAUDE.md, frontend/CLAUDE.md)

---

**Plan Status**: ✅ Ready for Task Generation

**Next Step**: Run `sp.tasks` to generate granular Task IDs (T-XXX) with atomic checklists for implementation

**Modification Log**:
- 2026-02-07: Initial Phase 3 plan generated with full architectural alignment to Constitution v3.0.0

