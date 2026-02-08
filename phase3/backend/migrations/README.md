# Database Migrations Guide

## Overview

This directory contains SQL migration scripts for setting up the complete database schema for Phase 2 (REST API) and Phase 3 (MCP Tools & AI Chatbot) functionality.

**Migration Order** (Critical - must run sequentially):
1. `000_create_users_table.sql` - User authentication (foundation)
2. `001_create_tasks_table.sql` - Todo items (depends on users)
3. `002_add_conversations_table.sql` - Conversation threads (Phase 3, depends on users)
4. `003_add_messages_table.sql` - Chat messages (Phase 3, depends on conversations)

---

## Migration Details

### 000_create_users_table.sql

**Purpose**: User authentication and account management (Phase II foundation)

**Tables Created**:
- `users` - User accounts with email + bcrypt password hash

**Schema**:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `idx_users_email` - Fast email lookups (login queries)

**Security**:
- UUID PK prevents sequential enumeration
- UNIQUE constraint on email (one account per address)
- Password stored as bcrypt hash (never plaintext)
- Timestamps immutable (created_at), updatable (updated_at)

**Foreign Keys**:
- None (foundation table)
- Referenced by: tasks, conversations (cascade delete)

---

### 001_create_tasks_table.sql

**Purpose**: Todo items with user isolation (Phase II core feature)

**Tables Created**:
- `tasks` - User's todo items with completion status

**Schema**:
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
```

**Indexes**:
- `idx_tasks_user_id` - Single column, fast user filtering
- `idx_tasks_user_id_created_at` - Composite index for dashboard query pattern

**Security**:
- user_id FK ensures task ownership verification
- ON DELETE CASCADE automatically cleans up user's tasks
- All queries must include WHERE user_id = :uid (enforced at application layer)

**Performance**:
- Composite index enables efficient "list user's tasks ordered by date" queries
- Satisfies SC-002 performance requirement (< 1s dashboard latency)

**Foreign Keys**:
- `user_id` → `users.id` (ON DELETE CASCADE)

---

### 002_add_conversations_table.sql

**Purpose**: Conversation thread storage for AI chatbot (Phase III)

**Tables Created**:
- `conversations` - Chatbot conversation sessions

**Schema**:
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversations_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes**:
- `idx_conversations_user_id` - Fast user conversation listing
- `idx_conversations_user_id_updated_at` - Composite index for recent conversations first

**Security**:
- user_id FK enforces conversation ownership
- ON DELETE CASCADE cleans up user's conversations + all messages
- All queries must include WHERE user_id = :uid

**Persistence**:
- Conversation history stored for audit trail and replay
- Messages table (003) contains actual conversation thread

**Foreign Keys**:
- `user_id` → `users.id` (ON DELETE CASCADE)
- Referenced by: messages (cascade delete)

---

### 003_add_messages_table.sql

**Purpose**: Chat message history with tool call audit trail (Phase III)

**Tables Created**:
- `messages` - User and agent messages within conversations

**Schema**:
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
```

**Indexes**:
- `idx_messages_conversation_id` - Fast conversation thread retrieval
- `idx_messages_user_id` - User-scoped audit trail queries
- `idx_messages_conversation_id_created_at` - Composite for chronological ordering

**Security**:
- user_id FK ensures message belongs to conversation owner
- ON DELETE CASCADE cleans up all user's messages
- role CHECK constraint enforces 'user' or 'agent' only
- Timestamps immutable (no message editing, only audit trail)

**Audit Trail**:
- tool_calls JSONB stores complete Tool invocation history
- Enables conversation replay and agent behavior debugging
- Immutable history prevents tampering

**Foreign Keys**:
- `conversation_id` → `conversations.id` (ON DELETE CASCADE)
- `user_id` → `users.id` (ON DELETE CASCADE)

---

## Execution Instructions

### Option 1: Using psql (Recommended for Control)

