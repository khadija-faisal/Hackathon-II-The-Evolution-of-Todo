# Quick Start - Developer Guide

**Date**: 2026-01-08 | **Feature**: 001-cli-foundation | **Status**: Ready for Implementation

---

## Milestone Implementation Order

**CORE MVP** (M-001 → M-002 → M-003, 19 tasks):
1. **M-001**: Foundation (8 tasks) — Project structure, modules
2. **M-002**: US-1 & US-2 (8 tasks) — Add task + List tasks ← **First user value here**
3. **M-003**: US-3 (3 tasks) — Mark task complete ← **MVP complete**

**Post-MVP** (M-004 → M-005, 4 tasks):
4. **M-004**: US-4 & US-5 (4 tasks) — Update + Delete (nice-to-have)
5. **M-005**: Code Quality (1 task) — PEP8, type hints, SDD validation

**All User Stories**:
- **US-1**: Add a Task (P1) **[CORE MVP]**
- **US-2**: View/List All Tasks (P1) **[CORE MVP]**
- **US-3**: Mark a Task as Complete (P2) **[CORE MVP]**
- **US-4**: Update a Task Title (P2)
- **US-5**: Delete a Task (P3)

---

## Project Setup

```bash
# Navigate to project root
cd /home/khadija/hackthon2/phase1

# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create Python virtual environment (uv handles this)
uv venv

# Install dependencies (stdlib only, no external deps)
uv pip install -e .
```

---

## File Structure

```
src/
├── __init__.py              # Package init
├── main.py                  # CLI entry point, argparse routing
├── models.py                # Task dataclass
├── manager.py               # CRUD operations (add, list, complete, update, delete)
├── storage.py               # JSON I/O, file handling
└── validation.py            # Input validation

tests/
├── unit/
│   ├── test_models.py       # Task dataclass tests
│   ├── test_manager.py      # CRUD logic tests
│   ├── test_storage.py      # JSON persistence tests
│   └── test_validation.py   # Validation rules tests
└── integration/
    └── test_cli_integration.py  # End-to-end CLI tests
```

---

## Running Commands

### Add Task
```bash
uv run todo add "Buy groceries"
# Output: ✓ Task "Buy groceries" added with ID 1.
```

### List Tasks
```bash
uv run todo list
# Output:
# ID | Title            | Status
# ---|------------------|----------
# 1  | Buy groceries    | pending
# 2  | Review spec      | completed
```

### Mark Complete
```bash
uv run todo complete 1
# Output: ✓ Task 1 marked as complete.
```

### Update Task
```bash
uv run todo update 1 "Buy groceries and bread"
# Output: ✓ Task 1 updated.
```

### Delete Task
```bash
uv run todo delete 1
# Output: ✓ Task 1 deleted.
```

---

## Key Implementation Points

### Module Responsibilities

**main.py**:
- argparse subcommand routing (add, list, complete, update, delete)
- Error handling (try-catch ValueError, display error messages)
- Output formatting

**models.py**:
- Task dataclass with id, title, status, created_at
- to_dict() / from_dict() for JSON serialization

**manager.py**:
- add_task(title) → Task
- list_tasks() → List[Task]
- complete_task(id) → Task
- update_task(id, new_title) → Task
- delete_task(id) → None

**storage.py**:
- load_tasks() → List[Task] (auto-create dir, handle corruption)
- save_tasks(tasks) → None (atomic write via temp file + rename)

**validation.py**:
- validate_title(title) → None (raises ValueError)
- validate_task_id(id) → None (raises ValueError)
- validate_task_exists(tasks, id) → Task (raises ValueError)

### Error Handling Pattern

```python
try:
    # Execute command
except ValueError as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
```

### SDD Requirement - Every Function Must Reference Tasks

**Header Comment (required)**:
Each file starts with the tasks it implements:
```python
# src/manager.py
# [Task]: T-008, T-009, T-013, T-017, T-020, T-022
# [From]: speckit.specify §14-27 (US-1,US-2,US-3,US-4,US-5), speckit.plan §4.2
```

**Function Comment (required)**:
Each public function includes:
```python
# [Task]: T-009
# [From]: spec.md §14-27, plan.md §3.2
# Implements: M-002 (US-1 Add Task)
def add_task(title: str) -> Task:
    """Create a new task with the given title."""
    pass
```

**Why**: Judges can trace any line of code back to its spec requirement. Provides 100% traceability.

---

## Code Quality Checklist

- ✅ PEP8: 100-char lines, 4-space indent, zero linting violations
- ✅ Type Hints: All function signatures typed (no `Any` without justification)
- ✅ Docstrings: Google-style on all public functions/classes
- ✅ SDD: Task ID comments in all code
- ✅ Error Messages: User-friendly, actionable

## Testing Commands

```bash
# Run unit tests
uv run pytest tests/unit/

# Run integration tests
uv run pytest tests/integration/

# Run all tests
uv run pytest

# Linting
uv run flake8 src/
uv run pylint src/
```

---

## Data Storage

**Location**: `~/.todo/tasks.json`

**Format**: JSON array of Task objects

**Example**:
```json
[
  {"id": 1, "title": "Buy groceries", "status": "pending", "created_at": "2026-01-08T14:30:00Z"}
]
```

**Recovery**: If corrupted, backup to `~/.todo/tasks.json.bak`, reinit with empty array.

---

## Key Design Decisions

1. **Two-State Status**: "pending" or "completed" (no intermediate states)
2. **ID Gaps**: Deleted IDs create gaps, never reused (simplifies logic)
3. **Atomic Writes**: Temp file → rename prevents partial updates
4. **No External Deps**: Pure Python stdlib (Constitution §V)
5. **SDD Traceability**: All code references Task IDs
