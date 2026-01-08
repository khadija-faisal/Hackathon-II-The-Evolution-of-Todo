# Data Model - CLI Foundation

**Date**: 2026-01-08 | **Status**: Complete
**Task ID**: T-005 | **Milestone**: M-001 (Foundation & Setup)
**From**: spec.md §122-124, plan.md §3 Data Model

---

## Entity: Task

### Fields

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | int | Auto-incremented from 1, unique, never reused |
| `title` | str | Non-empty, max 255 characters |
| `status` | str | "pending" or "completed" |
| `created_at` | str | ISO 8601 UTC timestamp (assigned at creation, immutable) |

### Dataclass Definition

```python
@dataclass
class Task:
    id: int
    title: str
    status: str
    created_at: str
```

---

## JSON Schema

**Storage Location**: `~/.todo/tasks.json`

**Format**: Array of Task objects

```json
[
  {"id": 1, "title": "Buy groceries", "status": "pending", "created_at": "2026-01-08T14:30:00Z"},
  {"id": 2, "title": "Review spec", "status": "completed", "created_at": "2026-01-08T15:00:00Z"}
]
```

**Empty State**: `[]`

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| title | Non-empty, ≤255 chars | "Task title cannot be empty" or "Task title must be 255 characters or fewer" |
| id | Positive integer, exists in list | "Task ID must be a positive number" or "Task ID 99 not found. Use 'todo list' to see available tasks" |
| status | "pending" or "completed" | Invalid status (internal validation only) |

---

## State Transitions

**Creation**: status always "pending" (auto-assigned)

**Completion**: status "pending" → "completed" (id, title, created_at unchanged)

**Update**: title modified, id/status/created_at preserved

**Deletion**: Task removed from array, ID gaps preserved (not reused per spec §159)

---

## Data Integrity

- **Uniqueness**: id must be unique within tasks.json
- **Atomic Writes**: Temp file + atomic rename prevents partial updates
- **Corruption Recovery**: Backup corrupted file to .bak, reinit with empty array
- **Auto-Create**: Missing ~/.todo/ directory created on first run

---

## Serialization

- **to_dict()**: Task object → JSON-compatible dictionary
- **from_dict()**: JSON dictionary → Task object
