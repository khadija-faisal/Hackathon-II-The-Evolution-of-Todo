# Feature Specification: CLI Foundation - Python Todo Console App

**Feature Branch**: `001-cli-foundation`
**Created**: 2026-01-08
**Status**: Draft
**Version**: 1.0.0
**Manager**: uv
**Input**: Python Todo Console App with CLI foundation, core features: Add, View/List, Update, Delete, Mark Complete using uv for environment management and local JSON storage.

---

## User Scenarios & Testing

### User Story 1 - Add a Task (Priority: P1) **[CORE MVP]**

As a user, I want to create a new task with a title so that I can keep track of things I need to do.

**Why this priority**: Creating tasks is the foundational capability. Without the ability to add tasks, the app has no purpose. This is the first and most critical user action.

**Independent Test**: Can be fully tested by running a single `add` command, storing the task to JSON, and verifying it persists. Delivers core value immediately.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** I run `todo add "Buy groceries"`, **Then** the system creates a task with title "Buy groceries", assigns it a unique ID, sets status to "pending", and displays a success message.
2. **Given** no tasks exist, **When** I add a task, **Then** it is stored in `~/.todo/tasks.json` and can be retrieved on the next app run.
3. **Given** I have already added 3 tasks, **When** I add a 4th task, **Then** it receives ID 4 and does not overwrite existing tasks.

---

### User Story 2 - View/List All Tasks (Priority: P1) **[CORE MVP]**

As a user, I want to see all my tasks in a clean, readable format so that I can review what I need to do.

**Why this priority**: Without the ability to view tasks, the app cannot demonstrate its value. Listing tasks is equally foundational as adding them. Users need immediate feedback that their tasks are stored.

**Independent Test**: Can be fully tested by adding 2-3 tasks, running `list`, and verifying a formatted table displays all tasks with ID, title, and status. Delivers immediate value.

**Acceptance Scenarios**:

1. **Given** I have 2 pending tasks and 1 completed task, **When** I run `todo list`, **Then** all 3 tasks are displayed in a clean table format with columns for ID, Title, and Status.
2. **Given** no tasks exist, **When** I run `todo list`, **Then** the system displays a message "No tasks found" instead of an empty table.
3. **Given** I have tasks with long titles, **When** I run `todo list`, **Then** the output is formatted readably (no wrapping issues, titles truncated or wrapped appropriately).

---

### User Story 3 - Mark a Task as Complete (Priority: P2) **[CORE MVP]**

As a user, I want to mark a task as completed so that I can track my progress and see what I've accomplished.

**Why this priority**: Task completion is a core feature that provides user satisfaction and progress tracking. However, it's secondary to the ability to add and view tasks. Users must see value from the basic list/add cycle first.

**Independent Test**: Can be fully tested by adding a task, marking it complete via `todo complete 1`, running `list`, and verifying the status changed to "completed". Demonstrates task state management.

**Acceptance Scenarios**:

1. **Given** I have a pending task with ID 2, **When** I run `todo complete 2`, **Then** the task status changes to "completed" and the system confirms "Task 2 marked as complete".
2. **Given** a task is already completed, **When** I run `todo complete` on it again, **Then** the system shows a message "Task [ID] is already completed".
3. **Given** I mark a task complete, **When** I run `todo list`, **Then** the completed task is displayed with status "completed".

---

### User Story 4 - Update a Task Title (Priority: P2)

As a user, I want to modify a task's title so that I can correct mistakes or change my mind about what I need to do.

**Why this priority**: Editing tasks is a convenience feature that reduces friction but is not strictly required for basic functionality. Users can delete and re-add, but updating is preferable.

**Independent Test**: Can be fully tested by adding a task, running `todo update 1 "New title"`, and verifying the task title changed in the list output.

**Acceptance Scenarios**:

1. **Given** I have a task with ID 1 and title "Buy milk", **When** I run `todo update 1 "Buy milk and bread"`, **Then** the task title is updated and a success message confirms "Task 1 updated".
2. **Given** I attempt to update a task that doesn't exist, **When** I run `todo update 99 "New title"`, **Then** the system displays an error "Task ID 99 not found. Use 'todo list' to see available tasks".
3. **Given** I have a task with a long title, **When** I update it to a new long title, **Then** the new title is stored and displays correctly in the list.

---

### User Story 5 - Delete a Task (Priority: P3)

As a user, I want to permanently remove a task so that my task list doesn't become cluttered with old or unwanted tasks.

**Why this priority**: Deletion is a cleanup feature that enhances experience but is the least critical. Users can work around it by ignoring tasks. Implemented last after core functionality is stable.

**Independent Test**: Can be fully tested by adding a task, running `todo delete 1`, verifying it no longer appears in the list, and confirming JSON file is updated.

**Acceptance Scenarios**:

