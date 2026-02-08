# Prompt History Record (PHR)
## Session: Phase 3 Backend & Frontend Guidelines Update
**Date**: 2026-02-07
**Agent**: Claude (Haiku 4.5)
**Task Type**: Documentation & Spec-Kit Compliance

---

## Session Summary
Updated critical documentation files (`backend/CLAUDE.md` and `frontend/CLAUDE.md`) to reflect unified Phase 2 + Phase 3 architecture for the AI-Powered Todo Chatbot application.

**Scope**: Spec-Driven Development (SDD) alignment, MCP Server architecture, stateless chatbot design, unified UI patterns.

---

## Artifacts Modified

### 1. `/backend/CLAUDE.md` (Phase 2 + Phase 3 Unified)
**Status**: ✅ Complete

**Key Sections**:
- **Stack**: FastAPI, SQLModel, Neon DB, Official MCP SDK, OpenAI Agents SDK
- **Core Architecture**: Two access patterns (REST + MCP) from single codebase
- **Project Structure**: Tools/, Auth/, Agents/, Routes/ organization
- **Security & User Isolation**: JWT verification, WHERE user_id scoping
- **MCP Tools**: Naming convention (todo_<verb>), input/output schemas, execution logic
- **REST Endpoints**: Phase 2 CRUD routes preserved
- **Chat Endpoint**: POST /api/v1/chat flow (stateless, history from DB)
- **Database Design**: Users, Tasks, Conversations, Messages tables
- **Task Traceability**: Code comment requirements
- **Key Rules**: 8 enforced principles

**Critical Guidelines**:
- All CRUD via Tools (Tools are source of truth)
- User_id ALWAYS in queries (WHERE user_id = :id)
- Stateless Agent (NO @lru_cache, NO class-level state)
- Tool naming: lowercase, underscore, todo_<verb>
- Conversation persistence: Messages table only
- JWT validation: Always from token, never from body
- Error messages: User-friendly, no leaks

---

### 2. `/frontend/CLAUDE.md` (Phase 2 + Phase 3 Unified)
**Status**: ✅ Complete

**Key Sections**:
- **Stack**: Next.js 15, TypeScript, Tailwind CSS, OpenAI ChatKit
- **Core Architecture**: Unified UI (Dashboard + Chat embedded)
- **Project Structure**: app/, components/, lib/, hooks/
- **Component Patterns**: Server Components first, Client for interactivity
- **API Client**: Centralized `/lib/api.ts` (JWT auto-attach)
- **State Management**: NO localStorage for tasks, API is source of truth
- **Phase 2 Dashboard**: Traditional task mgmt via forms
- **Phase 3 Chat UI**: ChatKit integration, stateless chat state
- **Navigation**: Dashboard ↔ Chat toggle in Navbar
- **Styling**: Tailwind utility-first, dark mode support
- **Task Traceability**: Code comment requirements
- **Key Rules**: 10 enforced principles

**Critical Guidelines**:
- Server Components by default
- API Client centralized (all calls through /lib/api.ts)
- NO local storage for task data (sync via API)
- Chat is part of app (not separate)
- JWT auto-attached by API client
- ChatKit state is transient (DB is persistent)
- Shared components (TaskCard, TaskForm)
- Error boundaries required

---

## Design Principles Enforced

### Security
- ✅ JWT verification on all requests
- ✅ User_id extracted from token (never from body)
- ✅ WHERE user_id scoping in all DB queries
- ✅ Tool execution validates user context
- ✅ Error messages don't leak sensitive data

### Statelessness (Phase 3 Critical)
- ✅ NO @lru_cache, @cache decorators
- ✅ NO class-level conversation state
- ✅ NO in-memory storage above DB
- ✅ Agent initialized fresh per request
- ✅ Conversation history from database only

### Architecture Alignment
- ✅ MCP Server as single source of Tools
- ✅ REST endpoints optional (wrap Tools)
- ✅ Unified database (Phase 2 + Phase 3)
- ✅ Shared UI components (Dashboard + Chat)
- ✅ API client centralized (no direct calls)

### Task Traceability
- ✅ Every code file links to Task ID
- ✅ Spec references in comments required
- ✅ Phase indicators (II | III)
- ✅ Commit messages include Task IDs
- ✅ No freestyle code (Task ID required)

---

## Verification Checklist

