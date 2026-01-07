<!--
=============================================================================
SYNC IMPACT REPORT
=============================================================================
Version Change: 1.0.0 → 1.1.0
Rationale: MINOR bump - restructured constitution to apply universal principles
  across all 5 phases, added comprehensive 5-phase roadmap at start,
  introduced Phase-Based Development workflow, and added scope enforcement
  rules for sequential phase delivery.

Modified Principles:
  - Updated: I. Python First → now applies to Phases I-II, defines per-phase rules
  - Updated: II. CLI First → remains primary UX, but web/chat added in later phases
  - Updated: IV. Architecture → expanded to cover multi-phase integration patterns
  - Updated: V. Storage → expanded to include database patterns for Phase II+

Added Sections:
  - Project Roadmap (complete 5-phase delivery map at document start)
  - Phase-Based Development workflow (sequential completion, no premature deps)
  - Per-phase Technology Stack (replaces single stack definition)
  - Cross-Phase Integration Rules (how phases coexist and communicate)
  - Scope Guard (prevents Phase II-V dependencies in active phases)

Removed Sections: None (all prior principles preserved and generalized)

Templates Requiring Updates:
  ✅ No changes needed to spec-template.md (roadmap guides feature prioritization)
  ✅ No changes needed to plan-template.md (Constitution Check already in place)
  ✅ No changes needed to tasks-template.md (task phases must align with roadmap)
  ⚠ AGENTS.md: Update to reference phase-based scope rules and phase completion gates

Follow-up TODOs:
  - None - all new content is fully specified
=============================================================================
-->

# todo app Constitution

## Project Roadmap

The todo app is delivered in five distinct phases, executed sequentially. Each phase MUST be completed and stable before the next phase begins.

### Phase I: In-Memory Python Console App (ACTIVE)

**Objective**: Single-user CLI todo application with in-memory storage and JSON persistence.

**Tech Stack**:
- Language: Python 3.9+
- Package Manager: pip with `requirements.txt`
- CLI Framework: argparse (stdlib) or minimal approved alternative
- Storage: JSON files (local, no databases)
- Testing: pytest (optional for Phase I)
- Linting: pylint or flake8
- Deployment: Standalone Python executable

**Core Scope**:
- Task management (add, delete, list, filter, mark complete)
- Local file persistence (~/.todo/ directory)
- CLI-first user interaction
- No external services, APIs, or dependencies

**Exit Criteria**:
- All Phase I features implemented per spec
- Zero linting violations
- Code 100% traceable to spec + plan + tasks
- Manual testing passed

---

### Phase II: Full-Stack Web Application

**Objective**: Multi-user web interface with persistent database and REST API.

**Tech Stack**:
- Frontend: Next.js (React), TypeScript
- Backend: FastAPI (Python)
- ORM: SQLModel (Python, bridges FastAPI + SQLAlchemy)
- Database: Neon (PostgreSQL managed)
- API: RESTful JSON (OpenAPI auto-docs)
- Testing: pytest (backend), Jest/Vitest (frontend)
- Deployment: Vercel (frontend) + serverless/managed (backend)

**Core Scope**:
- Multi-user account system with auth (JWT or OAuth)
- Web UI mirroring Phase I functionality
- Persistent PostgreSQL database
- REST API for task operations
- Backward compatibility: Phase I CLI still works against Phase II data

**Exit Criteria**:
- Phase II features fully implemented
- Phase I CLI integration verified
- Database migrations and schema versioned
- Full test coverage for critical paths

---

### Phase III: AI-Powered Todo Chatbot

**Objective**: Conversational task management with natural language commands and AI insights.

**Tech Stack**:
- Chat Framework: OpenAI ChatKit or LangChain
- AI Model: OpenAI GPT-4 or Claude API
- Agents SDK: Anthropic Agents SDK
- MCP (Model Context Protocol): MCP SDK for agent tools
- Integration: Bridge to Phase II API
- Testing: Integration tests for chat flows

**Core Scope**:
- Natural language task input ("Add 'buy milk' for tomorrow")
- AI-powered task recommendations and insights
- Conversation history and context awareness
- Integration with Phase I CLI and Phase II web UI
- Agent-based task automation

**Exit Criteria**:
- Chat flows fully functional
- AI agents tested and reliable
- Integration with Phases I & II verified
- Conversation quality metrics met

---

### Phase IV: Local Kubernetes Deployment

**Objective**: Containerized microservices orchestrated on local Kubernetes.

