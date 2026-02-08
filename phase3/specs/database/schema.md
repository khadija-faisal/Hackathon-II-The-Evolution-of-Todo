# Database Specification: Schema and Models

**Feature Branches**: `001-web-specs` (Phase II) | `002-ai-chatbot-specs` (Phase III)
**Created**: 2026-01-15 (Phase II) | Updated: 2026-02-07 (Phase III)
**Status**: Active (Phase II) + Expanding (Phase III)

## Overview

This specification defines the SQLModel database schema for the Todo App. The database uses Neon PostgreSQL with:
- **Phase II Tables** (RETAINED): `users`, `tasks`
- **Phase III Tables** (NEW): `conversations`, `messages` for chatbot conversation history

All table names are plural and lowercase following conventions. User isolation is enforced through `user_id` foreign key constraints on all tables.

## Database Technology Stack

- **Database**: Neon PostgreSQL (cloud-hosted)
- **ORM**: SQLModel (combines SQLAlchemy + Pydantic)
- **Migrations**: Alembic (managed by FastAPI startup)
- **Connection Pool**: SQLAlchemy connection pooling

## Table: users

**Description**: Stores user account information and authentication credentials

**Purpose**: Single source of truth for user accounts; referenced by tasks table for multi-user isolation

### Schema Definition

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique user identifier; used in JWT user_id claim and tasks.user_id foreign key |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User's email address; must be globally unique; case-insensitive for matching |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hash of user's password; never plaintext; salt included in hash |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | User registration timestamp (UTC) |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last profile update timestamp (UTC); updated when user changes password/email |

### Indexes

- **idx_users_email**: On `email` column for fast login lookups
- **PRIMARY KEY**: On `id` for fast JWT user_id claims

### Constraints

- `id` is globally unique (UUID)
- `email` is globally unique (no two users can have same email)
- All columns NOT NULL (no partial user records)

---

## Table: tasks

**Description**: Stores user's task items with completion status and metadata

**Purpose**: User-specific todo items; scoped to user_id for multi-user isolation

### Schema Definition

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_id_created_at ON tasks(user_id, created_at DESC);
```

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique task identifier; globally unique |
| `user_id` | UUID | NOT NULL, FOREIGN KEY | References users.id; identifies task owner; all queries filtered by this |
| `title` | VARCHAR(255) | NOT NULL | Task title/name; required; non-empty string |
| `description` | TEXT | nullable | Optional task description/notes; can be NULL or empty string |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Task completion status; true = completed, false = incomplete |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Task creation timestamp (UTC) |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last modification timestamp (UTC); updated on every edit |

### Indexes

- **idx_tasks_user_id**: On `user_id` for fast user-specific queries
- **idx_tasks_user_id_created_at**: Composite index on `(user_id, created_at DESC)` for common dashboard query pattern (list tasks for user ordered by created_at)
- **PRIMARY KEY**: On `id` for fast task lookups

### Constraints

- `id` is globally unique (UUID)
- `user_id` is NOT NULL (every task must belong to a user)
- Foreign key `user_id` → `users.id` with ON DELETE CASCADE (deleting a user deletes all their tasks)
- All non-nullable columns have explicit NOT NULL constraints

---

## SQLModel Python Classes

SQLModel classes provide type-safe, Pydantic-integrated data models:

### User Model

```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class User(SQLModel, table=True):
    """User account model"""
    __tablename__ = "users"

    id: Optional[UUID] = Field(
        default=None,
        primary_key=True,
        description="Unique user identifier"
    )
    email: str = Field(
        index=True,
        unique=True,
        description="User's email address"
    )
    password_hash: str = Field(
        description="Bcrypt-hashed password (never plaintext)"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )
```

### Task Model

```python
class Task(SQLModel, table=True):
    """Task/todo item model"""
    __tablename__ = "tasks"

    id: Optional[UUID] = Field(
        default=None,
        primary_key=True,
        description="Unique task identifier"
    )
    user_id: UUID = Field(
        foreign_key="users.id",
        description="Task owner's user_id (FK to users.id)"
    )
    title: str = Field(
        min_length=1,
        max_length=255,
        description="Task title (required, non-empty)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=4000,
        description="Task description (optional)"
    )
    completed: bool = Field(
        default=False,
        description="Task completion status"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Task creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last modification timestamp"
    )
```

---

## Pydantic Response Models

Response models inherit Pydantic validation while excluding sensitive fields:

### UserResponse

```python
class UserResponse(SQLModel):
    """User data for API responses (no password_hash)"""
    id: UUID
    email: str
    created_at: datetime
