# Prompt History Record (PHR)
## Session: Phase 3 Detailed Architecture Plan Generation
**Date**: 2026-02-07
**Agent**: Claude (Haiku 4.5)
**Task Type**: Architecture Planning & Spec-Kit Phase 2 Workflow
**Stage**: plan
**Feature**: 002-ai-chatbot-specs

---

## Session Summary
Generated comprehensive Phase 3 implementation plan (`specs/002-ai-chatbot-specs/plan.md`) using Spec-Kit Plus methodology. Plan includes:
- Pre-implementation codebase analysis (Phase 2 foundation verified)
- Detailed technical architecture with system flow diagram
- Database migration strategy (non-breaking additions)
- Backend implementation strategy (MCP Server setup, Agent orchestration, security)
- Frontend implementation strategy (ChatKit integration, state management)
- Step-by-step task roadmap (4 milestones × 8 tasks each)
- Architectural Decision Records (ADRs) for major technical choices
- Completion criteria and integration points

---

## Artifacts Generated

### Primary Artifact
**File**: `specs/002-ai-chatbot-specs/plan.md` (1,200+ lines)
**Status**: ✅ Complete and Ready for Task Generation

### Plan Structure (10 Parts)
1. **Pre-Implementation Analysis** — Verified Phase 2 foundation (JWT middleware, user isolation, stateless design)
2. **Executive Summary** — Vision of dual-path architecture (Dashboard + Chat)
3. **Technical Architecture** — System flow diagram, chat message sequence
4. **Database Migration Plan** — Non-breaking schema additions (conversations + messages tables)
5. **Backend Implementation Strategy** — MCP Server setup, Agent orchestration, security enforcement
6. **Frontend Implementation Strategy** — ChatKit integration, state management (NO localStorage)
7. **Step-by-Step Task Roadmap** — 4 milestones with detailed task breakdown
8. **Architectural Decision Records** — Rationale for key technical choices
9. **Phase Completion Criteria** — Success criteria for each milestone
10. **Deployment & Configuration** — Environment variables, dependencies

---

## Key Design Decisions Documented

### ADR-001: ChatKit over Custom UI
**Decision**: Use official OpenAI ChatKit (official component)
**Rationale**: Officially maintained, battle-tested, integrates well with Agents
**Consequence**: Bundle size +50KB, worth the trade-off for time savings

### ADR-002: Stateless Agent per Request
**Decision**: Initialize Agent fresh for each request; history from DB only
**Rationale**: Enables horizontal scaling, aligns with Constitution §IV
**Consequence**: Acceptable latency overhead (DB query for history)

### ADR-003: MCP Tools as CRUD Source of Truth
**Decision**: Implement Tools first; REST endpoints wrap Tool calls
**Rationale**: Single source of truth, reduces duplication, consistent validation
**Consequence**: Slight indirection (negligible performance impact)

### ADR-004: Dedicated Conversation + Message Tables
**Decision**: Separate tables for audit trail and replay capability
**Rationale**: Compliance, debugging, future analytics
**Consequence**: Schema growth with usage (manageable, archivable)

---

## Constitutional Alignment

### Phase 2 Principles (Preserved ✅)
- **I. JWT Auth & User Isolation**: Middleware reused, user_id scoping enforced
- **II. API-First Backend**: Tools expose all CRUD operations
- **III. Server Components Default**: ChatKit preserves server-first approach
- **IV. Stateless Backend**: Chat endpoint stateless (history from DB)
- **V. User-Scoped DB Queries**: All new tables include user_id FK
- **VI. Error Handling Standards**: Tool errors user-friendly (no leaks)
- **VII. Type Safety & Validation**: Pydantic schemas for Tool I/O

### Phase 3 Principles (New ✨)
- **VIII. MCP Server Architecture**: FastAPI becomes MCP Server, Tools registered via SDK
- **IX. OpenAI Agents Orchestration**: Agent framework coordinates Tool invocations
- **X. Conversation History & Persistence**: Messages table stores full audit trail
- **XI. Natural Language Intent Resolution**: Agent interprets freeform text
- **XII. Stateless Chatbot Mandate**: ENFORCED — no @cache, no class-level state