- [x] Backend guidelines cover both REST (Phase 2) + MCP (Phase 3)
- [x] Frontend guidelines cover both Dashboard (Phase 2) + Chat (Phase 3)
- [x] Security model documented (JWT + user_id scoping)
- [x] Statelessness explicitly enforced (no caching patterns)
- [x] Tool naming convention clarified (todo_<verb>)
- [x] Chat endpoint flow documented (stateless flow)
- [x] Database design includes conversations + messages
- [x] API Client pattern explained (centralized, no localStorage)
- [x] Component patterns defined (Server first, Client for interactivity)
- [x] Task traceability requirements specified
- [x] Key rules formatted with checkmarks (enforcement emphasis)
- [x] References to specs (.specify/memory, /specs/, .specify/plans)

---

## Implementation Alignment

### Constitutional Alignment
- **Principle I (MCP Server)**: ✅ Backend is MCP Server, all Tools exposed
- **Principle VIII (User Isolation)**: ✅ user_id in every query
- **Principle IX (Statelessness)**: ✅ NO class-level state, DB-backed history

### Spec-Kit Coverage
- **Constitution**: `.specify/memory/constitution.md` (v3.0.0) referenced
- **Specify**: Links to `/specs/features/task-crud.md` + `/specs/002-ai-chatbot-specs/`
- **Plan**: Links to `.specify/plans/ai-chatbot.md`
- **Tasks**: Task ID comment pattern specified for code files

### Phase 2 Preservation
- ✅ REST endpoints still documented (/api/v1/tasks, etc.)
- ✅ Dashboard UI patterns preserved
- ✅ Form-based CRUD still supported
- ✅ Traditional task management workflow intact

### Phase 3 Integration
- ✅ MCP Tools clearly defined (todo_create, etc.)
- ✅ OpenAI Agent integration documented
- ✅ ChatKit UI integration explained
- ✅ Stateless chat flow specified
- ✅ Conversation persistence explained

---

## Decision Records

### Backend Structure Choice
**Decision**: Single backend serving both REST + MCP patterns
**Rationale**:
- Unified database (Tasks, Conversations, Messages)
- Shared authentication (JWT + user_id scoping)
- Tools as source of truth (REST endpoints wrap Tools)
- Easier maintenance (one code path for CRUD logic)

### Frontend Unified UI Choice
**Decision**: Dashboard + Chat embedded in same app (toggle navigation)
**Rationale**:
- Users see same task list in both UIs
- Shared session context
- No separate chatbot SPA
- Consistent styling and experience

### Statelessness Enforcement
**Decision**: Agent initialized fresh per request, history from DB only
**Rationale**:
- Enables horizontal scaling
- No data loss on restart
- Supports distributed deployments
- No session affinity required

### Tool Naming Convention
**Decision**: todo_<verb> pattern (lowercase, underscore-separated)
**Rationale**:
- Consistent OpenAI Agent discovery
- Follows MCP SDK conventions
- Clear naming semantics
- Avoids conflicts with other tools

---

## Key Takeaways for Team

### Strictest Rules (Zero Tolerance)
1. ❌ **NO @lru_cache** in Agent or Tool code
2. ❌ **NO class-level state** for conversations
3. ❌ **NO localStorage** for task data
4. ❌ **NO Tool calls without user_id verification**
5. ❌ **NO DB queries without WHERE user_id**

### Always Required
1. ✅ Every code file has Task ID comment
2. ✅ JWT extracted from token, never request body
3. ✅ API Client used for all backend calls
4. ✅ Shared components (TaskCard, TaskForm)
5. ✅ Error messages are user-friendly

### References During Implementation
- Backend: `/backend/CLAUDE.md` → Architecture, Tools, Chat endpoint
- Frontend: `/frontend/CLAUDE.md` → Component patterns, API client, state mgmt
- Principles: `.specify/memory/constitution.md` → Security, statelessness, architecture
- Specs: `/specs/` directory → Feature requirements, acceptance criteria
- Plans: `.specify/plans/` → Detailed architecture, components, interfaces

---

## Session Metadata
- **Files Modified**: 2 (backend/CLAUDE.md, frontend/CLAUDE.md)
- **Lines Added**: ~570 (comprehensive guidelines)
- **PHR Created**: 1 (this file)
- **Task IDs Referenced**: Constitutional principles (I, VIII, IX)
- **Spec Files Referenced**: 6+ (task-crud, pages, chatbot-ui, requirements, plans, constitution)

---

**Status**: ✅ Session Complete
**Next Action**: Distribute guidelines to development team, begin Phase 3 implementation following Task IDs from speckit.tasks
**PHR Archive**: `.specify/history/prompts/phr_phase3_guidelines_update_2026-02-07.md`
