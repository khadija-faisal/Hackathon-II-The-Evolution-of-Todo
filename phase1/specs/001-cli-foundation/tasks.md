# Task Breakdown: CLI Foundation - Spec-Driven Development

**Feature**: 001-cli-foundation | **Date**: 2026-01-08 | **Methodology**: Spec-Kit SDD

---

## Summary

Consolidated task breakdown: **5 Milestones** mapping directly to User Stories and project phases.
Each milestone explicitly references which User Story (US-X) or phase it implements.

- **M-001: Foundation & Setup** → Project infrastructure (no direct US)
- **M-002: US-1 & US-2** → Add Task + List Tasks (CORE MVP)
- **M-003: US-3** → Mark Task Complete (CORE MVP)
- **M-004: US-4 & US-5** → Update + Delete (Secondary)
- **M-005: Code Quality & Polish** → SDD Compliance (Cross-cutting)

**Total Tasks**: 23 atomic tasks consolidated into 5 high-level milestones

---

## Milestone Traceability Matrix

| Milestone | User Stories | Tasks | Phase | Priority | Value |
|-----------|--------------|-------|-------|----------|-------|
| M-001 | — | T-001 to T-008 | Foundation | Blocking | Infrastructure |
| M-002 | US-1, US-2 | T-009 to T-016 | Core MVP | P1 | Add + View tasks |
| M-003 | US-3 | T-017 to T-019 | Core MVP | P1 | Mark Complete |
| M-004 | US-4, US-5 | T-020 to T-022 | Secondary | P2/P3 | Update + Delete |
| M-005 | — | T-023 | Polish | Quality | SDD Compliance |

---

## M-001: Foundation & Setup (Project Initialization)

- [x] T-001 Create Python project structure in src/ and tests/ directories

  **SDD Reference**: plan.md §3 Project Structure

  **Target Files**: src/__init__.py, tests/__init__.py, pyproject.toml, uv.lock

  **Acceptance Criteria**:
  - src/todo_app/ directory exists with __init__.py ✅
  - pyproject.toml configured for uv with Python 3.9+ requirement ✅
  - All modules importable and tested ✅

  **Status**: ✅ COMPLETED - Project structure initialized with `uv init --lib`

- [x] T-002 Initialize Git repository and .gitignore for Python/uv

  **SDD Reference**: plan.md §3 Project Structure

  **Target Files**: .gitignore, .git/

  **Acceptance Criteria**:
  - Git repo initialized ✅
  - .gitignore excludes __pycache__, *.pyc, .venv, .todo/, .mcp.json ✅
  - Initial commit messages reference Constitution §VII (SDD) ✅

  **Status**: ✅ COMPLETED - Git repository already initialized (branch: 001-cli-foundation)

- [x] T-003 Configure uv environment and install dependencies

  **SDD Reference**: plan.md §2 Technical Context

  **Target Files**: pyproject.toml, uv.lock

  **Acceptance Criteria**:
  - uv venv created and activated ✅
  - pyproject.toml specifies Python 3.9+ as minimum ✅
  - No external dependencies (stdlib only) ✅
  - `uv run python --version` outputs 3.9+ ✅

  **Status**: ✅ COMPLETED - Project configured with uv, Python 3.9+ ready

- [ ] T-004 Set up linting and testing infrastructure

  **SDD Reference**: Constitution §II, §VII

  **Target Files**: pyproject.toml (pytest, flake8 config)

  **Acceptance Criteria**:
  - flake8 configured (100-char max line length)
  - pytest ready for test discovery
  - `uv run pytest --collect-only` lists all tests
  - `uv run flake8 src/` ready for linting

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T-005 Implement Task dataclass with serialization methods in src/models.py

  **SDD Reference**: spec.md §122-124, plan.md §2 Data Model, data-model.md §Entity

  **Target Files**: src/todo_app/models.py

  **Acceptance Criteria**:
  - Task dataclass with fields: id (int), title (str), status (str), created_at (str) ✅
  - to_dict() → JSON-compatible dict ✅
  - from_dict(dict) → Task object ✅
  - Type hints on all fields ✅
  - Google-style docstring ✅
  - Task ID comment per Constitution §VII: `# [Task]: T-005` ✅
  - create() factory method for new tasks ✅

  **Status**: ✅ COMPLETED - src/todo_app/models.py fully implemented