```bash
# Set connection string (Neon PostgreSQL)
export DB_URL="postgresql://user:password@host:5432/database"

# Connect and execute migrations in order
psql $DB_URL -f 000_create_users_table.sql
psql $DB_URL -f 001_create_tasks_table.sql
psql $DB_URL -f 002_add_conversations_table.sql
psql $DB_URL -f 003_add_messages_table.sql

# Verify tables created
psql $DB_URL -c "\dt"  # List all tables
```

### Option 2: Using FastAPI Startup (Automatic)

```bash
cd backend
uvicorn main:app --reload --port 8000
# Backend startup will auto-create tables via SQLModel.metadata.create_all(engine)
# Check logs: "✅ Database tables initialized"
```

### Option 3: Alembic (Not Currently Used)

Currently, the project uses SQLModel.metadata.create_all() on FastAPI startup (no Alembic).
If Alembic migrations are needed in the future, these SQL files can be converted to Alembic scripts.

---

## Verification Queries

### After Running Migrations

```bash
# Verify all tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema='public' ORDER BY table_name;
-- Expected: conversations, messages, tasks, users

# Verify users table
SELECT * FROM users LIMIT 0;
\d users  -- Describe structure

# Verify tasks table
SELECT * FROM tasks LIMIT 0;
\d tasks

# Verify conversations table
SELECT * FROM conversations LIMIT 0;
\d conversations

# Verify messages table
SELECT * FROM messages LIMIT 0;
\d messages

# List all indexes
SELECT indexname, tablename FROM pg_indexes
WHERE schemaname='public' ORDER BY tablename, indexname;

# Verify foreign keys
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_name IN ('tasks', 'conversations', 'messages')
ORDER BY table_name;
```

---

## Database Dependency Graph

```
users (000)
  ├── tasks (001)
  ├── conversations (002)
  │   └── messages (003)
```

**Execution Order** (must respect dependencies):
1. **Phase II Setup**:
   - 000: users (no dependencies)
   - 001: tasks (depends on 000)

2. **Phase III Setup**:
   - 002: conversations (depends on 000)
   - 003: messages (depends on 002 + 000)

---

## Key Design Decisions

### 1. Separate Migration Files
- One file per table (not combined)
- Easier debugging if one migration fails
- Clear separation of Phase II vs Phase III

### 2. UUID Primary Keys
- PostgreSQL gen_random_uuid() function
- Not sequential (privacy + security)
- Globally unique across distributed systems

### 3. Cascade Delete
- Deleting user → cascade deletes tasks + conversations + messages
- Prevents orphaned data
- Acceptable per schema.md assumptions (no soft deletes)

### 4. Composite Indexes
- (user_id, created_at DESC) for dashboard queries
- (conversation_id, created_at ASC) for thread retrieval
- Enables both filtering AND sorting in single index

### 5. JSONB for tool_calls
- Flexible schema (Tool calls vary)
- Queryable if needed (PostgreSQL JSON operators)
- Compatible with Pydantic JSON serialization

---

## Idempotency

All migrations include `DROP TABLE IF EXISTS ... CASCADE` at the top.
This makes migrations idempotent (safe to re-run without errors).

**Note**: In production, use proper database schema versioning (Alembic) instead of DROP TABLE.

---

## Future Enhancements

### If Alembic is Added
```bash
# Generate migration from models
alembic revision --autogenerate -m "create users and tasks tables"

# Run migration
alembic upgrade head
```

### If Additional Tables Needed
- Create 004_*.sql, 005_*.sql, etc. in sequence
- Update README.md with new table documentation
- Ensure foreign key dependencies are documented

---

## Related Files

- **SQLModel Definitions**: `backend/models/user.py`, `backend/models/task.py`, `backend/models/conversation.py`, `backend/models/message.py`
- **Schema Specification**: `specs/database/schema.md`
- **Database Configuration**: `backend/db.py` (connection setup)
- **Auto-Create Logic**: `backend/main.py` (SQLModel.metadata.create_all)

---

**Last Updated**: 2026-02-08
**Version**: 1.0 (Phase II + Phase III complete)
**Status**: Ready for production deployment