1. **Given** I have 3 tasks, **When** I run `todo delete 2`, **Then** task with ID 2 is removed and the system confirms "Task 2 deleted".
2. **Given** I attempt to delete a task that doesn't exist, **When** I run `todo delete 99`, **Then** the system displays an error "Task ID 99 not found".
3. **Given** I delete a task, **When** I run `todo list`, **Then** the deleted task no longer appears and remaining task IDs are preserved (no re-numbering).

---

### Edge Cases

- What happens when a user provides an empty title to `add`? → Display error: "Task title cannot be empty"
- What happens when the `~/.todo/` directory doesn't exist? → System creates it automatically on first run
- What happens when `tasks.json` is corrupted or invalid JSON? → System logs a warning, backs up the corrupted file, and initializes a fresh task list
- What happens when a user provides a task ID that is not a positive integer? → Display error: "Task ID must be a positive number"
- What happens when a user provides a title longer than 255 characters? → Display error: "Task title must be 255 characters or fewer"
- What happens when concurrent operations attempt to modify `tasks.json`? → Atomic writes ensure file consistency (single operation per command)

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow users to create a new task via `uv run todo add "<title>"` with a unique auto-incremented ID and "pending" status.
- **FR-002**: System MUST validate that task titles are non-empty and max 255 characters, rejecting invalid input with clear error messages.
- **FR-003**: System MUST persist all tasks to `~/.todo/tasks.json` using Python's standard library JSON module after each operation.
- **FR-004**: System MUST display all tasks in a formatted table via `uv run todo list` with columns for ID, Title, and Status.
- **FR-005**: System MUST allow users to mark a task as completed via `uv run todo complete <id>`, changing its status from "pending" to "completed".
- **FR-006**: System MUST allow users to update a task's title via `uv run todo update <id> "<new-title>"` while preserving ID and status.
- **FR-007**: System MUST allow users to delete a task via `uv run todo delete <id>`, removing it from storage and list.
- **FR-008**: System MUST auto-create the `~/.todo/` directory and `tasks.json` file on first run if they don't exist.
- **FR-009**: System MUST handle missing or corrupted `tasks.json` gracefully by creating a backup and initializing a fresh task list.
- **FR-010**: System MUST validate task IDs as positive integers and reject invalid IDs with clear error messages.
- **FR-011**: System MUST generate unique, auto-incremented IDs starting from 1 for new tasks.
- **FR-012**: System MUST use atomic JSON writes to ensure data consistency and prevent partial updates.

### Key Entities

- **Task**: Represents a single todo item with attributes: `id` (unique integer, auto-incremented), `title` (string, 1-255 characters), `status` (enum: "pending" or "completed"), `created_at` (ISO 8601 timestamp).

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can add, list, complete, update, and delete tasks via command-line interface executed through `uv run`.
- **SC-002**: Zero-dependency execution via uv - app runs without requiring system-level package installation or external services.
- **SC-003**: All data modifications result in atomic JSON updates with no partial writes or data loss.
- **SC-004**: Users receive clear, actionable error messages for all validation failures (empty title, missing ID, invalid input format).
- **SC-005**: Task list displays in a clean, human-readable table format with consistent alignment and no truncation of content.
- **SC-006**: System maintains backward compatibility - tasks created in version 1.0 remain readable in future versions.
- **SC-007**: All code adheres to PEP8 standards, includes type hints on all functions, and passes pylint/flake8 with zero warnings.
- **SC-008**: Success messages confirm operations (e.g., "✓ Task 1 added", "✓ Task 2 marked as complete") for user feedback.

---

## Constraints & Assumptions

### Constraints (from Constitution)

- **Technology**: Python 3.9+ only (Principle I)
- **Code Quality**: PEP8 mandatory, type hints required, docstrings required (Principles II, III, IV)
- **Storage**: Local JSON files only, no databases (Principle V)
- **Error Handling**: Robust validation, clear user feedback (Principle VI)
- **Development**: Spec-Driven Development mandatory - all code traceable to Task IDs (Principle VII)

### Assumptions

1. Users have Python 3.9+ and uv installed on their system.
2. Users are operating on a POSIX-compatible system with a home directory (`~/.todo/`).
3. Single-user CLI application - no multi-user access control or concurrent editing constraints.
4. JSON file format is sufficient for Phase I - no need for database optimization.
5. Task IDs are never reused after deletion (gap in numbering is acceptable).
6. "Pending" and "completed" are the only two valid task statuses in Phase I.
7. No undo/redo functionality needed.
8. No task categories, tags, or filtering by status in Phase I (basic listing only).

---

## Next Steps

Once this specification is approved:
1. Execute `/sp.clarify` to resolve any ambiguities
2. Execute `/sp.plan` to design the implementation approach (CLI structure, modules, data flow)
3. Execute `/sp.tasks` to break the plan into atomic, testable task IDs
4. Begin implementation with Task ID references and SDD traceability