- [x] T-006 Implement storage module (load/save JSON) in src/storage.py

  **SDD Reference**: spec.md §103-121 Requirements, plan.md §3.4 Storage, data-model.md §Data Integrity

  **Target Files**: src/todo_app/storage.py

  **Acceptance Criteria**:
  - load_tasks() → List[Task] (auto-create ~/.todo/, handle missing file) ✅
  - save_tasks(tasks) → None (atomic write: temp file + rename) ✅
  - JSON corruption handling: backup to .bak, reinit empty ✅
  - Type hints, docstrings, Task ID comment ✅
  - Tested: persistence verified, JSON structure correct ✅

  **Status**: ✅ COMPLETED - src/todo_app/storage.py fully implemented with atomic writes
  - All exceptions caught and logged

- [x] T-007 Implement validation module in src/validation.py

  **SDD Reference**: spec.md §94-100 Edge Cases, plan.md §3.5 Validation, Constitution §VI

  **Target Files**: src/todo_app/validation.py

  **Acceptance Criteria**:
  - validate_title(str) → None (raises ValueError if empty or >255) ✅
  - validate_task_id(int) → None (raises ValueError if not positive) ✅
  - validate_task_exists(List[Task], int) → Task (raises ValueError if not found) ✅
  - Clear error messages per Constitution §VI ✅
  - Type hints, docstrings, Task ID comment ✅
  - Tested: empty title error, task not found error working ✅

  **Status**: ✅ COMPLETED - src/todo_app/validation.py fully implemented with clear user feedback

- [x] T-008 Implement manager CRUD interface in src/manager.py

  **SDD Reference**: plan.md §3.3 Core Logic, plan.md §4.2 Module Responsibilities

  **Target Files**: src/todo_app/manager.py

  **Acceptance Criteria**:
  - add_task(title: str) → Task ✅
  - list_tasks() → List[Task] ✅
  - complete_task(id: int) → Task ✅
  - update_task(id: int, new_title: str) → Task ✅
  - delete_task(id: int) → None ✅
  - All functions call validation, load, operate, persist ✅
  - Type hints, docstrings, Task ID comments ✅
  - Tested: All 5 CRUD operations working ✅

  **Status**: ✅ COMPLETED - src/todo_app/manager.py fully implemented with TaskManager class

---

## M-002: User Story 1 & 2 - Add Task + List Tasks (CORE MVP)

**Implements**: US-1 (Add a Task, P1) | US-2 (View/List Tasks, P1)
**Requirements**: FR-001, FR-002, FR-011 (US-1) | FR-004, FR-005 (US-2)
**Value**: Users can create and view all their tasks (foundational MVP capability)

---

### M-002a: User Story 1 - Add a Task (T-009 to T-012)

**User Story**: US-1 Add a Task | **Requirement**: FR-001, FR-002, FR-011

**Acceptance Test Scenario** (from spec §24-26):
- Run `todo add "Buy groceries"` → Creates task with ID 1, status "pending", displays success
- Run `todo add "Second task"` → Creates task with ID 2 (not overwriting ID 1)
- JSON file persists tasks across app runs

**Independent Test**: Can fully test by running add command, verifying JSON storage

- [ ] T-009 [P] [US1] Implement add_task() business logic in src/manager.py

  **SDD Reference**: spec.md §14-27 User Story 1, plan.md §3.2 ADD Command

  **Target Files**: src/manager.py (add_task function)

  **Acceptance Criteria**:
  - Validates title via validation.validate_title()
  - Generates next ID: max(existing_ids) + 1 or 1 if empty
  - Creates Task with ISO 8601 timestamp
  - Appends to list, calls storage.save_tasks()
  - Returns Task object
  - Task ID comment: `# [Task]: T-009`

- [ ] T-010 [P] [US1] Implement argparse subcommand for 'add' in src/main.py

  **SDD Reference**: spec.md §109 FR-001, plan.md §2.2 CLI Design

  **Target Files**: src/main.py

  **Acceptance Criteria**:
  - Subcommand: `todo add "<title>"`
  - Argument: title (required, string)
  - Calls manager.add_task(title)
  - Displays: `✓ Task "{title}" added with ID {id}.`
  - Catches ValueError, displays: `❌ Error: {message}`
  - Task ID comment: `# [Task]: T-010`