```

### TaskResponse

```python
class TaskResponse(SQLModel):
    """Task data for API responses"""
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime
```

### TaskCreateRequest

```python
class TaskCreateRequest(SQLModel):
    """Request model for creating tasks"""
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=4000)
```

### TaskUpdateRequest

```python
class TaskUpdateRequest(SQLModel):
    """Request model for updating tasks"""
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=4000)
    completed: Optional[bool] = Field(default=None)
```

---

## Multi-User Isolation Implementation

### Query Pattern: All task operations include user_id filter

**Example: List user's tasks**
```sql
SELECT * FROM tasks
WHERE user_id = :authenticated_user_id
ORDER BY created_at DESC;
```

**Example: Get specific task (with isolation check)**
```sql
SELECT * FROM tasks
WHERE id = :task_id AND user_id = :authenticated_user_id;
```

**Example: Update task (with isolation check)**
```sql
UPDATE tasks
SET title = :title, description = :description, updated_at = CURRENT_TIMESTAMP
WHERE id = :task_id AND user_id = :authenticated_user_id;
```

**Example: Delete task (with isolation check)**
```sql
DELETE FROM tasks
WHERE id = :task_id AND user_id = :authenticated_user_id;
```

### Isolation Guarantees

1. **No Query Bypass**: Every query includes `WHERE user_id = :authenticated_user_id`
2. **No Direct User_ID from Request**: Backend extracts user_id from JWT token claims; request body cannot override it
3. **Foreign Key Enforcement**: Database constraint prevents assigning task to non-existent user
4. **Cascade Delete**: Deleting a user automatically deletes all associated tasks
5. **Index Efficiency**: Composite index `(user_id, created_at DESC)` ensures fast user-scoped queries

---

## Data Types and Constraints

### UUID Fields

- **Type**: PostgreSQL native UUID type
- **Generation**: `gen_random_uuid()` for database-level default
- **Python**: `uuid.UUID` from Python standard library
- **Rationale**: Globally unique across distributed systems; not sequential (privacy); harder to enumerate

### Timestamps (created_at, updated_at)

- **Type**: TIMESTAMP WITH TIME ZONE (stored in UTC)
- **Default**: CURRENT_TIMESTAMP (database sets on insert)
- **Timezone**: Always UTC; frontend converts for display
- **Precision**: Microsecond-level timestamp accuracy

### String Fields

- **email**: VARCHAR(255) with UNIQUE constraint; case-insensitive matching
- **title**: VARCHAR(255); non-empty; required
- **description**: TEXT; nullable; no length limit imposed
- **password_hash**: VARCHAR(255); bcrypt standard hash length

### Boolean Fields

- **completed**: BOOLEAN; defaults to FALSE; no NULL values

---

## Database Lifecycle

### Initialization

On application startup:
1. SQLModel session created with Neon connection string
2. Alembic migration applied (creates tables if not exist)
3. Connection pool initialized with default settings

### Transaction Handling

- **Read Operations**: Implicit transaction; auto-commits
- **Write Operations**: Explicit transaction; rollback on error
- **Concurrency**: PostgreSQL MVCC handles concurrent reads/writes

### Connection Management

- Connection pooling reuses connections
- Max pool size: 10 (default)
- Idle connections recycled after 5 minutes

---

## Indexing Strategy

### Primary Indexes

1. **PRIMARY KEY (users.id)**: Natural index; fast user lookups
2. **UNIQUE (users.email)**: Required for unique constraint; fast login lookups
3. **PRIMARY KEY (tasks.id)**: Natural index; fast task lookups

### Secondary Indexes

1. **idx_tasks_user_id**: Single-column index for fast filtering by user
2. **idx_tasks_user_id_created_at**: Composite index for dashboard query pattern
   - First column filters by user
   - Second column enables sort without additional sort operation

### Performance Implications

- List user tasks: O(log n) lookup via composite index + sequential scan of user's tasks
- Get specific task: O(1) via primary key + user_id verification
- Create task: O(1) insert + index updates
- Update task: O(log n) index lookup + O(1) update

---

## Cross-References

- **Task CRUD Operations**: See `specs/features/task-crud.md` for usage patterns
- **Authentication**: See `specs/features/authentication.md` for user_id storage in JWT
- **REST API**: See `specs/api/rest-endpoints.md` for query patterns
- **UI Integration**: See `specs/ui/pages.md` for data display requirements

---

## Table: conversations (Phase III - NEW)

**Description**: Stores conversation threads between users and AI chatbot

**Purpose**: Persistence layer for chatbot conversations; enables conversation history replay and auditability

### Schema Definition

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversations_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_user_id_updated_at ON conversations(user_id, updated_at DESC);
```

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique conversation identifier; passed between frontend and backend |
| `user_id` | UUID | NOT NULL, FOREIGN KEY | Conversation owner's user_id; scopes query to user's conversations only |
| `title` | VARCHAR(255) | nullable | Optional conversation title/topic (auto-generated from first few messages or user-provided) |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Conversation start timestamp (UTC) |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last message timestamp (UTC); updated when new message added |

