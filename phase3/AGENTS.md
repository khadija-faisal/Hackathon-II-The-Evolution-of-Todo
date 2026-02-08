
# **AGENTS.md**
## **Purpose**
This project uses **Spec-Driven Development (SDD)** — a workflow where **no agent is allowed to
write code until the specification is complete and approved**.
All AI agents (Claude, Copilot, Gemini, local LLMs, etc.) must follow the **Spec-Kit lifecycle**:
> **Specify → Plan → Tasks → Implement**
This prevents "vibe coding," ensures alignment across agents, and guarantees that every
implementation step maps back to an explicit requirement.
---
## Project Overview
**AI-Powered Todo Chatbot App - Hackathon Phase III**

This is a **unified, full-stack application** that blends:
- **Phase II**: Traditional REST API + Web UI (CRUD operations via forms)
- **Phase III**: AI-Powered Chatbot + MCP Tools (CRUD operations via natural language)

Single codebase. Single database. One architecture supporting both paradigms.

## Project Structure
- `/frontend` - Next.js 15 app (Chat UI + Dashboard)
- `/backend` - Python FastAPI server (REST endpoints + MCP Server)
- `/specs` - Organized specifications (Phase II + Phase III)
- `.specify/memory/constitution.md` - Project rules and constraints (v3.0.0)
- `backend/CLAUDE.md` - Backend implementation guidelines
- `frontend/CLAUDE.md` - Frontend implementation guidelines

## Spec-Kit Structure
Specifications organized by feature branch in `/specs`:

**Phase II (Feature Branch: 001-web-specs)**
- `/specs/overview.md` - Project overview (includes Phase II + Phase III context)
- `/specs/features/authentication.md` - JWT + Better Auth
- `/specs/features/task-crud.md` - CRUD operations (User Stories 1-4 are Phase II; Story 5 is Phase III)
- `/specs/api/rest-endpoints.md` - REST API endpoints (Phase II preserved; Phase III chat endpoints added)
- `/specs/database/schema.md` - Users + Tasks tables (Phase II retained; Conversations + Messages added for Phase III)
- `/specs/ui/pages.md` - Traditional dashboard and pages

**Phase III (Feature Branch: 002-ai-chatbot-specs)**
- `/specs/ui/chatbot-ui.md` - OpenAI ChatKit agentic interface
- `/specs/002-ai-chatbot-specs/checklists/requirements.md` - Phase III feature checklist (MCP, Agents, stateless, ChatKit)

---

## **Phase III Architecture: MCP + OpenAI Agents + Stateless Chatbot**

### Core Concepts
1. **MCP Server**: Backend is an MCP Server. All CRUD operations exposed as Tools, not just REST endpoints.
2. **Tools**: `todo_create`, `todo_read`, `todo_update`, `todo_delete`, `todo_list` - discoverable by OpenAI Agents
3. **OpenAI Agents Framework**: Interprets natural language intent, selects appropriate Tools, chains multiple calls if needed
4. **Stateless Chatbot**: ZERO in-memory state. Conversation history retrieved from database (messages table). Agent initialized fresh each request.
5. **OpenAI ChatKit**: Modern chat UI component. No complex state management on frontend.
6. **User Isolation**: Every Tool call validates user_id from JWT. Every DB query includes WHERE user_id = :id.

### Unified Data Flow

```
USER INTERACTION (Two Paths, One Database)

Path A (Phase II - Traditional):
User → Web Form → REST API → Validate JWT → Tool Call → Database Query (WHERE user_id) → Update DB → Response

Path B (Phase III - Conversational):
User → Chat Message → POST /api/v1/chat → Validate JWT → OpenAI Agent → Select Tool(s) →
  Tool Call → Database Query (WHERE user_id) → Update DB → Agent Response (Markdown) → Chat UI
```

**KEY PRINCIPLE**: Whether the user accesses via Web Form (Phase II) or Chat (Phase III), the backend does the same thing:
- Extract user_id from JWT
- Execute Tool (or call Tool internally for REST endpoints)
- Query database scoped by user_id
- Return response
- Persist conversation (if chat) to messages table

---