**Tech Stack**:
- Containerization: Docker (Dockerfiles for each service)
- Orchestration: Minikube (local Kubernetes)
- Package Manager: Helm (charts for deployment)
- DevOps Tools: kubectl, kubectl-ai
- Infrastructure as Code: Helm values and manifests
- Monitoring: Prometheus/Grafana (optional)

**Core Scope**:
- Containerize Phase II backend and Phase III chat services
- Deploy locally via Minikube
- Service discovery and networking
- Persistent volume management
- All prior phases (I, II, III) remain functional

**Exit Criteria**:
- All services containerized and running on Minikube
- Health checks and readiness probes configured
- Helm charts fully parameterized
- Local cluster scales and recovers correctly

---

### Phase V: Advanced Cloud Deployment

**Objective**: Production-ready cloud-native architecture on DigitalOcean Kubernetes Service.

**Tech Stack**:
- Cloud Platform: DigitalOcean (DOKS - managed Kubernetes)
- Event Streaming: Apache Kafka (or DigitalOcean managed alternative)
- Service Mesh: Dapr (distributed application runtime)
- Container Registry: DigitalOcean Container Registry
- CDN/Networking: DigitalOcean Spaces, VPC
- Monitoring: DigitalOcean Monitoring, DataDog, or equivalent
- Infrastructure as Code: Terraform or Pulumi

**Core Scope**:
- Deploy Phase IV services to DOKS
- Event-driven architecture via Kafka
- Distributed tracing and observability
- Auto-scaling and load balancing
- All prior phases integrated and production-ready

**Exit Criteria**:
- Deployed to DOKS with auto-scaling
- Event streams operational
- Observability and alerting configured
- High availability and disaster recovery tested

---

## Core Principles

Universal principles apply across all phases. Phase-specific constraints are noted.

### I. Quality-First Development

All code MUST adhere to strict quality standards regardless of phase:

- **Python (Phases I, II)**: PEP8 mandatory, type hints for all functions, docstrings (Google style) for all public APIs
- **JavaScript/TypeScript (Phase II+)**: ESLint + Prettier, strict typing in TypeScript, JSDoc for public functions
- **Linting**: Zero warnings before merge (phase-specific tools: pylint/flake8 for Python, ESLint for JS)
- **Testing**: Automated tests for critical business logic; 100% coverage for core services
- **Code Review**: All PRs MUST verify compliance: "Does this code trace back to spec + plan + task?"

**Rationale**: Code quality compounds across phases. Early technical debt becomes debt tax. Uniform standards enable team collaboration and AI agent understanding.

---

### II. User-First Interfaces

Every feature MUST prioritize the primary user interaction pattern for its phase:

- **Phase I (CLI)**: Command-line text interface, arguments/stdin input, stdout/stderr output, human-readable default, JSON mode optional
- **Phase II (Web)**: RESTful JSON API + responsive web UI, both equally supported, backward-compatible CLI
- **Phase III (Chat)**: Conversational natural language input, while maintaining Phases I & II interfaces
- **Phase IV–V**: All prior interfaces remain functional; cloud/DevOps interfaces additive only

**Rationale**: Users exist across interfaces and phases. Removing an interface breaks trust. Maintain all prior UX.

---

### III. Architecture: Modular & Testable

Each module MUST have a single, well-defined responsibility. Apply across all phases:

- **Phase I**: `cli/`, `models/`, `services/`, `storage/` directories with strict dependency flow
- **Phase II+**: Services/microservices with clear APIs; databases abstractions; communication via REST/async
- **All Phases**: No circular dependencies. Dependencies flow downward only.
- **Integration**: Services communicate via versioned contracts (OpenAPI specs, gRPC, message schemas)

**Rationale**: Modularity enables testing, parallel development, and phase transitions without rewrite.

---

### IV. Data Persistence & Integrity

Data storage MUST evolve with phases while maintaining integrity:

- **Phase I**: JSON files (readable, debuggable, no external services)
- **Phase II**: PostgreSQL via SQLModel, schema versioning via Alembic, migrations tested
- **Phase III+**: Event logs (Kafka), audit trails, eventual consistency patterns
- **All Phases**: Data validation at system boundaries; no silent failures; graceful error recovery

**Rationale**: Users trust their data. Consistency and auditability are non-negotiable.

---

### V. Spec-Driven Development (SDD) Workflow

**NON-NEGOTIABLE**: Every code change MUST be traceable to specification, plan, and task.

Before writing any code (any phase):
1. Feature requirement MUST be defined in `speckit.specify` (WHAT)
2. Implementation approach MUST be documented in `speckit.plan` (HOW)
3. Atomic tasks MUST be created in `speckit.tasks` (BREAKDOWN)
4. Each task MUST reference the spec section and plan section it implements