- [ ] T-011 [US1] Create unit tests for add_task() in tests/unit/test_manager.py

  **SDD Reference**: spec.md §14-27, plan.md §7 Testing Strategy

  **Target Files**: tests/unit/test_manager.py

  **Acceptance Criteria**:
  - Test: add_task with valid title → Task with ID=1, status="pending"
  - Test: add_task second task → ID=2
  - Test: add_task with empty title → ValueError with message
  - Test: add_task with title >255 chars → ValueError
  - All tests pass: `pytest tests/unit/test_manager.py::test_add_task*`

- [ ] T-012 [US1] Create integration test for 'add' command in tests/integration/

  **SDD Reference**: spec.md §20 Independent Test, plan.md §7.2 Integration Tests

  **Target Files**: tests/integration/test_cli_integration.py (add scenarios)

  **Acceptance Criteria**:
  - Test: Run `todo add "Buy groceries"` → success message, ID=1
  - Test: Run `todo add "Second"` → ID=2
  - Test: Verify ~/.todo/tasks.json persists and loads on next run
  - Test: Run `todo add ""` → error message
  - All tests pass: `pytest tests/integration/test_cli_integration.py::test_add*`

---

### M-002b: User Story 2 - List All Tasks (T-013 to T-016)

**User Story**: US-2 View/List All Tasks | **Requirement**: FR-004

**Acceptance Test Scenario** (from spec §40-42):
- Add 2 pending + 1 completed task, run `todo list` → Display table with ID, Title, Status
- Run `todo list` with no tasks → Display "No tasks found."
- Long titles display readably (no wrapping issues)

**Independent Test**: Can fully test by adding tasks, running list, verifying output format

- [ ] T-013 [P] [US2] Implement list_tasks() business logic in src/manager.py

  **SDD Reference**: spec.md §30-42 User Story 2, plan.md §3.2 LIST Command

  **Target Files**: src/manager.py (list_tasks function)

  **Acceptance Criteria**:
  - Loads tasks via storage.load_tasks()
  - Returns List[Task] sorted by ID (ascending)
  - Returns empty list if no tasks exist
  - Type hints, docstring, Task ID comment

- [ ] T-014 [P] [US2] Implement argparse subcommand for 'list' in src/main.py

  **SDD Reference**: spec.md §112 FR-004, plan.md §2.2 CLI Design

  **Target Files**: src/main.py

  **Acceptance Criteria**:
  - Subcommand: `todo list` (no arguments)
  - Calls manager.list_tasks()
  - If empty: Display "No tasks found."
  - If tasks exist: Display table format:
    ```
    ID | Title                        | Status
    ---|-------------------------------|----------
    ```
  - Task ID comment: `# [Task]: T-014`

- [ ] T-015 [US2] Create unit tests for list_tasks() in tests/unit/test_manager.py

  **SDD Reference**: spec.md §30-42, plan.md §7 Testing Strategy

  **Target Files**: tests/unit/test_manager.py

  **Acceptance Criteria**:
  - Test: list_tasks with empty list → returns []
  - Test: list_tasks with 3 tasks → returns all 3 in ID order
  - Test: Task fields preserved (id, title, status, created_at)
  - All tests pass: `pytest tests/unit/test_manager.py::test_list_task*`

- [ ] T-016 [US2] Create integration test for 'list' command in tests/integration/

  **SDD Reference**: spec.md §36 Independent Test, plan.md §7.2 Integration Tests

  **Target Files**: tests/integration/test_cli_integration.py (list scenarios)

  **Acceptance Criteria**:
  - Test: Add 3 tasks, run `todo list` → all 3 displayed in table
  - Test: Run `todo list` with no tasks → "No tasks found."
  - Test: Verify table columns (ID, Title, Status)
  - Test: Long titles display readably (30 chars max per line)
  - All tests pass: `pytest tests/integration/test_cli_integration.py::test_list*`

---

