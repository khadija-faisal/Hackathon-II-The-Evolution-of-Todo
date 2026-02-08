# [Task]: T-M2-002, T-M2-003, T-M2-004, T-M2-005
# [From]: .specify/plans/ai-chatbot.md §3.2 (Tool Implementations), specs/002-ai-chatbot-specs/checklists/requirements.md §Tool Functions
# [Phase]: III (MCP CRUD Tool Functions)
# [Reference]: Constitution §I (User-Scoped CRUD), Constitution §VI (Tool Naming Convention)

from uuid import UUID
from typing import Optional
from sqlmodel import Session

from backend.services.task_service import (
    create_task as service_create_task,
    get_user_tasks as service_get_user_tasks,
    get_task_by_id as service_get_task_by_id,
    update_task as service_update_task,
    delete_task as service_delete_task,
)
from backend.models.task import TaskUpdateRequest
from backend.utils.errors import NotFoundError, BadRequestError
from backend.mcp.schemas import (
    TodoCreateInput,
    TodoCreateOutput,
    TodoListInput,
    TodoListItemOutput,
    TodoListOutput,
    TodoReadInput,
    TodoReadOutput,
    TodoUpdateInput,
    TodoUpdateOutput,
    TodoDeleteInput,
    TodoDeleteOutput,
)


# ============================================================================
# todo_create Tool (T-M2-002)
# ============================================================================

def todo_create(
    session: Session,
    user_id: UUID,
    input_data: TodoCreateInput,
) -> TodoCreateOutput:
    """Create a new task for authenticated user.

    [Task]: T-M2-002 | [From]: plan.md §3.1

    Creates task scoped to user_id from JWT context (never from input).
    Returns TodoCreateOutput with success status, task_id, and any error messages.
    User isolation enforced at service layer.
    """

    try:
        # Call service layer (validates input, creates task)
        task = service_create_task(
            session=session,
            user_id=user_id,
            title=input_data.title,
            description=input_data.description,
        )

        # Return success response with task details
        return TodoCreateOutput(
            success=True,
            task_id=task.id,
            title=task.title,
            message="Task created successfully",
        )

    except BadRequestError as e:
        # Input validation failed (e.g., title too long)
        return TodoCreateOutput(
            success=False,
            error=str(e),
        )
    except Exception as e:
        # Unexpected error (log internally, return generic message to user)
        # In production: log e to error tracking service, don't expose to user
        return TodoCreateOutput(
            success=False,
            error="Failed to create task. Please try again.",
        )


# ============================================================================
# todo_list Tool (T-M2-002-005 aggregate)
# ============================================================================

def todo_list(
    session: Session,
    user_id: UUID,
    input_data: TodoListInput,
) -> TodoListOutput:
    """Fetch user tasks with optional completion filter and pagination.

    [Task]: T-M2-004 | [From]: plan.md §3.2

    Returns paginated task list (user_id scoped). Supports optional completed filter.
    Results ordered by created_at DESC. Total count and pagination metadata included.
    """

    try:
        # Call service layer (returns filtered tasks + total count)
        tasks, total = service_get_user_tasks(
            session=session,
            user_id=user_id,
            completed=input_data.completed,
            limit=input_data.limit,
            offset=input_data.offset,
        )

        # Convert tasks to output format
        task_items = [
            TodoListItemOutput(
                task_id=task.id,
                title=task.title,
                description=task.description,
                completed=task.completed,
                created_at=task.created_at,
                updated_at=task.updated_at,
            )
            for task in tasks
        ]

        # Return success response with task list
        return TodoListOutput(
            success=True,
            tasks=task_items,
            total_count=total,
            limit=input_data.limit,
            offset=input_data.offset,
            message=f"Retrieved {len(task_items)} task(s)",
        )

    except BadRequestError as e:
        # Input validation failed (e.g., invalid pagination)
        return TodoListOutput(
            success=False,
            error=str(e),
        )
    except Exception as e:
        # Unexpected error
        return TodoListOutput(
            success=False,
            error="Failed to retrieve tasks. Please try again.",
        )