During code implementation (any phase):
5. Every new function, class, module, or service MUST include a comment linking to Task ID and Spec:
   ```python
   # [Task]: T-001
   # [From]: speckit.specify §1.2, speckit.plan §2.3
   def add_task(task_name: str) -> Task:
       """Implement user story 'Add a task'."""
   ```
6. Code commits MUST reference the task ID
7. **Hard rule**: No task ID = No commit

**Rationale**: SDD prevents "vibe coding," ensures alignment across agents and phases, makes work auditable and repeatable.

---

## Phase-Based Development Workflow

This constitution enforces **sequential phase delivery** with strict scope gates.

### Phase Completion Rules

1. **Active Phase Lock**: Only ONE phase is active for development at any time
2. **Completion Criteria**: A phase is complete when:
   - All user stories from spec are implemented and tested
   - Code is 100% traceable to spec + plan + tasks
   - Zero linting violations and all tests pass
   - Phase-specific tech stack fully integrated
   - All prior phases remain backward compatible

3. **Advancement Gate**: Before advancing to the next phase:
   - Current phase MUST be tagged as stable (git tag: `phase-N-stable`)
   - Code review and acceptance by project lead
   - Integration tests with prior phases MUST pass

4. **Scope Control**: During Phase N development:
   - NO dependencies on Phase N+1 or later technologies
   - NO architectural changes required by future phases
   - NO speculative features for future phases
   - Any multi-phase feature MUST be deferred to its proper phase

### Technology Stack Rules: Phase-Specific Constraints

**Phase I (Python Console)**:
- ONLY Python 3.9+ stdlib + approved minimal dependencies
- NO FastAPI, SQL, Docker, Kubernetes, or cloud services
- NO web frameworks or databases
- Storage: JSON files only
- Deployment: Single Python script

**Phase II (Web + Backend)**:
- Frontend: Next.js + React (no other JS frameworks)
- Backend: FastAPI only (no Django, Flask, or other Python backends)
- Database: PostgreSQL via SQLModel (no other databases)
- NO Kafka, Dapr, Kubernetes, or cloud-specific services yet
- Storage: PostgreSQL primary, JSON for document fields only

**Phase III (AI Chat)**:
- LLM: OpenAI/Anthropic API only (no local LLMs in Phase III)
- Agents: Anthropic Agents SDK + MCP SDK
- NO Kafka, Kubernetes, or advanced cloud services
- All chat requests route through Phase II API

**Phase IV (Local Kubernetes)**:
- Containerization: Docker only
- Orchestration: Minikube only (NO production cloud yet)
- Package Mgmt: Helm for local testing
- NO Kafka, Dapr, or advanced observability yet
- Single-machine deployment only

**Phase V (Cloud Production)**:
- All prior tech stacks fully supported
- Cloud: DigitalOcean DOKS (NO multi-cloud)
- Event Streaming: Kafka (required for Phase V only)
- Service Mesh: Dapr (required for Phase V only)
- Monitoring: Full observability stack required

### Violation Protocol: Scope Guard

Any attempt to violate scope or prematurely introduce dependencies MUST be:
1. **Flagged immediately** in code review as "Constitutional Violation"
2. **Logged** in the pull request with phase and principle violated
3. **Rejected** with required remediation: defer to proper phase or redesign for current phase
4. **Documented** in the project's `violations.log` for future reference

Example:
```
❌ PR #42: Attempted to add FastAPI endpoint in Phase I
   Violation: Introduction of Phase II tech in Phase I code
   Required: Defer feature to Phase II, OR redesign for Phase I constraints
   Decision: REJECTED pending redesign
```

---

## Governance: Amendment & Compliance

- **Constitution Supersedes**: All other practices and guidance files
- **Amendment Procedure**: Changes to core principles require:
  - Explicit justification in an ADR (Architecture Decision Record)
  - Impact analysis on all active and future phases
  - Team consensus or project lead approval
  - Update to dependent templates and AGENTS.md

- **Compliance Review**:
  - All PRs MUST verify: "Does this code trace back to spec + plan + task?"
  - Violations (code without task ID, task without spec, scope creep) MUST be rejected
  - Weekly phase progress review against roadmap

- **Runtime Guidance**: Use `.specify/AGENTS.md` as the runtime development guide for all agents

---

**Version**: 1.1.0 | **Ratified**: 2026-01-04 | **Last Amended**: 2026-01-07
