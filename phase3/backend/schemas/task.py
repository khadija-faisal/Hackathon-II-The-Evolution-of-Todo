# [Task]: T-014
# [From]: rest-endpoints.md §Pydantic Models, §Task Endpoints
# [Reference]: FR-010, FR-014, Constitution §VII (Type Safety & Validation)

from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional


class TaskCreateRequest(BaseModel):
    """API request model for creating a new task

    Usage: Expected payload for POST /api/v1/tasks
    Validation:
    - title: 1-255 characters (non-empty required)
    - description: 0-4000 characters (optional)

    Security:
    - user_id is NOT accepted (comes from JWT)
    - completed always defaults to False (cannot set on creation)
    - created_at/updated_at set server-side (not client-provided)

    Example:
    ```json
    {
      "title": "Buy groceries",
      "description": "Milk, eggs, bread"
    }
    ```
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


class TaskUpdateRequest(BaseModel):
    """API request model for updating a task (PATCH/PUT)

    Usage: Expected payload for PATCH and PUT endpoints
    All fields optional to support partial updates

    Validation:
    - title: 1-255 characters (if provided)
    - description: 0-4000 characters (if provided)
    - completed: Boolean (if provided)

    Security:
    - user_id cannot be changed (immutable)
    - Backend verifies user ownership before allowing update
    - updated_at set server-side (not client-provided)

    Example (PATCH - partial update):
    ```json
    {
      "completed": true
    }
    ```

    Example (PUT - full update):
    ```json
    {
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false
    }
    ```
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


class TaskResponse(BaseModel):
    """API response model for task data

    Usage: Returned by all task endpoints (GET, POST, PUT, PATCH, DELETE)
    Includes all task data with timestamps for frontend synchronization

    Fields:
    - id: Unique task identifier
    - user_id: Owner of the task (for frontend context)
    - title: Task title
    - description: Task details
    - completed: Completion status
    - created_at: Creation timestamp
    - updated_at: Last modification timestamp

    Security:
    - user_id included so frontend can verify ownership if needed
    - Backend guarantees user_id matches authenticated user (defensive)
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID = Field(description="Task ID")
    user_id: UUID = Field(description="User who owns this task")
    title: str = Field(description="Task title")
    description: Optional[str] = Field(default=None, description="Task description")
    completed: bool = Field(description="Completion status")
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last modification timestamp")


class TaskListResponse(BaseModel):
    """API response model for list of tasks with pagination metadata

    Usage: Returned by GET /api/v1/tasks (list endpoint)
    Includes pagination information for frontend cursor navigation

    Fields:
    - data: Array of TaskResponse objects
    - total: Total number of tasks for authenticated user
    - limit: Items returned in this response
    - offset: Items skipped (pagination offset)
    """

    model_config = ConfigDict(from_attributes=True)

    data: list[TaskResponse] = Field(description="Array of tasks")
    total: int = Field(description="Total count of user's tasks")
    limit: int = Field(description="Items returned in this response")
    offset: int = Field(description="Items skipped (offset)")