# ============================================================================
# todo_read Tool (T-M2-003)
# ============================================================================

def todo_read(
    session: Session,
    user_id: UUID,
    input_data: TodoReadInput,
) -> TodoReadOutput:
    """Fetch a single task by ID with ownership verification.

    [Task]: T-M2-003 | [From]: plan.md §3.3

    Returns task details if found and owned by user, else 404 (no distinction between
    not-found and unauthorized for security). Ownership verified before returning data.
    """

    try:
        # Call service layer (verifies ownership, raises NotFoundError if not found/not owned)
        task = service_get_task_by_id(
            session=session,
            user_id=user_id,
            task_id=input_data.task_id,
        )

        # Return success response with task details
        return TodoReadOutput(
            success=True,
            task_id=task.id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            created_at=task.created_at,
            updated_at=task.updated_at,
            message="Task retrieved successfully",
        )

    except NotFoundError:
        # Task not found or user doesn't own it
        return TodoReadOutput(
            success=False,
            error="Task not found",
        )
    except Exception as e:
        # Unexpected error
        return TodoReadOutput(
            success=False,
            error="Failed to retrieve task. Please try again.",
        )


# ============================================================================
# todo_update Tool (T-M2-004)
# ============================================================================

def todo_update(
    session: Session,
    user_id: UUID,
    input_data: TodoUpdateInput,
) -> TodoUpdateOutput:
    """Update task fields using PATCH semantics (all fields optional).

    [Task]: T-M2-005 | [From]: plan.md §3.4-3.6

    Only authenticated user can update their own tasks. Ownership verified before any update.
    Returns 404 if task not found or not owned. Immutable fields: id, user_id, created_at.
    Returns 404 for not found or unauthorized (no distinction for security).
    """

    try:
        # Build TaskUpdateRequest from input (all fields optional)
        updates = TaskUpdateRequest(
            title=input_data.title,
            description=input_data.description,
            completed=input_data.completed,
        )

        # Call service layer (verifies ownership, raises NotFoundError if not found/not owned)
        task = service_update_task(
            session=session,
            user_id=user_id,
            task_id=input_data.task_id,
            updates=updates,
        )

        # Return success response with updated task details
        return TodoUpdateOutput(
            success=True,
            task_id=task.id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            created_at=task.created_at,
            updated_at=task.updated_at,
            message="Task updated successfully",
        )

    except NotFoundError:
        # Task not found or user doesn't own it
        return TodoUpdateOutput(
            success=False,
            error="Task not found",
        )
    except BadRequestError as e:
        # Input validation failed (e.g., title too long)
        return TodoUpdateOutput(
            success=False,
            error=str(e),
        )
    except Exception as e:
        # Unexpected error
        return TodoUpdateOutput(
            success=False,
            error="Failed to update task. Please try again.",
        )


# ============================================================================
# todo_delete Tool (T-M2-005)
# ============================================================================

def todo_delete(
    session: Session,
    user_id: UUID,
    input_data: TodoDeleteInput,
) -> TodoDeleteOutput:
    """Delete a task permanently with ownership verification.

    [Task]: T-M2-006 | [From]: plan.md §3.7

    Physical deletion (no recovery). Ownership verified before deletion.
    Returns 404 if task not found or not owned. Cannot delete other users' tasks.
    """

    try:
        # Store task_id for echo response
        task_id_to_delete = input_data.task_id

        # Call service layer (verifies ownership, raises NotFoundError if not found/not owned)
        service_delete_task(
            session=session,
            user_id=user_id,
            task_id=task_id_to_delete,
        )

        # Return success response with deleted task_id
        return TodoDeleteOutput(
            success=True,
            task_id=task_id_to_delete,
            message="Task deleted successfully",
        )

    except NotFoundError:
        # Task not found or user doesn't own it
        return TodoDeleteOutput(
            success=False,
            error="Task not found",
        )
    except Exception as e:
        # Unexpected error
        return TodoDeleteOutput(
            success=False,
            error="Failed to delete task. Please try again.",
        )
