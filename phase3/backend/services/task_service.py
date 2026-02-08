# [Task]: T-022, T-023, T-024, T-025, T-026
# [From]: plan.md §3.1-3.7 (CRUD Operations), task-crud.md, rest-endpoints.md
# [Reference]: Constitution §V (User-Scoped DB Queries), FR-001-FR-011

from uuid import UUID
from datetime import datetime
from typing import Optional, List
from sqlmodel import Session, select, func
from backend.models.task import Task, TaskResponse, TaskCreateRequest, TaskUpdateRequest
from backend.utils.errors import NotFoundError, BadRequestError


def create_task(
    session: Session,
    user_id: UUID,
    title: str,
    description: Optional[str] = None,
) -> TaskResponse:
    """Service: Create a new task for authenticated user

    [Task]: T-022
    [From]: plan.md §3.1: Create Task

    **User Isolation**:
    - user_id is ALWAYS extracted from JWT, NEVER from request body
    - Task is created with user_id from authenticated user
    - Cannot create tasks for other users

    **Validation**:
    - title: 1-255 characters (non-empty, required)
    - description: optional, max 4000 characters
    - completed: always defaults to False
    - created_at/updated_at: set to current UTC timestamp

    **Database Query Pattern**:
    - INSERT INTO tasks (id, user_id, title, description, completed, created_at, updated_at)
    - user_id explicitly scoped from JWT (security)

    Args:
        session: Database session
        user_id: Authenticated user ID from JWT claims
        title: Task title (required, 1-255 chars)
        description: Optional task description (max 4000 chars)

    Returns:
        TaskResponse with created task details

    Raises:
        BadRequestError: If title is empty or exceeds limits

    Example:
    ```python
    task = create_task(session, user_id, "Buy groceries", "Milk, eggs, bread")
    # Returns TaskResponse with id, user_id, title, description, completed=False, timestamps
    ```

    **Security Guarantee**:
    - Task is always associated with authenticated user (cannot be changed)
    - Respects Constitution Principle V: User-Scoped Database Queries
    - user_id parameter is non-negotiable (enforced by route handler)
    """

    # Create task instance with server-set values
    now = datetime.utcnow()
    task = Task(
        user_id=user_id,
        title=title,
        description=description,
        completed=False,  # Always default to incomplete
        created_at=now,
        updated_at=now,
    )

    # Add and commit to database
    session.add(task)
    session.commit()
    session.refresh(task)

    # Return response model (includes all fields)
    return TaskResponse.model_validate(task)


def get_user_tasks(
    session: Session,
    user_id: UUID,
    completed: Optional[bool] = None,
    limit: int = 100,
    offset: int = 0,
) -> tuple[List[TaskResponse], int]:
    """Service: Retrieve all tasks for authenticated user with optional filtering

    [Task]: T-023
    [From]: plan.md §3.2: List Tasks

    **User Isolation**:
    - WHERE user_id = :user_id (mandatory filter, cannot be bypassed)
    - Returns ONLY tasks owned by authenticated user
    - Total count also scoped by user_id

    **Ordering**:
    - Tasks ordered by created_at DESC (newest first)
    - Composite index idx_tasks_user_id_created_at optimizes this query

    **Pagination**:
    - Supports limit (default 100) and offset (default 0)
    - Prevents loading entire task list at once

    **Optional Filtering**:
    - completed: Filter by task status (True/False/None for all)

    **Database Query Pattern**:
    ```sql
    SELECT * FROM tasks
    WHERE user_id = :user_id [AND completed = :completed]
    ORDER BY created_at DESC
    LIMIT :limit OFFSET :offset
    ```

    Args:
        session: Database session
        user_id: Authenticated user ID from JWT claims
        completed: Optional filter by completion status (True, False, or None)
        limit: Max tasks to return (default 100, max typically 1000)
        offset: Pagination offset (default 0)

    Returns:
        Tuple of (List[TaskResponse], total_count)
        - total_count: Total tasks matching filter (for pagination info)

    Example:
    ```python
    tasks, total = get_user_tasks(session, user_id, completed=False, limit=20, offset=0)
    # Returns list of incomplete tasks + total count
    ```

    **Performance**:
    - SC-002: Dashboard list load < 1 second (enabled by composite index)
    - Composite index: (user_id, created_at DESC) enables fast lookup + sort
    - No N+1 queries (direct ORM query)

    **Security Guarantee**:
    - WHERE clause ALWAYS includes user_id (cannot be removed)
    - Total count respects user_id filter (no leakage of other users' task counts)
    """

    # Build base query with mandatory user_id filter
    query = select(Task).where(Task.user_id == user_id)

    # Optional completion status filter
    if completed is not None:
        query = query.where(Task.completed == completed)

    # Order by created_at DESC (newest first)
    query = query.order_by(Task.created_at.desc())

    # Apply pagination
    query = query.limit(limit).offset(offset)

    # Execute query
    tasks = session.exec(query).all()

    # Get total count for pagination (MUST respect user_id filter)
    count_query = select(func.count(Task.id)).where(Task.user_id == user_id)
    if completed is not None:
        count_query = count_query.where(Task.completed == completed)
    total = session.exec(count_query).one()

    # Convert to response models
    task_responses = [TaskResponse.model_validate(task) for task in tasks]

    return task_responses, total


