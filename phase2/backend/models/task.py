# [Task]: T-009, T-010
# [From]: plan.md §1.2 (Database Initialization), schema.md §Table: tasks
# [Reference]: FR-003 (persist task data), FR-002 (user_id association), Constitution §V (User-Scoped DB Queries)

from sqlmodel import SQLModel, Field, Index
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional


class Task(SQLModel, table=True):
    """Task database model - persists user's todo items with user isolation

    Principles:
    - Every task is associated with exactly one user via user_id FK
    - user_id filters enforce multi-tenancy (Constitution §V)
    - All queries use WHERE user_id = :user_id pattern
    - Composite index (user_id, created_at DESC) optimizes dashboard queries

    Fields:
    - id: Unique task identifier (UUID primary key)
    - user_id: Foreign key to users.id (enforces user association, NOT nullable)
    - title: Task title (required, validated 1-255 chars)
    - description: Optional task details (up to 4000 chars)
    - completed: Boolean completion status (default False)
    - created_at: Task creation timestamp (UTC)
    - updated_at: Last modification timestamp (UTC)

    Performance:
    - Composite index idx_tasks_user_id_created_at enables fast user query + sort
    - Query pattern: SELECT * FROM tasks WHERE user_id = :uid ORDER BY created_at DESC
    - Satisfies SC-002 (Dashboard list < 1 second latency requirement)

    Security:
    - user_id is immutable (set on creation, cannot be changed)
    - Database FK constraint ensures orphaned tasks are impossible
    - All API endpoints verify user_id + task ownership before allowing mutations
    """

    __tablename__ = "tasks"

    # Primary Key
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)

    # Foreign Key - User Association (Principle V enforcement)
    user_id: UUID = Field(
        foreign_key="users.id",
        index=True,
        description="User who owns this task (multi-tenant isolation key)"
    )

    # Task Content
    title: str = Field(
        min_length=1,
        max_length=255,
        description="Task title (required, 1-255 characters)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=4000,
        description="Task description or notes (optional, up to 4000 characters)"
    )

    # Task State
    completed: bool = Field(
        default=False,
        description="Whether task is marked as complete"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Task creation timestamp (UTC)"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last modification timestamp (UTC)"
    )


# Composite index for dashboard query optimization (T-010)
# Pattern: SELECT * FROM tasks WHERE user_id = :uid ORDER BY created_at DESC
# This index enables:
# 1. Fast lookup by user_id (FK join)
# 2. Pre-sorted results by created_at DESC (newest first)
# 3. Covers both WHERE and ORDER BY clauses (index-only scan)
# 4. Satisfies SC-002 performance requirement (< 1s dashboard load)
idx_tasks_user_id_created_at = Index(
    "idx_tasks_user_id_created_at",
    Task.user_id,
    Task.created_at.desc()
)


class TaskResponse(SQLModel):
    """API response model for task data (read-only representation)

    Usage: Returned by all task endpoints (GET, POST, PUT, PATCH, DELETE)
    Includes all task data and user_id for frontend correlation
    """

    id: UUID = Field(description="Task ID")
    user_id: UUID = Field(description="User who owns this task")
    title: str = Field(description="Task title")
    description: Optional[str] = Field(default=None, description="Task description")
    completed: bool = Field(description="Completion status")
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last modification timestamp")


class TaskCreateRequest(SQLModel):
    """API request model for creating a new task

    Usage: Expected payload for POST /api/v1/tasks
    Note: user_id is NOT included (extracted from JWT by backend)
    """

    title: str = Field(
        min_length=1,
        max_length=255,
        description="Task title (required, 1-255 characters)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=4000,
        description="Task description (optional, max 4000 characters)"
    )


class TaskUpdateRequest(SQLModel):
    """API request model for updating a task (PATCH/PUT)

    Usage: Expected payload for PATCH and PUT endpoints
    All fields optional to support partial updates (PATCH behavior)
    """

    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="Task title (optional, 1-255 characters if provided)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=4000,
        description="Task description (optional, max 4000 characters if provided)"
    )
    completed: Optional[bool] = Field(
        default=None,
        description="Completion status (optional if provided)"
    )