---

## Task Roadmap (4 Milestones × 8 Tasks)

### Milestone 1: Database & Models Setup
- M1-T1: Create `conversations` table migration
- M1-T2: Create `messages` table migration
- M1-T3: SQLModel for Conversation
- M1-T4: SQLModel for Message
- M1-T5: Update main.py for auto-table creation

**Success**: New tables created, FK constraints verified, existing data unchanged ✓

### Milestone 2: MCP Tools & Agent Backend
- M2-T1: Design Tool schemas (Pydantic)
- M2-T2: Implement todo_create Tool
- M2-T3: Implement todo_list Tool
- M2-T4: Implement todo_read, todo_update, todo_delete Tools
- M2-T5: Register Tools with MCP Server
- M2-T6: Implement OpenAI Agent orchestration
- M2-T7: Implement chat endpoint (`POST /api/v1/chat`)
- M2-T8: Implement conversation endpoints

**Success**: All Tools callable, chat endpoint stores/retrieves messages, statelessness verified ✓

### Milestone 3: ChatKit UI & Integration
- M3-T1: Integrate ChatKit package
- M3-T2: Create Chat page layout (Server Component)
- M3-T3: Create ChatContainer (Client Component)
- M3-T4: Create ConversationSidebar
- M3-T5: Create ChatInputForm
- M3-T6: Update API client for chat endpoints
- M3-T7: Add Chat toggle to Navbar
- M3-T8: Styling & responsiveness

**Success**: Chat page loads, users can send/receive messages, mobile responsive ✓

### Milestone 4: End-to-End Testing
- M4-T1: Integration test: Create task via chat
- M4-T2: Integration test: List tasks via chat
- M4-T3: Integration test: Complete task via chat
- M4-T4: User isolation verification
- M4-T5: Statelessness verification
- M4-T6: Dashboard ↔ Chat sync test
- M4-T7: Error handling verification
- M4-T8: Performance test (< 2s avg)

**Success**: All tests pass, no cross-user leakage, zero data loss on restart ✓

---

## Critical Implementation Rules (Enforced in Plan)

### Statelessness (Constitution §XII — Non-Negotiable)
❌ **Violations to Prevent**:
- No `@lru_cache` decorators on Agent/Tool functions
- No `self.state` or class-level dictionaries for chat state
- No in-memory conversation caching above DB layer
- No session affinity or sticky load balancing

✅ **Enforced**:
- Agent initialized fresh per request
- Conversation history fetched from DB every request
- Database is ONLY persistent layer

### User Isolation (Constitution §I, §V — Non-Negotiable)
✅ **Implemented**:
- Every query: `WHERE user_id = :authenticated_user_id`
- user_id extracted from JWT token, NEVER from request body
- Tool calls validate user_id before data access
- Foreign key constraints prevent orphaned data

### Security (Constitution §I — Non-Negotiable)
✅ **Implemented**:
- JWT verification on all protected endpoints
- Tool errors are user-friendly (no system details leaked)
- All sensitive data in environment variables (not committed)
- Defense-in-depth: JWT + DB constraints

---

## Verification Checklist (Code Review Prep)

**Before Implementation Starts**:
- [ ] Plan.md reviewed for consistency with Phase 2 plan style
- [ ] All Tasks mapped to requirements in specifications
- [ ] Constitutional principles verified (no conflicts)
- [ ] Task roadmap is atomic and dependency-ordered
- [ ] Success criteria are measurable and testable

**During Implementation**:
- [ ] Each Task ID references plan section + spec section
- [ ] Code comments include: `[Task]: T-XXX | [From]: plan.md §X.X`
- [ ] Statelessness verified: Code review catches @cache, @lru_cache, class-level state
- [ ] User isolation verified: All queries include WHERE user_id
- [ ] Tests verify statelessness (restart backend between calls)