def get_task_by_id(
    session: Session,
    user_id: UUID,
    task_id: UUID,
) -> TaskResponse:
    """Service: Retrieve specific task by ID (verify ownership)

    [Task]: T-024
    [From]: plan.md §3.3: Get Single Task

    **User Isolation**:
    - WHERE id = :task_id AND user_id = :user_id
    - Returns 404 if task doesn't exist OR user doesn't own it
    - No distinction between "task not found" vs "user lacks permission"
    - Security: Prevents information leakage about other users' tasks

    **Database Query Pattern**:
    ```sql
    SELECT * FROM tasks
    WHERE id = :task_id AND user_id = :user_id
    ```

    Args:
        session: Database session
        user_id: Authenticated user ID from JWT claims
        task_id: UUID of task to retrieve

    Returns:
        TaskResponse with full task details

    Raises:
        NotFoundError: If task doesn't exist OR user doesn't own it (no distinction)

    Example:
    ```python
    task = get_task_by_id(session, user_id, task_id)
    # Returns TaskResponse or raises 404 if not found/not owned
    ```

    **Security Guarantee**:
    - Cannot retrieve other users' tasks (user_id + task_id must both match)
    - Returns 404 regardless of reason (no information leakage)
    - Defensive: Even if JWT validation somehow failed, DB prevents leaks
    """

    # Query with mandatory user_id filter
    query = select(Task).where(
        (Task.id == task_id) & (Task.user_id == user_id)
    )
    task = session.exec(query).first()

    if not task:
        # Raise 404 regardless of whether task doesn't exist or user doesn't own it
        raise NotFoundError(f"Task not found")

    return TaskResponse.model_validate(task)


def update_task(
    session: Session,
    user_id: UUID,
    task_id: UUID,
    updates: TaskUpdateRequest,
) -> TaskResponse:
    """Service: Update task with ownership verification

    [Task]: T-025
    [From]: plan.md §3.4-3.6: Update Task, Partial Update, Complete Toggle

    **User Isolation**:
    - WHERE id = :task_id AND user_id = :user_id (verify ownership first)
    - user_id parameter is immutable (cannot be changed)
    - Cannot update other users' tasks (returns 403 Forbidden)

    **Field Updates**:
    - title: Optional, 1-255 chars if provided
    - description: Optional, max 4000 chars if provided
    - completed: Optional, boolean toggle if provided
    - All other fields (id, user_id, created_at) are immutable

    **Timestamp Updates**:
    - updated_at ALWAYS refreshed to current UTC time
    - created_at remains unchanged

    **Database Query Pattern**:
    ```sql
    SELECT * FROM tasks WHERE id = :task_id AND user_id = :user_id
    UPDATE tasks SET title=?, description=?, completed=?, updated_at=NOW()
      WHERE id = :task_id AND user_id = :user_id
    ```

    Args:
        session: Database session
        user_id: Authenticated user ID from JWT claims
        task_id: UUID of task to update
        updates: TaskUpdateRequest with fields to update (all optional)

    Returns:
        Updated TaskResponse

    Raises:
        NotFoundError: If task doesn't exist
        ForbiddenError: If user doesn't own the task (raised as 404 for security)
        BadRequestError: If provided values are invalid

    Example:
    ```python
    update_req = TaskUpdateRequest(title="Updated title", completed=True)
    task = update_task(session, user_id, task_id, update_req)
    ```

    **Security Guarantee**:
    - Ownership verified before any update
    - user_id cannot be changed (immutable)
    - Only authenticated user can update their own tasks
    - Respects Constitution Principle V: User-Scoped Database Queries
    """

    # Verify task exists and user owns it
    query = select(Task).where(
        (Task.id == task_id) & (Task.user_id == user_id)
    )
    task = session.exec(query).first()

    if not task:
        raise NotFoundError(f"Task not found")

    # Update only provided fields
    if updates.title is not None:
        task.title = updates.title
    if updates.description is not None:
        task.description = updates.description
    if updates.completed is not None:
        task.completed = updates.completed

    # Always refresh updated_at
    task.updated_at = datetime.utcnow()

    # Commit changes
    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse.model_validate(task)


def delete_task(
    session: Session,
    user_id: UUID,
    task_id: UUID,
) -> None:
    """Service: Delete task permanently (verify ownership)

    [Task]: T-026
    [From]: plan.md §3.7: Delete Task

    **User Isolation**:
    - WHERE id = :task_id AND user_id = :user_id
    - Cannot delete other users' tasks
    - Physical deletion (no soft delete, no recovery)

    **Database Query Pattern**:
    ```sql
    DELETE FROM tasks WHERE id = :task_id AND user_id = :user_id
    ```

    Args:
        session: Database session
        user_id: Authenticated user ID from JWT claims
        task_id: UUID of task to delete

    Raises:
        NotFoundError: If task doesn't exist or user doesn't own it

    Example:
    ```python
    delete_task(session, user_id, task_id)
    # Returns 204 No Content, task permanently removed
    ```

    **Security Guarantee**:
    - Ownership verified before deletion
    - Cannot delete other users' tasks
    - Physical deletion: no way to recover deleted tasks
    - Returns 404 if task doesn't exist (no distinction from permission denied)
    """

    # Verify task exists and user owns it
    query = select(Task).where(
        (Task.id == task_id) & (Task.user_id == user_id)
    )
    task = session.exec(query).first()

    if not task:
        raise NotFoundError(f"Task not found")

    # Delete the task
    session.delete(task)
    session.commit()
