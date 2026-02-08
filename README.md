# Hackathon II - Todo Application Evolution

Master **Spec-Driven Development** by building a todo app that evolves from CLI to cloud-native AI system across 5 phases.

---

## Phase 1: CLI Foundation ✅ COMPLETED

**Objective**: Build a command-line todo application with full CRUD operations.

### Features
- Add, list, update, complete, and delete tasks
- Local JSON file persistence with atomic writes
- Automatic data corruption recovery

### Stack
- Python 3.10+
- argparse (CLI)
- JSON storage
- pytest (62 tests, 100% coverage)

### Quick Start
```bash
cd phase1
uv venv && uv sync
uv run todo add "Buy groceries"
uv run todo list
uv run pytest
```

### Key Deliverables
- ✅ Spec-driven implementation with Constitution
- ✅ 5 user stories with acceptance criteria
- ✅ 23 atomic tasks with full traceability
- ✅ Comprehensive test suite
- ✅ Production-ready code with type hints & docstrings

**Status**: Complete | **Tests**: 62 passing | **Coverage**: 100%

---

## Phase 2: Full-Stack Web Application 🔄 IN PROGRESS

**Objective**: Transform Phase 1 into a secure multi-user web app with authentication and cloud database.

### Features
- User authentication (Better Auth + JWT)
- Task CRUD via REST API
- Multi-user isolation
- Responsive web UI

### Stack
- **Frontend**: Next.js 15 (App Router)
- **Backend**: FastAPI (Python)
- **Database**: Neon PostgreSQL
- **ORM**: SQLModel
- **Auth**: Better Auth with JWT tokens

### Architecture
```
Frontend (Next.js) → Backend API (FastAPI) → Database (Neon PostgreSQL)
                         ↑
                   JWT Verification
                   User Isolation
```

### API Endpoints
- `GET /api/tasks` - List user's tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/complete` - Toggle completion

### Quick Start
```bash
# Backend
cd phase2/backend
uvicorn main:app --reload

# Frontend (new terminal)
cd phase2/frontend
npm run dev

# Visit http://localhost:3000
```

**Status**: In Progress | **Stack**: Next.js + FastAPI + PostgreSQL

---

## Phase 3: AI-Powered Chatbot 🚀 PLANNED

**Objective**: Add conversational interface using OpenAI Agents & MCP tools.

### Features
- Natural language task management ("Add buy groceries", "Show pending tasks")
- Stateless chat endpoint
- MCP tools for task operations

### Stack
- OpenAI ChatKit (frontend)
- OpenAI Agents SDK
- MCP Server (Official SDK)
- FastAPI + SQLModel backend

**Status**: Planned | **Points**: 200

---

## Phase 4: Local Kubernetes ☸️ PLANNED

**Objective**: Deploy chatbot locally on Minikube with containerization.

### Features
- Docker containerization
- Helm Charts for deployment
- kubectl-ai & Kagent for intelligent Kubernetes ops
- Local Minikube cluster

### Stack
- Docker Desktop
- Minikube (local K8s)
- Helm Charts
- kubectl-ai, Kagent

**Status**: Planned | **Points**: 250

---

## Phase 5: Cloud Deployment ☁️ PLANNED

**Objective**: Deploy to production Kubernetes with event-driven architecture.

### Features
- Event-driven architecture with Kafka
- Dapr for distributed runtime
- Recurring tasks & scheduled reminders
- Multi-cloud support (Azure AKS, Google GKE, Oracle OKE)

### Key Components
- Kafka for event streaming
- Dapr for service abstraction
- DigitalOcean Kubernetes (DOKS)
- CI/CD pipeline (GitHub Actions)

**Stack**: Kafka, Dapr, DigitalOcean DOKS, Kubernetes

**Status**: Planned | **Points**: 300

---

## Spec-Driven Development

All phases follow **Spec-Driven Development (SDD)** methodology:

```
SPECIFY → PLAN → TASKS → IMPLEMENT
  (WHAT)   (HOW)  (WHO)    (CODE)
```

### Key Principles
1. **Constitution** - Project principles and constraints
2. **Specification** - Requirements and user stories
3. **Plan** - Architecture and design
4. **Tasks** - Atomic, testable work units with IDs
5. **Implementation** - Code traceable to specifications

Every code file has Task ID reference:
```python
# [Task]: T-001
# [From]: speckit.specify §2.1, speckit.plan §3.4
```

---

## Project Structure

```
hackathon2/
├── phase1/                  # ✅ CLI Foundation
│   ├── src/
│   ├── tests/
│   ├── specs/
│   └── README.md
│
├── phase2/                  # 🔄 Web Application
│   ├── frontend/            # Next.js app
│   ├── backend/             # FastAPI app
│   ├── specs/
│   └── README.md
│
├── AGENTS.md                # Agent behavior rules
└── README.md               # This file
```

---



### Bonus Opportunities
- Reusable Intelligence (Claude Subagents): +200 pts
- Cloud-Native Blueprints: +200 pts
- Multi-language Support (Urdu): +100 pts
- Voice Commands: +200 pts

---

## Key Technologies

**All Phases**:
- Claude Code for AI-assisted development
- Spec-Kit Plus for specification management
- GitHub for version control

**Phase 1**: Python, argparse, JSON, pytest

**Phase 2**: Next.js 15, FastAPI, SQLModel, Neon DB, Better Auth

**Phase 3**: OpenAI ChatKit, Agents SDK, MCP SDK

**Phase 4**: Docker, Minikube, Helm, kubectl-ai, Kagent

**Phase 5**: Kafka, Dapr, DigitalOcean DOKS

---

## Status Summary

| Phase | Status | Completion |
|-------|--------|-----------|
| Phase 1 | ✅ Complete | 100% |
| Phase 2 | ✅ Complete | 100% |
| Phase 3 | 🔄 In Progress | 70% |
| Phase 4 | 🔄 In Progress  | 0% |
| Phase 5 | ⏳ Planned | 0% |

---

**Methodology**: Spec-Driven Development (SDD)
**Framework**: Claude Code + Spec-Kit Plus
**Updated**: January 19, 2026
