# Complete Database Migration Sequence

**Date**: 2026-02-08
**Status**: ✅ Complete (000-003)
**Coverage**: Phase II + Phase III tables

---

## Migration Files Overview

### Complete File List

```
backend/migrations/
├── 000_create_users_table.sql         ✅ Phase II Foundation
├── 001_create_tasks_table.sql         ✅ Phase II Tasks
├── 002_add_conversations_table.sql    ✅ Phase III Conversations
├── 003_add_messages_table.sql         ✅ Phase III Messages
├── README.md                          ✅ Migration Guide
└── MIGRATION_SEQUENCE.md              ✅ This File
```

---

## Sequential Execution Flow

### Step 0: Pre-Execution Checklist

- [ ] Neon PostgreSQL connection available
- [ ] DATABASE_URL environment variable set
- [ ] psql or SQL client ready
- [ ] Backup existing data (if any)

### Step 1: Run 000_create_users_table.sql

**File**: `backend/migrations/000_create_users_table.sql`
**Purpose**: User authentication table (foundation for all other tables)
**Task ID**: T-008
**Phase**: II

**Tables Created**:
- ✅ `users` (5 columns, 1 index)

**SQL Summary**:
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

**Command**:
```bash
psql postgresql://user:password@host:5432/db -f backend/migrations/000_create_users_table.sql
```

**Verification**:
```sql
SELECT table_name FROM information_schema.tables WHERE table_name='users';
-- Expected: 1 row with "users"

SELECT * FROM users;  -- Should return empty (correct schema)
```

**Success Criteria**:
- ✅ Table `users` exists with 5 columns
- ✅ Index `idx_users_email` created
- ✅ PK constraint on `id`
- ✅ UNIQUE constraint on `email`

---

### Step 2: Run 001_create_tasks_table.sql

**File**: `backend/migrations/001_create_tasks_table.sql`
**Purpose**: User's todo items with multi-tenant isolation
**Task ID**: T-009, T-010
**Phase**: II
**Depends On**: Step 1 (users table must exist)

**Tables Created**:
- ✅ `tasks` (8 columns, 2 indexes, 1 FK)

**SQL Summary**:
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

**Command**:
```bash
psql postgresql://user:password@host:5432/db -f backend/migrations/001_create_tasks_table.sql
```

**Verification**:
```sql
SELECT table_name FROM information_schema.tables WHERE table_name='tasks';
-- Expected: 1 row with "tasks"

SELECT * FROM tasks;  -- Should return empty (correct schema)

SELECT indexname FROM pg_indexes WHERE tablename='tasks';
-- Expected: idx_tasks_user_id, idx_tasks_user_id_created_at, tasks_pkey
```

**Success Criteria**:
- ✅ Table `tasks` exists with 8 columns
- ✅ Foreign key constraint `fk_tasks_user_id` references users.id
- ✅ FK has ON DELETE CASCADE
- ✅ Two indexes created: idx_tasks_user_id, idx_tasks_user_id_created_at
- ✅ PK on `id`, NOT NULL on title/user_id/completed

---

### Step 3: Run 002_add_conversations_table.sql

**File**: `backend/migrations/002_add_conversations_table.sql`
**Purpose**: Chatbot conversation threads with user isolation
**Task ID**: T-M1-001
**Phase**: III
**Depends On**: Step 1 (users table must exist)

**Tables Created**:
- ✅ `conversations` (5 columns, 2 indexes, 1 FK)

**SQL Summary**:
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

**Command**:
```bash
psql postgresql://user:password@host:5432/db -f backend/migrations/002_add_conversations_table.sql
```

**Verification**:
```sql
SELECT table_name FROM information_schema.tables WHERE table_name='conversations';
-- Expected: 1 row with "conversations"

SELECT * FROM conversations;  -- Should return empty (correct schema)

SELECT indexname FROM pg_indexes WHERE tablename='conversations';
-- Expected: idx_conversations_user_id, idx_conversations_user_id_updated_at, conversations_pkey
```

**Success Criteria**:
- ✅ Table `conversations` exists with 5 columns
- ✅ Foreign key constraint references users.id
- ✅ FK has ON DELETE CASCADE
- ✅ Two indexes created for user and recency queries
- ✅ title is nullable (optional conversation title)

---

### Step 4: Run 003_add_messages_table.sql

**File**: `backend/migrations/003_add_messages_table.sql`
**Purpose**: Chat message history with tool call audit trail
**Task ID**: T-M1-002
**Phase**: III
**Depends On**: Step 1 (users), Step 3 (conversations must exist)