### Indexes

- **idx_conversations_user_id**: On `user_id` for fast user-specific conversation listing
- **idx_conversations_user_id_updated_at**: Composite index for common query pattern (list user's conversations ordered by most recent)
- **PRIMARY KEY**: On `id` for fast conversation lookups

---

## Table: messages (Phase III - NEW)

**Description**: Stores all messages (user and agent) within a conversation thread

**Purpose**: Persistence for chat history; tracks Tool calls and results for auditability; enables conversation replay

### Schema Definition

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'agent')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_conversation_id FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_conversation_id_created_at ON messages(conversation_id, created_at ASC);
```

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique message identifier |
| `conversation_id` | UUID | NOT NULL, FOREIGN KEY | Parent conversation; all messages in thread linked here |
| `user_id` | UUID | NOT NULL, FOREIGN KEY | Message author's user_id (either human user or agent); enables multi-user isolation |
| `role` | VARCHAR(10) | NOT NULL, CHECK | Either `'user'` (human) or `'agent'` (AI); determines message origin and handling |
| `content` | TEXT | NOT NULL | Message text; may be user query or agent response (Markdown supported) |
| `tool_calls` | JSONB | nullable | JSON array of Tool invocations made by agent for this message (null for user messages); includes tool name, input params, and results |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Message timestamp (UTC); used to order conversation chronologically |

### Indexes

- **idx_messages_conversation_id**: On `conversation_id` for fast retrieval of all messages in a conversation
- **idx_messages_user_id**: On `user_id` for user-scoped queries (audit trail)
- **idx_messages_conversation_id_created_at**: Composite index for ordered retrieval (conversation + chronological sort)
- **PRIMARY KEY**: On `id` for fast message lookups

### tool_calls Column Format (JSONB)

When agent invokes Tools, the `tool_calls` column stores structured data:

```json
[
  {
    "tool_name": "todo_create",
    "input": {
      "title": "Meeting at 2pm",
      "description": "Tomorrow's scheduled meeting",
      "due_date": "2026-02-08T14:00:00Z"
    },
    "result": {
      "task_id": "task-uuid-new",
      "success": true
    }
  },
  {
    "tool_name": "todo_list",
    "input": {
      "filter": "due_today"
    },
    "result": {
      "tasks": [
        {"id": "task-uuid-1", "title": "Meeting at 2pm", "completed": false}
      ],
      "success": true
    }
  }
]
```

---

## SQLModel Python Classes (Phase III Additions)

### Conversation Model

```python
class Conversation(SQLModel, table=True):
    """Conversation thread model"""
    __tablename__ = "conversations"

    id: Optional[UUID] = Field(
        default=None,
        primary_key=True,
        description="Unique conversation identifier"
    )
    user_id: UUID = Field(
        foreign_key="users.id",
        description="Conversation owner's user_id"
    )
    title: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Conversation topic/title"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Conversation start timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last message timestamp"
    )
```

### Message Model

```python
class Message(SQLModel, table=True):
    """Message within a conversation"""
    __tablename__ = "messages"

    id: Optional[UUID] = Field(
        default=None,
        primary_key=True,
        description="Unique message identifier"
    )
    conversation_id: UUID = Field(
        foreign_key="conversations.id",
        description="Parent conversation thread"
    )
    user_id: UUID = Field(
        foreign_key="users.id",
        description="Message author's user_id"
    )
    role: str = Field(
        description="'user' or 'agent' - message origin"
    )
    content: str = Field(
        description="Message text (may include Markdown)"
    )
    tool_calls: Optional[Dict] = Field(
        default=None,
        description="JSON array of Tool invocations (agent messages only)"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Message timestamp (UTC)"
    )
```

---

## Assumptions

- UUID generation is handled by PostgreSQL; no collision risk
- Timestamps are always UTC; no timezone confusion in application
- Bcrypt password hashes are 60 characters; stored in VARCHAR(255) for safety margin
- Foreign key cascade delete is acceptable; deleting user deletes all conversations/messages automatically
- No soft deletes required; physical deletion is acceptable for MVP
- No audit trail/versioning needed initially
- JSONB format for tool_calls enables efficient querying if needed; compatible with Pydantic JSON serialization
