# Quick Start: Database Migration

## 3-Step Execution

### Step 1: Set Database URL
```bash
export DATABASE_URL="postgresql://username:password@host:port/database"
```

### Step 2: Run All Migrations
```bash
cd /home/khadija/hackthon2/phase3
psql $DATABASE_URL -f backend/migrations/000_create_users_table.sql
psql $DATABASE_URL -f backend/migrations/001_create_tasks_table.sql
psql $DATABASE_URL -f backend/migrations/002_add_conversations_table.sql
psql $DATABASE_URL -f backend/migrations/003_add_messages_table.sql
```

### Step 3: Verify
```bash
psql $DATABASE_URL -c "\dt"
# Expected output:
#           List of relations
#  Schema |      Name      | Type  |  Owner
# --------+----------------+-------+---------
#  public | conversations  | table | neondb_owner
#  public | messages       | table | neondb_owner
#  public | tasks          | table | neondb_owner
#  public | users          | table | neondb_owner
```

## What Gets Created

| Migration | Tables | Indexes | Foreign Keys |
|-----------|--------|---------|--------------|
| 000 | users (1) | 1 | 0 |
| 001 | tasks (1) | 2 | 1 |
| 002 | conversations (1) | 2 | 1 |
| 003 | messages (1) | 3 | 2 |
| **TOTAL** | **4 tables** | **8 indexes** | **4 FK constraints** |

## Or: Auto-Create via FastAPI

```bash
cd /home/khadija/hackthon2/phase3/backend
uvicorn main:app --reload
# Startup will auto-create tables
# Check logs: "✅ Database tables initialized"
```

---

**Files**: 4 migrations (000-003)
**Time**: < 1 second
**Idempotent**: Yes (safe to re-run)
**Documentation**: See README.md, MIGRATION_SEQUENCE.md