**Tables Created**:
- ✅ `messages` (8 columns, 3 indexes, 2 FKs)

**SQL Summary**:
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

**Command**:
```bash
psql postgresql://user:password@host:5432/db -f backend/migrations/003_add_messages_table.sql
```

**Verification**:
```sql
SELECT table_name FROM information_schema.tables WHERE table_name='messages';
-- Expected: 1 row with "messages"

SELECT * FROM messages;  -- Should return empty (correct schema)

SELECT indexname FROM pg_indexes WHERE tablename='messages';
-- Expected: idx_messages_conversation_id, idx_messages_user_id, idx_messages_conversation_id_created_at, messages_pkey

SELECT constraint_name FROM information_schema.table_constraints WHERE table_name='messages';
-- Expected: messages_pkey, fk_messages_conversation_id, fk_messages_user_id, messages_role_check
```

**Success Criteria**:
- ✅ Table `messages` exists with 8 columns
- ✅ Two foreign key constraints (conversation_id, user_id) both with ON DELETE CASCADE
- ✅ Three indexes created for conversation queries, user queries, and chronological ordering
- ✅ CHECK constraint on role ('user' or 'agent' only)
- ✅ tool_calls is JSONB nullable column (for Tool invocation audit trail)

---

## Complete Verification Script

After running all 4 migrations, verify the complete setup:

```bash
# File: verify_migrations.sql
# Run: psql postgresql://user:password@host:5432/db -f verify_migrations.sql

-- 1. List all tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema='public'
ORDER BY table_name;
-- Expected: conversations, messages, tasks, users

-- 2. Verify table structures
\d users
\d tasks
\d conversations
\d messages

-- 3. List all indexes
SELECT indexname, tablename FROM pg_indexes
WHERE schemaname='public'
ORDER BY tablename, indexname;

-- Expected indexes:
-- conversations: conversations_pkey, idx_conversations_user_id, idx_conversations_user_id_updated_at
-- messages: messages_pkey, idx_messages_conversation_id, idx_messages_conversation_id_created_at, idx_messages_user_id
-- tasks: tasks_pkey, idx_tasks_user_id, idx_tasks_user_id_created_at
-- users: users_pkey, idx_users_email

-- 4. Verify foreign key constraints
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_name IN ('tasks', 'conversations', 'messages')
ORDER BY table_name;

-- Expected FKs:
-- tasks -> users.id
-- conversations -> users.id
-- messages -> conversations.id AND users.id

-- 5. Verify all tables are empty
SELECT 'users' as table_name, count(*) FROM users
UNION ALL SELECT 'tasks', count(*) FROM tasks
UNION ALL SELECT 'conversations', count(*) FROM conversations
UNION ALL SELECT 'messages', count(*) FROM messages;

-- Expected: All counts = 0 (tables empty after creation)

-- 6. Test basic operations
-- Insert test user
INSERT INTO users (email, password_hash) VALUES ('test@example.com', 'bcrypt_hash_here') RETURNING *;

-- Insert test task
-- First get the user_id from above
-- INSERT INTO tasks (user_id, title) VALUES ('<uuid>', 'Test Task') RETURNING *;

-- Query with user isolation (should work)
-- SELECT * FROM tasks WHERE user_id = '<uuid>';

-- Cleanup (optional)
-- DELETE FROM users WHERE email='test@example.com';  -- Cascades to tasks, conversations, messages
```

---

## Database Schema Diagram

```
┌─────────────────────────────────────┐
│            USERS (Phase II)         │
├─────────────────────────────────────┤
│ id (UUID PK)                        │
│ email (VARCHAR 255, UNIQUE)         │
│ password_hash (VARCHAR 255)         │
│ created_at (TIMESTAMP TZ)           │
│ updated_at (TIMESTAMP TZ)           │
└─────────────────────────────────────┘
        │                    │
        │ (FK on user_id)    │ (FK on user_id)
        ▼                    ▼
┌──────────────────┐  ┌────────────────────────────┐
│  TASKS (Phase II)│  │ CONVERSATIONS (Phase III)  │
├──────────────────┤  ├────────────────────────────┤
│ id (UUID PK)     │  │ id (UUID PK)               │
│ user_id (FK)     │  │ user_id (FK)               │
│ title (VARCHAR)  │  │ title (VARCHAR, nullable)  │
│ description (T)  │  │ created_at (TIMESTAMP TZ)  │
│ completed (BOOL) │  │ updated_at (TIMESTAMP TZ)  │
│ created_at (TS)  │  └────────────────────────────┘
│ updated_at (TS)  │              │
└──────────────────┘              │ (FK on conversation_id)
                                  ▼
                    ┌──────────────────────────────┐
                    │  MESSAGES (Phase III)        │
                    ├──────────────────────────────┤
                    │ id (UUID PK)                 │
                    │ conversation_id (FK)         │
                    │ user_id (FK)                 │
                    │ role (VARCHAR: user|agent)   │
                    │ content (TEXT)               │
                    │ tool_calls (JSONB, nullable) │
                    │ created_at (TIMESTAMP TZ)    │
                    └──────────────────────────────┘

Legend:
PK = Primary Key
FK = Foreign Key
TS = TIMESTAMP WITH TIME ZONE
T = TEXT
BOOL = BOOLEAN
TZ = With Time Zone
```