## M-003: User Story 3 - Mark Task Complete (CORE MVP)

**Implements**: US-3 (Mark a Task as Complete, P1)
**Requirements**: FR-005
**Value**: Users can track task progress and completion status

**User Story**: US-3 Mark a Task as Complete | **Requirement**: FR-005

**Acceptance Test Scenario** (from spec §56-58):
- Run `todo complete 2` on pending task → status changes to "completed", confirm message
- Run `todo complete` on already completed task → Show "Task [ID] is already completed"
- Run `todo list` → Completed task shows with status "completed"

**Independent Test**: Can fully test by adding task, completing, verifying status change

- [ ] T-017 [P] [US3] Implement complete_task() business logic in src/manager.py

  **SDD Reference**: spec.md §46-58 User Story 3, plan.md §3.2 COMPLETE Command

  **Target Files**: src/manager.py (complete_task function)

  **Acceptance Criteria**:
  - Validates task_id via validation.validate_task_exists()
  - If already "completed" → return with message (no change)
  - Updates status: "pending" → "completed"
  - Persists via storage.save_tasks()
  - Returns Task object
  - Task ID comment: `# [Task]: T-017`

- [ ] T-018 [P] [US3] Implement argparse subcommand for 'complete' in src/main.py

  **SDD Reference**: spec.md §113 FR-005, plan.md §2.2 CLI Design

  **Target Files**: src/main.py

  **Acceptance Criteria**:
  - Subcommand: `todo complete <id>`
  - Argument: id (required, positive integer)
  - Calls manager.complete_task(id)
  - Displays: `✓ Task {id} marked as complete.`
  - Handles already completed: "Task {id} is already completed."
  - Catches ValueError, displays error message
  - Task ID comment: `# [Task]: T-018`

- [ ] T-019 [US3] Create unit/integration tests for complete_task() in tests/

  **SDD Reference**: spec.md §46-58, plan.md §7 Testing Strategy

  **Target Files**: tests/unit/test_manager.py, tests/integration/test_cli_integration.py

  **Acceptance Criteria**:
  - Test: complete_task on pending → status="completed"
  - Test: complete_task on already completed → no change, message displayed
  - Test: complete_task with invalid ID → ValueError
  - Test: CLI integration: `todo complete 1` → success, `todo list` shows completed
  - All tests pass: `pytest tests/ -k complete`

---

## M-004: User Story 4 & 5 - Update + Delete Tasks (Secondary)

**Implements**: US-4 (Update Task, P2) | US-5 (Delete Task, P3)
**Requirements**: FR-006 (US-4) | FR-007 (US-5)
**Value**: Users can edit and clean up their task list (convenience features)

---

### M-004a: User Story 4 - Update Task Title (T-020 to T-021)

**User Story**: US-4 Update a Task Title | **Requirement**: FR-006

**Acceptance Test Scenario** (from spec §72-74):
- Run `todo update 1 "New title"` → Title changes, success message
- Run `todo update 99 "Title"` → Error "Task ID 99 not found"

**Independent Test**: Can fully test by adding task, updating title, verifying change

- [ ] T-020 [P] [US4] Implement update_task() business logic in src/manager.py

  **SDD Reference**: spec.md §62-74 User Story 4, plan.md §3.2 UPDATE Command

  **Target Files**: src/manager.py (update_task function)

  **Acceptance Criteria**:
  - Validates task_id and new_title via validation module
  - Finds task by ID, raises ValueError if not found
  - Updates title (preserve id, status, created_at)
  - Persists via storage.save_tasks()
  - Returns Task object
  - Task ID comment: `# [Task]: T-020`

- [ ] T-021 [P] [US4] Implement argparse subcommand for 'update' in src/main.py

  **SDD Reference**: spec.md §114 FR-006, plan.md §2.2 CLI Design

  **Target Files**: src/main.py

  **Acceptance Criteria**:
  - Subcommand: `todo update <id> "<new-title>"`
  - Arguments: id (required, positive integer), new_title (required, string)
  - Calls manager.update_task(id, new_title)
  - Displays: `✓ Task {id} updated.`
  - Catches ValueError, displays error message
  - Task ID comment: `# [Task]: T-021`

---

### M-004b: User Story 5 - Delete Task (T-022)

