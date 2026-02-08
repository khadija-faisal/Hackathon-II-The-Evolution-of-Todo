# Phase 3: AI-Powered MCP Todo Chatbot - Implementation Tasks

**Feature**: 002-ai-chatbot-specs
**Created**: 2026-02-08
**Status**: Ready for Implementation
**Total Tasks**: 32 (organized by 4 Milestones)

---

## Overview

This tasks.md breaks down the Phase 3 implementation plan into atomic, executable units. Each task:
- Has a unique ID (T-M#-###)
- References the specific plan section and requirement it fulfills
- Includes a clear "Definition of Done" (DoD)
- Can be completed independently by an LLM or developer
- Is testable and verifiable

**Task Organization**: 4 Milestones (M1-M4) with 8 tasks each, organized by completion order.

---

## Milestone 1: Database & Models Setup

**Goal**: Add conversation persistence layer without breaking Phase 2 data

### Database Migrations

- [x] **T-M1-001** Create conversations table migration
  - **Description**: Create SQL migration script `backend/migrations/002_add_conversations_table.sql` that adds the conversations table with proper schema (id, user_id, title, created_at, updated_at), foreign key constraints, and indexes
  - **Reference**: plan.md §Part 3, Part 6 M1-T1; requirements.md §Database Schema
  - **DoD**: Migration file created, SQL syntax validated, foreign key to users.id verified, indexes on (user_id, created_at) created
  - **Requirements Covered**: [Requirement: FR-U5, SC-007]

- [x] **T-M1-002** Create messages table migration
  - **Description**: Create SQL migration script `backend/migrations/003_add_messages_table.sql` that adds the messages table with proper schema (id, conversation_id, user_id, role, content, tool_calls JSONB, created_at), foreign key constraints, and composite indexes
  - **Reference**: plan.md §Part 3, Part 6 M1-T2; requirements.md §Database Schema
  - **DoD**: Migration file created, JSONB column for tool_calls verified, composite index on (conversation_id, created_at), role enum (user|agent) enforced
  - **Requirements Covered**: [Requirement: FR-U5, SC-007]

- [x] **T-M1-003** Run migrations on Neon database
  - **Description**: Execute both migration scripts against the Neon PostgreSQL database using SQLAlchemy/Alembic (or raw SQL via psql), verify no errors, verify tables exist and are queryable
  - **Reference**: plan.md §Part 3, Part 6 M1-T1,2
  - **DoD**: `SELECT * FROM conversations` and `SELECT * FROM messages` return empty results with correct schema; existing users and tasks unchanged
  - **Requirements Covered**: [Requirement: FR-003, SC-002]

### SQLModel Definitions

- [x] **T-M1-004** Create SQLModel for Conversation
  - **Description**: Create `backend/models/conversation.py` with SQLModel class for conversations table, including fields (id, user_id, title, created_at, updated_at), Pydantic response schema (ConversationResponse), and create request schema (ConversationCreateRequest)
  - **Reference**: plan.md §Part 6 M1-T3; requirements.md §MCP Server Registration
  - **DoD**: Model imports in backend/models/__init__.py, Pydantic schemas validate correctly, relationships to users and messages defined
  - **Requirements Covered**: [Requirement: FR-U1, FR-U5]

- [x] **T-M1-005** Create SQLModel for Message
  - **Description**: Create `backend/models/message.py` with SQLModel class for messages table, including fields (id, conversation_id, user_id, role, content, tool_calls JSONB, created_at), Pydantic response schema (MessageResponse with nested ToolCall model), and relationship to Conversation
  - **Reference**: plan.md §Part 6 M1-T4; requirements.md §Stateless Chat Persistence
  - **DoD**: Model imports correctly, tool_calls JSONB parsed as list of ToolCall dicts, role enum validated, timestamps in UTC
  - **Requirements Covered**: [Requirement: FR-U2, FR-U5, SC-007]

### Backend Setup

- [x] **T-M1-006** Update main.py to auto-create new tables
  - **Description**: Modify `backend/main.py` create_tables() function to include Conversation and Message models in SQLModel.metadata.create_all() call, ensuring tables are auto-created on startup
  - **Reference**: plan.md §Part 6 M1-T5
  - **DoD**: Backend startup logs "Creating tables for Conversation, Message"; existing tables not dropped; new tables created on first run
  - **Requirements Covered**: [Requirement: FR-003, SC-002]

- [x] **T-M1-007** Update requirements.txt/pyproject.toml for Phase 3 dependencies
  - **Description**: Add required Phase 3 dependencies to `backend/pyproject.toml`: openai>=1.3.0, mcp (official MCP SDK)>=latest
  - **Reference**: plan.md §Part 4, Part 6 M2
  - **DoD**: Dependencies listed with versions, backend can import from `from openai import...` and `from mcp import...` without errors
  - **Requirements Covered**: [Requirement: FR-U1, FR-U2]

- [ ] **T-M1-008** Document Phase 1 completion in PHR
  - **Description**: Create PHR (Prompt History Record) file `phase3/history/prompts/002-ai-chatbot-specs/phr_phase3_m1_database_setup_2026-02-08.md` documenting M1 completion, schema decisions, migration execution, and verification results
  - **Reference**: Spec-Kit Plus framework §Reusable Intelligence
  - **DoD**: PHR file created, documents what was accomplished, challenges encountered, verification checklist completed
  - **Requirements Covered**: [Requirement: FR-U5]

---

## Milestone 2: MCP Tools & Agent Backend

**Goal**: Expose CRUD operations as MCP Tools; implement stateless Agent orchestration

### Tool Schema Design

- [x] **T-M2-001** Design MCP Tool input/output schemas
  - **Description**: Create `backend/mcp/schemas.py` with Pydantic models for all Tool inputs and outputs: TodoCreateInput, TodoCreateOutput, TodoReadInput, TodoReadOutput, TodoUpdateInput, TodoUpdateOutput, TodoDeleteInput, TodoDeleteOutput, TodoListInput, TodoListOutput
  - **Reference**: plan.md §Part 6 M2-T1, Part 4.1; requirements.md §MCP Server Registration
  - **DoD**: All schemas defined with proper type hints, validation constraints (required fields, string lengths), and documentation strings; test schema validation manually
  - **Requirements Covered**: [Requirement: FR-010, FR-011]

- [x] **T-M2-002** Create Tool definition registry
  - **Description**: Create `backend/mcp/tools.py` skeleton with Tool class definitions (but not implementations yet), including docstrings per MCP spec, input/output schema references, and tool naming convention (todo_create, todo_read, todo_update, todo_delete, todo_list)
  - **Reference**: plan.md §Part 6 M2-T1; requirements.md §Tool Execution
  - **DoD**: Tool registry file created, all 5 tools listed with proper naming, docstrings complete
  - **Requirements Covered**: [Requirement: FR-001, FR-004, FR-005, FR-006, FR-007, FR-008]

### MCP Tool Implementation

- [x] **T-M2-003** Implement todo_create Tool
  - **Description**: Implement `backend/mcp/tools.py::todo_create()` function that accepts (title, description=None, priority=None, user_id), validates user_id from request context, inserts into tasks table scoped by user_id, returns success bool and task_id
  - **Reference**: plan.md §Part 6 M2-T2; requirements.md §Tool Execution
  - **DoD**: Tool callable, creates task in database, validates user_id enforcement, returns proper schema, error cases handled (validation failure, DB error)
  - **Requirements Covered**: [Requirement: FR-001, FR-002, FR-009]

- [x] **T-M2-004** Implement todo_list Tool
  - **Description**: Implement `backend/mcp/tools.py::todo_list()` function that accepts (user_id, filter=None, sort=None), queries tasks WHERE user_id = :uid, supports optional filters (completed, priority), returns sorted task array
  - **Reference**: plan.md §Part 6 M2-T3; requirements.md §Tool Execution
  - **DoD**: Tool queries correctly scoped by user_id, filtering works (completed=true/false, priority=high/medium/low), sorting works (created_at, due_date), returns array of task objects
  - **Requirements Covered**: [Requirement: FR-004]

- [x] **T-M2-005** Implement todo_read, todo_update, todo_delete Tools
  - **Description**: Implement three tools in `backend/mcp/tools.py`: todo_read(task_id, user_id) returns full task, todo_update(task_id, fields, user_id) updates specified fields, todo_delete(task_id, user_id) deletes task; all enforce user_id ownership before DB operation
  - **Reference**: plan.md §Part 6 M2-T4; requirements.md §Tool Execution
  - **DoD**: All three tools callable, ownership validation prevents cross-user access, update handles partial updates, delete returns success bool, 404 errors handled gracefully
  - **Requirements Covered**: [Requirement: FR-005, FR-006, FR-007, FR-008]

### MCP Server Setup

- [x] **T-M2-006** Register Tools with MCP Server
  - **Description**: Create `backend/mcp/server.py` that initializes MCP Server using Official MCP SDK, registers all 5 tools (todo_create, todo_read, todo_update, todo_delete, todo_list) with input/output schemas from Tool definitions
  - **Reference**: plan.md §Part 6 M2-T5; requirements.md §MCP Server Registration
  - **DoD**: MCP Server instance created, all 5 tools discoverable via server.list_tools(), Tool descriptions match schemas, SDK integration tests pass
  - **Requirements Covered**: [Requirement: FR-U1, FR-U2]

### Agent Implementation

- [x] **T-M2-007** Implement OpenAI Agent orchestration
  - **Description**: Create `backend/agents/chat_agent.py` with stateless Agent initialization function: init_agent(tools, system_prompt) returns fresh Agent instance configured with MCP tools, system prompt guides intent understanding and tool selection, NO class-level state or @lru_cache decorators
  - **Reference**: plan.md §Part 6 M2-T6, Part 4.2.2; requirements.md §OpenAI Agent Tool Calling, Stateless Chat Persistence
  - **DoD**: Agent init function creates fresh Agent per request, agent.run() accepts message + conversation_history, returns response + tool_calls list, agent respects tool output schema
  - **Requirements Covered**: [Requirement: FR-U3, FR-U4, SC-007]

### Chat Endpoint

- [x] **T-M2-008** Implement POST /api/v1/chat endpoint
  - **Description**: Create `backend/routes/chat.py` with chat endpoint handler that: (1) validates JWT from Authorization header, (2) extracts user_id from token, (3) creates/fetches conversation, (4) stores user message, (5) fetches conversation history from DB (stateless), (6) initializes fresh Agent, (7) agent calls tools, (8) stores agent response + tool_calls in messages table, (9) returns conversation_id, agent_response, tool_calls
  - **Reference**: plan.md §Part 6 M2-T7, Part 4.2; requirements.md §Chat Endpoint POST /api/v1/chat, Stateless Chat Persistence
  - **DoD**: Endpoint accepts POST /api/v1/chat with (message, conversation_id?), returns structured response, all messages persisted to database, agent calls tools and stores results, statelessness verified (restart test passes)
  - **Requirements Covered**: [Requirement: FR-U1, FR-U5, SC-001, SC-003, SC-006]

- [ ] **T-M2-009** Implement conversation endpoints (GET /api/v1/conversations, GET /api/v1/conversations/{id}/messages)
  - **Description**: Create conversation list and message retrieval endpoints in `backend/routes/chat.py`: (1) GET /api/v1/conversations returns all user's conversations paginated, (2) GET /api/v1/conversations/{id}/messages returns thread of messages for conversation, both scoped by authenticated user_id
  - **Reference**: plan.md §Part 6 M2-T8; requirements.md §Conversation Endpoints, Message Retrieval
  - **DoD**: Both endpoints callable, authentication enforced, pagination works (limit, offset), user isolation verified (user A cannot access user B's data), messages ordered chronologically
  - **Requirements Covered**: [Requirement: FR-U5, SC-001]

---

## Milestone 3: ChatKit UI & Integration

**Goal**: Build conversational UI using OpenAI ChatKit; sync with Dashboard

### Frontend Setup

- [x] **T-M3-001** Integrate OpenAI ChatKit package
  - **Description**: Add `@openai/chatkit` (or official equivalent) to `frontend/package.json`, run `npm install`, verify no build errors, add to import paths
  - **Reference**: plan.md §Part 6 M3-T1, Part 5; requirements.md §ChatKit UI Integration
  - **DoD**: Package installed, can import ChatKit components, frontend builds without errors, ChatKit version pinned in package.json
  - **Requirements Covered**: [Requirement: FR-U1, FR-U4]
  - **Completion Status**: ✅ Completed - ChatKit package installed and available in frontend

- [x] **T-M3-002** Create Chat page server layout
  - **Description**: Create `frontend/app/chat/page.tsx` as Next.js Server Component that: (1) fetches authenticated user's conversations from API, (2) passes conversation list to sidebar component, (3) sets up layout structure (sidebar + main area), (4) renders nothing if unauthenticated
  - **Reference**: plan.md §Part 6 M3-T2, Part 5
  - **DoD**: Page renders without errors, conversations fetched on server-side, layout structure visible (2-column layout)
  - **Requirements Covered**: [Requirement: FR-U1, FR-U4]
  - **Completion Status**: ✅ Completed - Chat page with server layout at src/app/chat/page.tsx

### Chat Components

- [x] **T-M3-003** Create ChatContainer client component
  - **Description**: Create `frontend/app/chat/components/ChatContainer.tsx` as Client Component that wraps ChatKit, manages local UI state (current messages, loading), calls api.chat() on message send, renders agent responses with Markdown support
  - **Reference**: plan.md §Part 6 M3-T3, Part 5.2; requirements.md §ChatKit UI Integration
  - **DoD**: Component renders ChatKit with message history, send button functional, messages display correctly, loading spinner shown while processing
  - **Requirements Covered**: [Requirement: FR-U1, FR-U4]
  - **Completion Status**: ✅ Completed - ChatContainer with message handling at src/app/chat/components/ChatContainer.tsx

- [x] **T-M3-004** Create ConversationSidebar component
  - **Description**: Create `frontend/app/chat/components/ConversationSidebar.tsx` that: (1) displays list of user's recent conversations (from props), (2) allows click to select conversation, (3) has "+ New Conversation" button, (4) highlights active conversation
  - **Reference**: plan.md §Part 6 M3-T4
  - **DoD**: Sidebar renders conversation list, click navigation works, new conversation button functional, styling matches dashboard aesthetic
  - **Requirements Covered**: [Requirement: FR-U1, FR-U4]
  - **Completion Status**: ✅ Completed - Sidebar with conversation list at src/app/chat/components/ConversationSidebar.tsx

- [x] **T-M3-005** Create ChatInputForm component
  - **Description**: Create `frontend/app/chat/components/ChatInputForm.tsx` that: (1) renders text input field for freeform natural language, (2) has Send button, (3) supports Enter to send, (4) clears input after send, (5) calls onSubmit callback with message text
  - **Reference**: plan.md §Part 6 M3-T5
  - **DoD**: Input renders, Enter key triggers send, text clears after submission, supports multi-line (Shift+Enter), send callback invoked
  - **Requirements Covered**: [Requirement: FR-U1, FR-U4]
  - **Completion Status**: ✅ Completed - Input form with Enter/Shift+Enter support at src/app/chat/components/ChatInputForm.tsx

### API Client & Navigation

- [x] **T-M3-006** Update API client for chat endpoints
  - **Description**: Update `frontend/lib/api.ts` with new methods: (1) api.chat(message, conversationId?) POST /api/v1/chat, (2) api.getConversations() GET /api/v1/conversations, (3) api.getMessages(conversationId) GET /api/v1/conversations/{id}/messages; all methods auto-attach JWT token from localStorage
  - **Reference**: plan.md §Part 6 M3-T6, Part 5.2; requirements.md §API Specification
  - **DoD**: All three methods callable and return correct response schema, JWT auto-attached, error handling implemented, types exported for TypeScript
  - **Requirements Covered**: [Requirement: FR-U1, FR-U4]
  - **Completion Status**: ✅ Completed - API methods apiChat, apiGetConversations, apiGetMessages in src/lib/api.ts

- [x] **T-M3-007** Update Navbar with Chat toggle
  - **Description**: Update `frontend/components/Navbar.tsx` to add navigation link/button to switch between Dashboard (/tasks) and Chat (/chat) pages, include active indicator showing current page
  - **Reference**: plan.md §Part 6 M3-T7
  - **DoD**: Navbar updated with both links, navigation works, active state indicator visible, styling consistent with existing navbar
  - **Requirements Covered**: [Requirement: FR-U1, FR-U4]
  - **Completion Status**: ✅ Completed - Navbar with Chat link and active indicator at src/components/dashboard/Navbar.tsx

- [x] **T-M3-008** Styling & responsiveness for Chat UI
  - **Description**: Apply Tailwind CSS styling to chat components: (1) ChatKit component styling via Tailwind utilities, (2) mobile responsive (sidebar collapses on mobile, stacks vertically), (3) dark mode support, (4) accessibility (WCAG AA)
  - **Reference**: plan.md §Part 6 M3-T8; requirements.md §UI/UX Checklist
  - **DoD**: Chat page styled consistently with dashboard, responsive layout tested on mobile, dark mode toggles correctly, WCAG AA scan passes
  - **Requirements Covered**: [Requirement: FR-U1, FR-U4]
  - **Completion Status**: ✅ Completed - Full Tailwind CSS styling, mobile responsive layout with sidebar collapse, accessibility features

---

## Milestone 4: End-to-End Testing & Verification

**Goal**: Verify full workflow: User → Chat → Agent → Tools → Database → Dashboard

### Integration Tests

- [ ] **T-M4-001** Integration test: Create task via chat
  - **Description**: Write test script (pytest or manual walkthrough) that: (1) sends chat message "Create task: Buy groceries", (2) verifies Agent calls todo_create Tool, (3) verifies task inserted in database, (4) verifies Agent responds with confirmation, (5) verifies task appears in Dashboard
  - **Reference**: plan.md §Part 6 M4-T1; requirements.md §Intent Recognition
  - **DoD**: Test passes, task created in DB with correct user_id, Agent response contains task title, task visible in Dashboard immediately after
  - **Requirements Covered**: [Requirement: SC-001, SC-002, SC-003]

- [ ] **T-M4-002** Integration test: List tasks via chat
  - **Description**: Write test that: (1) creates 3 tasks, (2) sends "Show my tasks", (3) verifies Agent calls todo_list Tool, (4) verifies Agent responds with task list in natural language format
  - **Reference**: plan.md §Part 6 M4-T2; requirements.md §Intent Recognition
  - **DoD**: Test passes, agent lists all user's tasks, counts match, response readable
  - **Requirements Covered**: [Requirement: SC-001, SC-002, SC-004]

- [ ] **T-M4-003** Integration test: Complete task via chat
  - **Description**: Write test that: (1) creates task "Buy groceries", (2) sends "Mark Buy groceries as done", (3) verifies Agent calls todo_update Tool with completed=true, (4) verifies task marked complete in database
  - **Reference**: plan.md §Part 6 M4-T3; requirements.md §Intent Recognition
  - **DoD**: Test passes, task.completed set to true, task appears as done in Dashboard
  - **Requirements Covered**: [Requirement: SC-001, SC-002, SC-005]

### Security & Isolation Tests

- [ ] **T-M4-004** User isolation verification test
  - **Description**: Write test that: (1) creates User A with task "Secret", (2) attempts to access as User B via chat/API, (3) verifies User B gets 403 Forbidden or empty list, (4) verifies no cross-user data leak
  - **Reference**: plan.md §Part 6 M4-T4; requirements.md §Security & Isolation
  - **DoD**: Test passes, User B cannot list/read/update User A's tasks, conversation data isolated by user_id, database constraints prevent orphaned data
  - **Requirements Covered**: [Requirement: SC-006, SC-001]

### Statelessness & Reliability Tests

- [ ] **T-M4-005** Statelessness verification test
  - **Description**: Write test that: (1) starts conversation, (2) sends message "Create task A", (3) manually restarts backend server, (4) fetches conversation history, (5) verifies old conversation still retrievable with all messages intact
  - **Reference**: plan.md §Part 6 M4-T5, Part 3; requirements.md §Stateless Chat Persistence
  - **DoD**: Test passes, conversation survives restart, no data loss, messages retrieved from database (not memory), verifies no in-memory state violated Constitution §XII
  - **Requirements Covered**: [Requirement: SC-001, SC-003, SC-007]

- [ ] **T-M4-006** Dashboard ↔ Chat sync test
  - **Description**: Write test that: (1) creates task in Chat ("Buy milk"), (2) views in Dashboard, (3) edits in Dashboard (priority = high), (4) views in Chat, (5) verifies same task visible in both UIs with updates reflected
  - **Reference**: plan.md §Part 6 M4-T6
  - **DoD**: Test passes, task created in chat appears immediately in dashboard, dashboard edits reflect in chat UI, real-time sync or refresh works
  - **Requirements Covered**: [Requirement: SC-001, SC-002, SC-004]

- [ ] **T-M4-007** Error handling & graceful degradation test
  - **Description**: Write tests for error scenarios: (1) send malformed request, (2) send ambiguous intent ("Create task"), (3) permission error (delete another user's task), (4) verify Agent handles gracefully with user-friendly error messages (no system details leaked)
  - **Reference**: plan.md §Part 6 M4-T7; requirements.md §Intent Recognition, Tool Execution
  - **DoD**: Test passes, error messages are conversational, no Python tracebacks leaked, Agent offers clarification or retry
  - **Requirements Covered**: [Requirement: SC-001, SC-003, SC-007]

### Performance & Load Testing

- [ ] **T-M4-008** Performance test: Latency & load
  - **Description**: Write load test that: (1) simulates 100 concurrent users sending chat messages, (2) measures average response time (target: < 2 seconds), (3) verifies no N+1 queries (use query logging), (4) verifies database connection pool doesn't exhaust, (5) records results
  - **Reference**: plan.md §Part 6 M4-T8; requirements.md §Success Criteria SC-001
  - **DoD**: Test completes, avg latency < 2s, no N+1 queries detected, connection pool stable, results documented
  - **Requirements Covered**: [Requirement: SC-001, SC-002, SC-007]

---

## Task Dependencies & Completion Order

### Dependency Graph

```
M1 (Database) blocks all M2, M3, M4
├─ M1-T1, M1-T2 (Migrations) → M1-T3 (Execute)
├─ M1-T4, M1-T5 (Models) → M2 (Tools)
└─ M1-T6, M1-T7 (Backend setup) → M2-T6 (Agent)

M2 (Backend) blocks M3, M4
├─ M2-T1, M2-T2 (Schemas) → M2-T3, M2-T4, M2-T5 (Tools)
├─ M2-T6 (Agent setup) → M2-T8 (Chat endpoint)
└─ M2-T8 (Chat endpoint) → M3-T3 (ChatContainer), M4-T1 (Integration tests)

M3 (Frontend) blocks M4 E2E
├─ M3-T1, M3-T2 (Setup) → M3-T3, M3-T4, M3-T5 (Components)
├─ M3-T6 (API client) → M3-T3 (ChatContainer send)
└─ M3-T7 (Navbar) → M3-T8 (Complete UI)

M4 (Testing) validates all
├─ M4-T1, M4-T2, M4-T3 (CRUD tests) depend on M2-T3, M2-T4, M2-T5
├─ M4-T4 (User isolation) depends on M2 + M1 FK constraints
├─ M4-T5 (Statelessness) depends on M2-T7, M2-T8 (Agent stateless)
└─ M4-T6, M4-T7, M4-T8 depend on M3 complete
```

### Critical Path (Sequential)

1. **M1-T1, M1-T2** → Create migration files (parallel)
2. **M1-T3** → Execute migrations (blocks all M2+)
3. **M1-T4, M1-T5** → Create models (parallel)
4. **M1-T6, M1-T7** → Update main.py, add dependencies (parallel)
5. **M2-T1, M2-T2** → Design schemas (parallel, ready for M2-T3+)
6. **M2-T3, M2-T4, M2-T5** → Implement tools (parallel after M2-T1,T2 done)
7. **M2-T6** → Agent implementation (ready after M2-T1, M2-T2, M1-T4)
8. **M2-T8, M2-T9** → Chat endpoints (ready after M2-T3,4,5,6 done)
9. **M3-T1, M3-T2** → Frontend setup (parallel, ready after M2-T8 done)
10. **M3-T3, M3-T4, M3-T5, M3-T6** → Components (parallel after M3-T2)
11. **M3-T7, M3-T8** → Navigation & styling (final frontend)
12. **M4-T1 through M4-T8** → Tests (ready after M2 + M3 complete)

### Parallelizable Tasks (Can run simultaneously)

**Parallel Group 1** (Database):
- M1-T1, M1-T2 (Write migration files)
- M1-T4, M1-T5 (Write SQLModel classes)
- M1-T6, M1-T7 (Update dependencies)

**Parallel Group 2** (Backend Tools):
- M2-T1, M2-T2 (Design schemas)
- After schemas done:
  - M2-T3, M2-T4, M2-T5 (Implement tools)

**Parallel Group 3** (Frontend):
- M3-T1, M3-T3, M3-T4, M3-T5, M3-T6 (Can start after M3-T2 server layout done)
- M3-T7, M3-T8 (Final styling)

**Parallel Group 4** (Tests):
- M4-T1, M4-T2, M4-T3 (CRUD tests)
- M4-T4 (User isolation)
- M4-T5 (Statelessness)
- M4-T6, M4-T7, M4-T8 (Sync, error handling, performance)

---

## Example Parallel Execution Plan

### Sprint 1: Database (Day 1-2)
**Parallel**:
- Developer A: M1-T1 (conversations migration)
- Developer B: M1-T2 (messages migration)
- Developer C: M1-T4 (Conversation model)
- Developer D: M1-T5 (Message model)

**Sequential** (after parallel):
- Developer E: M1-T3 (execute migrations)
- Developer F: M1-T6, M1-T7 (main.py, dependencies)

### Sprint 2: Backend Tools (Day 3-5)
**Sequential** (blocking):
- Developer A: M2-T1, M2-T2 (schemas)

**Parallel** (after schemas):
- Developer B: M2-T3 (todo_create)
- Developer C: M2-T4 (todo_list)
- Developer D: M2-T5 (read/update/delete)
- Developer E: M2-T6 (Agent setup)

**Sequential** (after all tools done):
- Developer F: M2-T8, M2-T9 (Chat endpoints)

### Sprint 3: Frontend + Tests (Day 6-8)
**Parallel**:
- Developer A: M3-T1, M3-T2 (ChatKit setup)
- Developer B: M4-T1, M4-T2, M4-T3 (CRUD tests)
- Developer C: M4-T4 (User isolation test)
- Developer D: M4-T5 (Statelessness test)

**Sequential** (after M3-T2):
- Developer E: M3-T3, M3-T4, M3-T5, M3-T6 (Components)
- Developer F: M3-T7, M3-T8 (Navigation & styling)

**Final** (after all M2 + M3):
- All: M4-T6, M4-T7, M4-T8 (Sync, error, performance tests)

---

## Task Implementation Strategy

### Recommended Approach

1. **Implement in dependency order** (see Critical Path above)
2. **Each task is independently testable** — test immediately after completion
3. **Reference plan.md section + requirement ID** while implementing
4. **Link code comments** to Task ID: `# [Task]: T-M2-003 | [From]: plan.md §Part 6 M2-T2, requirements.md §Tool Execution`
5. **Create PHR after each milestone** documenting decisions, challenges, verification
6. **Use `no task = no code`** rule — don't implement anything not in a task

### Verification Checklist

- [ ] All 32 tasks reviewed for clarity and completeness
- [ ] Task IDs match milestone structure (T-M1-001 through T-M4-008)
- [ ] Each task references specific plan.md section and requirement
- [ ] Definition of Done is measurable and testable
- [ ] Task dependencies documented and sequential order clear
- [ ] Parallelizable tasks identified
- [ ] PHR tasks included for capturing intelligence

---

## References

- **plan.md** (Part 1-8): Architecture, design decisions, task roadmap
- **requirements.md**: Feature checklist, functional requirements, success criteria
- **constitution.md**: Project principles (especially §XII statelessness mandate, §I user isolation)
- **backend/CLAUDE.md**: Backend implementation guidelines
- **frontend/CLAUDE.md**: Frontend implementation guidelines

---

**Status**: ✅ Tasks Ready for Implementation (All 32 Tasks)

**Next Step**: Begin with M1 tasks; confirm each task completion against Definition of Done before proceeding to next task.