---

## Index Coverage Analysis

### Phase II (Tasks CRUD)

**Query: List user's tasks ordered by newest**
```sql
SELECT * FROM tasks WHERE user_id = :uid ORDER BY created_at DESC;
```
**Index Used**: `idx_tasks_user_id_created_at`
**Coverage**: ✅ PERFECT (covers both WHERE and ORDER BY)

**Query: Get task by ID for user**
```sql
SELECT * FROM tasks WHERE id = :id AND user_id = :uid;
```
**Index Used**: `idx_tasks_user_id` or primary key on id
**Coverage**: ✅ PERFECT

### Phase III (Chat)

**Query: List user's conversations by most recent**
```sql
SELECT * FROM conversations WHERE user_id = :uid ORDER BY updated_at DESC;
```
**Index Used**: `idx_conversations_user_id_updated_at`
**Coverage**: ✅ PERFECT (covers both WHERE and ORDER BY)

**Query: Fetch conversation thread chronologically**
```sql
SELECT * FROM messages WHERE conversation_id = :cid ORDER BY created_at ASC;
```
**Index Used**: `idx_messages_conversation_id_created_at`
**Coverage**: ✅ PERFECT (covers both WHERE and ORDER BY)

**Query: User isolation verification (audit)**
```sql
SELECT * FROM messages WHERE user_id = :uid;
```
**Index Used**: `idx_messages_user_id`
**Coverage**: ✅ PERFECT

---

## Performance Metrics

After migrations complete, verify performance:

```sql
-- Analyze table statistics (PostgreSQL)
ANALYZE users;
ANALYZE tasks;
ANALYZE conversations;
ANALYZE messages;

-- Check index bloat (optional)
SELECT schemaname, tablename, indexname,
       ROUND(100 * (OTTA - CURRENTLY_USED) / OTTA) AS waste_percent
FROM pgstattuple_approx('users'::regclass);

-- Monitor query plans (examples)
EXPLAIN ANALYZE
SELECT * FROM tasks WHERE user_id = 'user-uuid' ORDER BY created_at DESC;

EXPLAIN ANALYZE
SELECT * FROM messages WHERE conversation_id = 'conv-uuid' ORDER BY created_at ASC;
```

---

## Troubleshooting

### Problem: Foreign Key Constraint Fails

**Cause**: Running 001 before 000 (tasks depends on users)

**Solution**: Run migrations in correct order (000 → 001 → 002 → 003)

### Problem: "user_id" Not Found

**Cause**: Running 001/003 before 000 (users table doesn't exist)

**Solution**: Ensure 000_create_users_table.sql runs first

### Problem: Index Not Used in Queries

**Cause**: PostgreSQL statistics stale

**Solution**:
```sql
ANALYZE;  -- Update table statistics
REINDEX INDEX index_name;  -- Rebuild index
```

### Problem: DROP TABLE Fails Due to Foreign Keys

**Cause**: Migrations include DROP TABLE CASCADE (intentional)

**Solution**: If you need to recreate without dropping, comment out the DROP lines in migration files

---

## Migration Rollback (Development Only)

**Warning**: In production, use proper database schema versioning (Alembic)

To rollback all migrations in development:

```sql
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then re-run all migrations from 000-003.

---

## Summary

**Complete Database Setup**: ✅ Ready
**Phase II Support**: ✅ Users + Tasks tables
**Phase III Support**: ✅ Conversations + Messages tables
**User Isolation**: ✅ Enforced at database level
**Foreign Keys**: ✅ All cascade delete configured
**Indexes**: ✅ All query patterns optimized

**Files**: 4 migrations + 2 guides
**Execution Time**: < 1 second (typical)
**Database Size**: < 10MB (initial, empty)

---

**Created**: 2026-02-08
**Status**: Ready for execution
**Next Step**: Run migrations in sequence (000 → 001 → 002 → 003)