## **How Agents Must Work**
Every agent in this project MUST obey these rules:

### Core Rules (Always Apply)
1. **Never generate code without a referenced Task ID** from `speckit.tasks`
2. **Never modify architecture without updating `.specify/plan.md`**
3. **Never propose features without updating `/specs/` files**
4. **Never change principles without updating `.specify/memory/constitution.md` (v3.0.0)**
5. **Every code file must contain a comment linking it to the Task ID and Spec section**
   - Example: `# [Task]: T-001 | [From]: specs/features/task-crud.md §3.2, plan.md §2.1`
6. **If a requirement is missing, STOP and request a spec update** — never improvise

### Phase III Specific Rules
7. **MCP Tools over REST endpoints**: When adding CRUD functionality, expose as MCP Tool first, REST endpoint optional
8. **User_id isolation ALWAYS**: Every database query MUST include `WHERE user_id = :user_id` (enforced by Tool + DB constraint)
9. **Stateless chatbot ENFORCED**: No @lru_cache, no self.state, no class-level variables for conversation data. Database only.
10. **Tool naming convention**: `todo_<verb>` (lowercase, underscore-separated): `todo_create`, `todo_read`, `todo_update`, `todo_delete`, `todo_list`
11. **Conversation persistence**: All user-agent exchanges stored in `messages` table with Tool calls recorded in JSONB `tool_calls` column
12. **Frontend state**: No localStorage for tasks. Sync via API only. ChatKit handles chat UI state (transient, not persistent)

If an agent cannot find the required spec, it must **stop and request it**, not improvise.
---
## **Spec-Kit Workflow (Source of Truth)**
### **1. Constitution (WHY — Principles & Constraints)**
File: `speckit.constitution`
Defines the project’s non-negotiables: architecture values, security rules, tech stack constraints,
performance expectations, and patterns allowed.
Agents must check this before proposing solutions.
---
### **2. Specify (WHAT — Requirements, Journeys & Acceptance Criteria)**
File: `speckit.specify`
Contains:
* User journeys
* Requirements
* Acceptance criteria
* Domain rules
* Business constraints
Agents must not infer missing requirements — they must request clarification or propose
specification updates.
---
### **3. Plan (HOW — Architecture, Components, Interfaces)**
File: `speckit.plan`
Includes:
* Component breakdown
* APIs & schema diagrams
* Service boundaries
* System responsibilities
* High-level sequencing

All architectural output MUST be generated from the Specify file.
---
### **4. Tasks (BREAKDOWN — Atomic, Testable Work Units)**
File: `speckit.tasks`
Each Task must contain:
* Task ID
* Clear description
* Preconditions
* Expected outputs
* Artifacts to modify
* Links back to Specify + Plan sections
Agents **implement only what these tasks define**.
---
### **5. Implement (CODE — Write Only What the Tasks Authorize)**
Agents now write code, but must:
* Reference Task IDs
* Follow the Plan exactly
* Not invent new features or flows
* Stop and request clarification if anything is underspecified
> The golden rule: **No task = No code.**
---
## Development Workflow

### For Every Feature (Phase II or Phase III)
1. **Read Constitution**: `.specify/memory/constitution.md` (v3.0.0) — understand principles
2. **Read Spec**: `/specs/features/[feature].md` or `/specs/[###-feature]/spec.md`
3. **Read Plan**: `.specify/plans/[feature].md` or skip if design doc sufficient
4. **Read Tasks**: `.specify/tasks/[feature].md` — identify your Task ID
5. **Read Layer Guides**:
   - Backend feature? → `backend/CLAUDE.md`
   - Frontend feature? → `frontend/CLAUDE.md`
   - Both? → Read both
6. **Implement**: Follow Task ID + Layer Guide
7. **Link Code**: Add comment in every file with Task ID and Spec reference
8. **Test & Commit**: Commit message must include Task ID

### Running the Application

**Development (Both Services)**:
```bash
# Terminal 1: Backend
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev
```

**Combined (Docker)**:
```bash
docker-compose up  # Builds and runs both services
```

