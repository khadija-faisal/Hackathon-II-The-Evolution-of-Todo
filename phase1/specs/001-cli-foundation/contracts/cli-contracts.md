# CLI Contracts - Command Signatures & Behavior

**Date**: 2026-01-08 | **Feature**: 001-cli-foundation

---

## Command Interface

### ADD Command

**Signature**:
```
todo add "<title>"
```

**Args**:
- `<title>`: Task title (required, string, 1-255 characters)

**Returns**: Success message with task ID and title

**Exit Code**: 0 (success), 1 (error)

**Success**: `✓ Task "{title}" added with ID {id}.`

**Errors**:
- Empty title: `❌ Error: Task title cannot be empty.`
- Title > 255 chars: `❌ Error: Task title must be 255 characters or fewer.`

**User Story**: US-1 | **Requirement**: FR-001, FR-002, FR-011

---

### LIST Command

**Signature**:
```
todo list
```

**Args**: None

**Returns**: Formatted table or "No tasks found." message

**Exit Code**: 0 (always succeeds)

**Output Format**:
```
ID | Title                        | Status
---|-------------------------------|----------
1  | Buy groceries                | pending
2  | Review spec                  | completed
3  | Call customer                | pending
```

**Empty List**: `No tasks found.`

**User Story**: US-2 | **Requirement**: FR-004

---

### COMPLETE Command

**Signature**:
```
todo complete <id>
```

**Args**:
- `<id>`: Task ID (required, positive integer)

**Returns**: Success message or error

**Exit Code**: 0 (success), 1 (error)

**Success**: `✓ Task {id} marked as complete.`

**Errors**:
- Invalid ID format: `❌ Error: Task ID must be a positive number.`
- ID not found: `❌ Error: Task ID {id} not found. Use 'todo list' to see available tasks.`
- Already completed: `Task {id} is already completed.`

**User Story**: US-3 | **Requirement**: FR-005

---

### UPDATE Command

**Signature**:
```
todo update <id> "<new-title>"
```

**Args**:
- `<id>`: Task ID (required, positive integer)
- `<new-title>`: New task title (required, string, 1-255 characters)

**Returns**: Success message or error

**Exit Code**: 0 (success), 1 (error)

**Success**: `✓ Task {id} updated.`

**Errors**:
- Invalid ID: `❌ Error: Task ID must be a positive number.`
- ID not found: `❌ Error: Task ID {id} not found. Use 'todo list' to see available tasks.`
- Empty title: `❌ Error: Task title cannot be empty.`
- Title > 255 chars: `❌ Error: Task title must be 255 characters or fewer.`

**User Story**: US-4 | **Requirement**: FR-006

---

### DELETE Command

**Signature**:
```
todo delete <id>
```

**Args**:
- `<id>`: Task ID (required, positive integer)

**Returns**: Success message or error

**Exit Code**: 0 (success), 1 (error)

**Success**: `✓ Task {id} deleted.`

**Errors**:
- Invalid ID: `❌ Error: Task ID must be a positive number.`
- ID not found: `❌ Error: Task ID {id} not found. Use 'todo list' to see available tasks.`

**User Story**: US-5 | **Requirement**: FR-007

---

## JSON Data Contracts

### Input Task (Creation)

```json
{
  "title": "Buy groceries"
}
```

### Output Task (JSON Storage)

```json
{
  "id": 1,
  "title": "Buy groceries",
  "status": "pending",
  "created_at": "2026-01-08T14:30:00Z"
}
```

### Task List

```json
[
  {"id": 1, "title": "Buy groceries", "status": "pending", "created_at": "2026-01-08T14:30:00Z"},
  {"id": 2, "title": "Review spec", "status": "completed", "created_at": "2026-01-08T15:00:00Z"}
]
```

---

## Execution Flow

```
User Input
    ↓
argparse (main.py) → Route to command handler
    ↓
Validate args (validation.py)
    ↓
Load tasks (storage.py)
    ↓
Perform operation (manager.py)
    ↓
Persist (storage.py)
    ↓
Output success message or error
```

---

## Exit Codes

- **0**: Command succeeded
- **1**: Validation error or I/O failure