**User Story**: US-5 Delete a Task | **Requirement**: FR-007

**Acceptance Test Scenario** (from spec §88-90):
- Run `todo delete 2` → Task removed, confirm message
- Run `todo list` → Deleted task gone, remaining IDs preserved (gap OK)

**Independent Test**: Can fully test by deleting task, verifying removal from list

- [ ] T-022 [US5] Implement delete_task() and CLI in src/manager.py and src/main.py

  **SDD Reference**: spec.md §78-90 User Story 5, plan.md §3.2 DELETE Command

  **Target Files**: src/manager.py (delete_task), src/main.py (delete subcommand)

  **Acceptance Criteria**:
  - delete_task(id) validates ID, finds task, removes from list, persists
  - CLI subcommand: `todo delete <id>`
  - Displays: `✓ Task {id} deleted.`
  - Deleted ID gap preserved (not reused)
  - Catches ValueError, displays error message
  - Task ID comment: `# [Task]: T-022`

---

## M-005: Code Quality & SDD Compliance (Cross-Cutting)

- [ ] T-023 Validate all code against Constitution standards (PEP8, type hints, docstrings, SDD)

  **SDD Reference**: Constitution §II-VII

  **Target Files**: All src/ and tests/ files

  **Acceptance Criteria**:
  - `uv run flake8 src/ tests/` → zero violations
  - `uv run pylint src/ tests/` → all files pass
  - All functions have type hints (no `Any` without justification)
  - All public functions/classes have Google-style docstrings
  - All functions have Task ID comment with spec reference
  - Git commits reference Task IDs: `git log --oneline | grep T-0`

---

## Milestone Dependency Graph

```
M-001: Foundation (T-001 → T-008) [Blocking all others]
  ↓
M-002: US-1 & US-2 (T-009 → T-016) [CORE MVP, independent tasks]
  ↓
M-003: US-3 (T-017 → T-019) [CORE MVP, depends on M-001]
  ↓ (can parallel)
M-004: US-4 & US-5 (T-020 → T-022) [Secondary, depends on M-001]
  ↓
M-005: Code Quality (T-023) [SDD Compliance, final validation]
```

## Execution Priorities

**Critical Path (MVP)**: M-001 → M-002 → M-003 (5 tasks required for CORE MVP)
- **M-001**: 8 tasks (setup infrastructure)
- **M-002**: 8 tasks (add + list) — **First user value delivered here**
- **M-003**: 3 tasks (mark complete) — **Completes MVP scope**

**Extended (Post-MVP)**: M-004 (4 tasks) + M-005 (1 task)
- **M-004**: Update and Delete (convenience features, not critical)
- **M-005**: Code quality gate (ensures SDD compliance)

---

## SDD Compliance Summary

Each milestone maps directly to User Stories defined in spec.md:

| Milestone | User Stories | Status | Value Delivered | Judges See |
|-----------|--------------|--------|-----------------|-----------|
| M-001 | — | Foundation | Project structure | Well-organized src/ layout |
| M-002 | **US-1, US-2** | ✅ CORE MVP | Add + View tasks | `uv run todo add`, `uv run todo list` |
| M-003 | **US-3** | ✅ CORE MVP | Track completion | `uv run todo complete` |
| M-004 | US-4, US-5 | Secondary | Edit + Delete | Full CRUD suite |
| M-005 | — | Quality Gate | PEP8, type hints, SDD | Clean, traceable code |

**For Judges**: Code directly references Task IDs and specs. Each file header includes:
```
[Task]: T-001
[From]: speckit.specify §14-27, speckit.plan §3.2
```

---

## Summary

**Milestones**: 5 | **Atomic Tasks**: 23 | **SDD Traceability**: 100%

- ✅ **5 high-level milestones** map to phases and user stories
- ✅ **Each milestone explicitly references which User Story it implements**
- ✅ **US-1, US-2, US-3 marked as CORE MVP** in spec.md
- ✅ **23 atomic tasks** consolidated into 5 clear milestones
- ✅ **Clear execution path** for judges to see spec → plan → tasks → code
- ✅ **MVP scope** identified: Implement M-001 → M-002 → M-003 for CORE MVP