**Environment Setup**:
```bash
# Root directory (.env or .env.local)
DATABASE_URL=postgresql://...  # Neon connection string
BETTER_AUTH_SECRET=your_secret_key
OPENAI_API_KEY=sk-...          # For Phase III chatbot

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## How to Use Specs
1. **Always read the relevant spec** before implementing (even if assigned a Task ID)
2. **Reference specs in code comments**: `@specs/features/task-crud.md §3.2`
3. **Reference task ID in commits**: `[T-001] Implement todo_create Tool`
4. **Update specs if requirements change**: File a spec update request (do not code around it)

---

## **Agent Behavior in This Project**

### **When generating code (All Phases):**
Link to Task ID in comments:
```python
# [Task]: T-042
# [From]: specs/features/task-crud.md §5.2, .specify/plans/ai-chatbot.md §3.1
# [Phase]: III (MCP Tool implementation)
```

### **When implementing MCP Tools (Phase III ONLY):**
Every Tool must have:
```python
# 1. Tool definition with input/output Pydantic schemas
# 2. JWT verification before execution (user_id from token)
# 3. WHERE user_id = :user_id in every database query
# 4. Tool response includes: success (bool) + error message (if failed)
# 5. No implementation details in error messages (user-friendly only)
```

### **When implementing Chat Endpoint POST /api/v1/chat (Phase III ONLY):**
```python
# 1. Validate JWT from Authorization header
# 2. Extract user_id from JWT claims (never from request body)
# 3. Retrieve conversation history from database (stateless - no memory)
# 4. Call OpenAI Agent with user message + history
# 5. Record Agent response + Tool calls in messages table
# 6. Return: conversation_id, agent_response, tool_calls array
```

### **When proposing architecture changes:**
Reference plan + constitution:
```
Update required in .specify/plan.md § [section]
Constitutional alignment: Principle VIII (MCP Server Architecture)
Rationale: [Why this change supports Phase III stateless + secure design]
```

### **When proposing new features (Phase II REST or Phase III Tools):**
```
Requires update in /specs/features/[feature].md
- New User Story + Acceptance Scenarios
- New Tool definition (if Phase III)
- New Success Criteria
- Data model updates (if applicable)
```

### **When changing principles:**
```
Modify .specify/memory/constitution.md → Principle #X
Version bump: 3.0.0 → 3.1.0 (MINOR) or 4.0.0 (MAJOR)
Rationale: [Business + technical justification]
```

---
## **Agent Failure Modes (What Agents MUST Avoid)**

### Core Violations (All Phases)
Agents are NOT allowed to:
* Freestyle code or architecture without Task ID
* Generate missing requirements (ask for spec update instead)
* Create tasks on their own (only developers/PMs do this)
* Alter stack choices without updating Constitution
* Add endpoints, fields, or flows not in spec
* Ignore acceptance criteria
* Produce "creative" implementations violating the plan

### Phase III Violations (Critical - Will Break Statelessness)
Agents MUST NOT:
* Add @lru_cache or memoization for conversation state
* Use class-level or instance variables for chatbot state
* Store conversation history in memory or Redis
* Add session affinity or sticky load balancing logic
* Implement custom caching above the database layer
* Use static variables for Tool definitions or Agent instances
* Cache OpenAI API responses (use database instead)
* Assume server affinity in distributed deployments

**CONSEQUENCE**: Violating statelessness rules breaks horizontal scaling and causes data loss on restarts.

### Phase III MCP Tool Violations
Agents MUST NOT:
* Create Tools without `todo_<verb>` naming pattern
* Expose Tools without input/output Pydantic schemas
* Allow Tools to execute without user_id verification
* Return unscoped data (bypass WHERE user_id = :id)
* Log sensitive data in Tool errors
* Add Tool logic that duplicates REST endpoint logic (tools should be single source)
* Create Tools that store state in Agent or backend memory

### Conflict Resolution Hierarchy
If a conflict arises between spec files:
```
Constitution > Plan > Specification > Tasks
(Principles override architecture, which overrides requirements, which guide implementation)
```
---
## **Developer–Agent Alignment**
Humans and agents collaborate, but the **spec is the single source of truth**.
Before every session, agents should re-read:
1. `.memory/constitution.md`
This ensures predictable, deterministic development