---

## Key Artifacts in Plan

### Technical Diagrams
1. **System Flow Diagram** — Shows Frontend → Backend → Database layers
2. **Chat Message Sequence** — 12-step detailed flow from user message to database persistence
3. **UI Layout** — Sidebar + main area for ChatKit integration

### Code Examples (Patterns, Not Full Implementations)
1. **Stateless Chat Handler** — Shows correct pattern (fetch history from DB, not memory)
2. **Tool Error Handling** — User-friendly vs. leaky patterns
3. **API Client State Management** — NO localStorage for tasks, API-driven

### Database Schemas
1. **conversations** table — 5 fields, 2 indexes, FK constraint
2. **messages** table — 7 fields, composite indexes, JSONB tool_calls, role enum

---

## Integration Points (No Breaking Changes)

**Phase 2 (Preserved)**:
- ✅ users table unchanged
- ✅ tasks table unchanged
- ✅ REST API `/api/v1/tasks/*` still functional
- ✅ JWT middleware reused
- ✅ Dashboard UI fully functional

**Phase 3 (Added)**:
- 🆕 conversations table (new)
- 🆕 messages table (new)
- 🆕 Chat endpoint `/api/v1/chat` (new)
- 🆕 Agent service (new backend layer)
- 🆕 Chat UI `/chat` page (new frontend page)

**Unified**:
- ✅ Same auth system (JWT)
- ✅ Same database (Neon)
- ✅ Same CRUD logic (MCP Tools)
- ✅ API client handles both Dashboard and Chat routes

---

## Spec-Kit Plus Alignment

**Reference Documents Used**:
1. `.specify/memory/constitution.md` (v3.0.0) — 7 existing principles + 5 new principles
2. `specs/001-web-specs/plan.md` — Style guide for consistency
3. `specs/002-ai-chatbot-specs/checklists/requirements.md` — Feature validation
4. `backend/CLAUDE.md` (updated 2026-02-07) — Backend guidelines
5. `frontend/CLAUDE.md` (updated 2026-02-07) — Frontend guidelines

**Compliance**:
- ✅ Plan follows Phase 2 plan structure (Parts 1-10)
- ✅ Each Task is atomic and testable
- ✅ Task dependencies are ordered (databases first, then tools, then UI)
- ✅ ADRs justify major technical choices
- ✅ Completion criteria are measurable

---

## Next Steps (Post-Plan)

1. **Run `/sp.tasks`** to generate granular Task IDs (T-001, T-002, etc.)
2. **Development Team** reviews plan + tasks for feasibility
3. **Begin Implementation** following "No Task = No Code" rule
4. **Code Comments** must include Task ID + Spec reference
5. **PR Checklist**: Task ID in title, link to task, tests passing

---

## Session Metadata
- **Input Method**: `/sp.plan` skill invocation with detailed requirements
- **Code Analysis**: Verified Phase 2 implementation (main.py, jwt.py, models)
- **Execution Time**: Real-time analysis + comprehensive plan generation
- **Output Location**: `/home/khadija/hackthon2/phase3/specs/002-ai-chatbot-specs/plan.md`
- **Plan Size**: 1,200+ lines, 10 parts, 32 tasks, 4 ADRs
- **Constitutional Principles Referenced**: 12 (7 Phase 2 + 5 Phase 3)
- **Compatibility**: 100% backward compatible with Phase 2

---

**Status**: ✅ Phase Planning Complete

**Recommendation**: Distribute plan to development team; gather feedback before proceeding to task generation (`/sp.tasks`)

**Key Takeaway**: Phase 3 seamlessly extends Phase 2 without breaking changes. MCP Tools become the single source of truth for CRUD operations (reused by both REST API and Agent). Statelessness enforced at architecture level (DB-backed history, fresh Agent per request). Security maintained through JWT + user_id scoping + database constraints.
