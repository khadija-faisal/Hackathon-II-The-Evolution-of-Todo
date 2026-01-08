<!--
=============================================================================
SYNC IMPACT REPORT
=============================================================================
Version Change: 1.1.0 → 2.0.0
Rationale: MAJOR bump - simplified constitution for Python Todo Console App.
  Removed multi-phase roadmap, consolidated to core 7 principles essential for
  delivery: Python 3.x, PEP8, type hints, docstrings, local JSON storage,
  robust error handling with clear user feedback, and SDD enforcement.

Modified Principles:
  - Consolidated multi-phase guidance into focused set of 7 core principles
  - Emphasized PEP8, type hints, clean docstrings as mandatory standards
  - Added Error Handling as dedicated principle with user-facing feedback
  - Enforced SDD rule: no code without Task ID and spec reference
  - Clarified local JSON storage-only approach
  - Technology Stack constraints clearly defined
  - Development Workflow and Governance rules for SDD traceability

Removed Sections:
  - Future phase roadmap (Phases II-V deferred)
  - Complex phase-based workflows
  - Scope guards for future phases

Templates Requiring Updates:
  ✅ All templates remain compatible with simplified constitution

Follow-up TODOs:
  - None - all content fully specified and focused on project delivery
=============================================================================
-->

# Python Todo Console App - Constitution

**Version**: 2.0.0 | **Ratified**: 2026-01-04 | **Last Amended**: 2026-01-07

## Core Principles

### I. Python 3.x Only

All code MUST be written in Python 3.x.

- Use Python 3.9 or higher
- Minimize external dependencies; prefer Python standard library
- Single language, single version constraint for consistency

---

### II. PEP8 Standards Mandatory

All Python code MUST follow PEP8 style guide with zero violations.

- Line length: 100 characters max
- Indentation: 4 spaces
- Use linting tools: pylint or flake8
- All PRs must pass linting before merge

---

### III. Type Hints Required

All function signatures MUST include type hints for parameters and return values.

**Example**:
```python
def add_task(title: str) -> Task:
    """Add a new task."""
    pass
```

- No `typing.Any` without justification
- Use built-in types and standard typing module

---

### IV. Clean Docstrings

All public functions and classes MUST have docstrings (Google style).

**Example**:
```python
def complete_task(task_id: int) -> None:
    """Mark a task as complete.

    Args:
        task_id: The ID of the task to complete.

    Raises:
        ValueError: If task_id does not exist.
    """
    pass
```

---

### V. Local File Storage Only

Data persistence MUST use local JSON files only. No external databases.

- Storage format: JSON
- Storage location: local filesystem (e.g., `~/.todo/tasks.json`)
- Single file approach: `tasks.json` containing array of task objects
- No SQLite, PostgreSQL, MongoDB, or any database
- Graceful handling of missing files (auto-create on first run)

---

### VI. Error Handling - Robust Validation & Clear User Feedback

All user input MUST be validated with clear error messages. All operations MUST fail gracefully.

**Validation Rules**:
- Task title: non-empty, max 255 characters
- Task ID: positive integer, must exist before update/delete
- All input from user must be sanitized and validated before processing

**Error Handling Rules**:
- All file I/O errors MUST be caught and reported with clear message (not silent failure)
- JSON parse errors MUST offer recovery (backup + recreate from scratch)
- Missing storage directory MUST auto-create on first run
- All errors MUST provide actionable feedback to user

**User Feedback Examples**:
```
❌ Error: Task title cannot be empty. Please provide a title.
❌ Error: Task ID 5 not found. Use 'todo list' to see available tasks.
✓ Success: Task "Buy milk" added with ID 1.
✓ Success: Task marked as complete.
```

---

### VII. Spec-Driven Development (SDD) - Non-Negotiable

Every code change MUST be traceable to specification, plan, and task.

**Rules**:
1. Before writing any code:
   - Feature MUST be defined in `speckit.specify` (WHAT)
   - Implementation approach MUST be in `speckit.plan` (HOW)
   - Atomic task MUST be in `speckit.tasks` with Task ID

2. During implementation:
   - Every function/class MUST have a Task ID comment:
     ```python
     # [Task]: T-001
     # [From]: speckit.specify §1.2, speckit.plan §2.3
     def add_task(title: str) -> Task:
         pass
     ```
   - Git commits MUST reference Task ID: `git commit -m "feat(T-001): add task creation"`

3. Code Review Checklist:
   - ✅ Does this code have a Task ID comment?
   - ✅ Does the Task ID exist in `speckit.tasks`?
   - ✅ Does the task reference `speckit.specify` and `speckit.plan`?

**Hard Rule**: No Task ID in code = Code will be rejected.

---

## Technology Stack

- **Language**: Python 3.9+
- **CLI Framework**: argparse (stdlib) or minimal approved alternative
- **Storage**: JSON files (local filesystem only)
- **Code Quality**: PEP8, type hints, docstrings
- **Linting**: pylint or flake8 (zero warnings required)
- **Testing**: pytest (optional)

---

## Development Workflow

1. Feature defined in `speckit.specify`
2. Implementation approach documented in `speckit.plan`
3. Atomic tasks created in `speckit.tasks` with Task IDs
4. Code written with Task ID comments and SDD references
5. All PRs verified for spec traceability
6. Code merged only after passing linting and spec review

---

## Governance

- **Constitution Supersedes**: All other guidance
- **Amendments**: Require ADR (Architecture Decision Record) and team approval
- **Compliance**: Every PR must verify SDD traceability, code quality, and spec alignment
- **Runtime Guide**: Follow `AGENTS.md` for development workflow

---

**This constitution is the single source of truth for this project.**
