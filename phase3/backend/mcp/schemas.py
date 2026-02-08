# [Task]: T-M2-001
# [From]: .specify/plans/ai-chatbot.md §3.1 (Tool Schemas), specs/002-ai-chatbot-specs/checklists/requirements.md §Tool Definition
# [Phase]: III (MCP Tool Input/Output Schema Definitions)
# [Reference]: Constitution §I (User-Scoped CRUD), Constitution §VI (Tool Naming Convention)

from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional, List, Dict
from datetime import datetime


# ============================================================================
# TODO_CREATE Tool - Input & Output Schemas
# ============================================================================

class TodoCreateInput(BaseModel):
    """Input for todo_create tool"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Buy groceries",
                "description": "Milk, eggs, bread"
            }
        }
    )

    title: str = Field(
        min_length=1,
        max_length=255,
        description="Task title (required, 1-255 characters)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=4000,
        description="Task description or notes (optional, max 4000 characters)"
    )


class TodoCreateOutput(BaseModel):
    """Response from todo_create: success status with task ID and details or error"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "task_id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Buy groceries",
                "message": "Task created successfully"
            }
        }
    )

    success: bool = Field(
        description="Whether task was created successfully"
    )
    task_id: Optional[UUID] = Field(
        default=None,
        description="UUID of newly created task (only if success=true)"
    )
    title: Optional[str] = Field(
        default=None,
        description="Task title (only if success=true)"
    )
    message: Optional[str] = Field(
        default=None,
        description="Success message (only if success=true)"
    )
    error: Optional[str] = Field(
        default=None,
        description="Error message in plain English (only if success=false)"
    )


# ============================================================================
# TODO_LIST Tool - Input & Output Schemas
# ============================================================================

class TodoListInput(BaseModel):
    """Fetch user tasks with optional completion filter and pagination"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "completed": False,
                "limit": 50,
                "offset": 0
            }
        }
    )

    completed: Optional[bool] = Field(
        default=None,
        description="Filter by completion status (null = all, true = completed, false = incomplete)"
    )
    limit: int = Field(
        default=100,
        ge=1,
        le=1000,
        description="Max tasks to return (1-1000, default 100)"
    )
    offset: int = Field(
        default=0,
        ge=0,
        description="Pagination offset (default 0)"
    )


class TodoListItemOutput(BaseModel):
    """Single task in list response"""

    model_config = ConfigDict(from_attributes=True)

    task_id: UUID = Field(description="Task ID")
    title: str = Field(description="Task title")
    description: Optional[str] = Field(default=None, description="Task description")
    completed: bool = Field(description="Whether task is completed")
    created_at: datetime = Field(description="Task creation timestamp")
    updated_at: datetime = Field(description="Last modification timestamp")


class TodoListOutput(BaseModel):
    """Response from todo_list: task array with total count or error"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "tasks": [
                    {
                        "task_id": "123e4567-e89b-12d3-a456-426614174000",
                        "title": "Buy groceries",
                        "description": None,
                        "completed": False,
                        "created_at": "2026-02-08T12:00:00Z",
                        "updated_at": "2026-02-08T12:00:00Z"
                    }
                ],
                "total_count": 1,
                "limit": 50,
                "offset": 0,
                "message": "Retrieved 1 task(s)"
            }
        }
    )

    success: bool = Field(
        description="Whether tasks were retrieved successfully"
    )
    tasks: Optional[List[TodoListItemOutput]] = Field(
        default=None,
        description="List of task items (only if success=true)"
    )
    total_count: Optional[int] = Field(
        default=None,
        description="Total tasks matching filter (for pagination)"
    )
    limit: Optional[int] = Field(
        default=None,
        description="Pagination limit used"
    )
    offset: Optional[int] = Field(
        default=None,
        description="Pagination offset used"
    )
    message: Optional[str] = Field(
        default=None,
        description="Success message"
    )
    error: Optional[str] = Field(
        default=None,
        description="Error message in plain English (only if success=false)"
    )


# ============================================================================
# TODO_READ Tool - Input & Output Schemas
# ============================================================================

class TodoReadInput(BaseModel):
    """Fetch a single task by ID"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "task_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }
    )

    task_id: UUID = Field(
        description="UUID of task to retrieve (required)"
    )


class TodoReadOutput(BaseModel):
    """Response from todo_read: task details or not found error"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "task_id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "created_at": "2026-02-08T12:00:00Z",
                "updated_at": "2026-02-08T12:00:00Z",
                "message": "Task retrieved successfully"
            }
        }
    )

    success: bool = Field(
        description="Whether task was retrieved successfully"
    )
    task_id: Optional[UUID] = Field(
        default=None,
        description="Task ID (only if success=true)"
    )
    title: Optional[str] = Field(
        default=None,
        description="Task title (only if success=true)"
    )
    description: Optional[str] = Field(
        default=None,
        description="Task description (only if success=true)"
    )
    completed: Optional[bool] = Field(
        default=None,
        description="Whether task is completed (only if success=true)"
    )
    created_at: Optional[datetime] = Field(
        default=None,
        description="Task creation timestamp (only if success=true)"
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        description="Last modification timestamp (only if success=true)"
    )
    message: Optional[str] = Field(
        default=None,
        description="Success message"
    )
    error: Optional[str] = Field(
        default=None,
        description="Error message in plain English (only if success=false)"
    )


# ============================================================================
# TODO_UPDATE Tool - Input & Output Schemas
# ============================================================================

class TodoUpdateInput(BaseModel):
    """Update task fields (PATCH semantics - all fields optional)"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "task_id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Buy groceries at Whole Foods",
                "completed": True
            }
        }
    )

    task_id: UUID = Field(
        description="UUID of task to update (required)"
    )
    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="New task title (optional, 1-255 characters if provided)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=4000,
        description="New task description (optional, max 4000 characters if provided)"
    )
    completed: Optional[bool] = Field(
        default=None,
        description="New completion status (optional, boolean if provided)"
    )


class TodoUpdateOutput(BaseModel):
    """Response from todo_update: updated task details or error"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "task_id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Buy groceries at Whole Foods",
                "description": "Milk, eggs, bread",
                "completed": True,
                "created_at": "2026-02-08T12:00:00Z",
                "updated_at": "2026-02-08T13:30:00Z",
                "message": "Task updated successfully"
            }
        }
    )

    success: bool = Field(
        description="Whether task was updated successfully"
    )
    task_id: Optional[UUID] = Field(
        default=None,
        description="Task ID (only if success=true)"
    )
    title: Optional[str] = Field(
        default=None,
        description="Updated task title (only if success=true)"
    )
    description: Optional[str] = Field(
        default=None,
        description="Updated task description (only if success=true)"
    )
    completed: Optional[bool] = Field(
        default=None,
        description="Updated completion status (only if success=true)"
    )
    created_at: Optional[datetime] = Field(
        default=None,
        description="Task creation timestamp - unchanged (only if success=true)"
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        description="Last modification timestamp - refreshed to current time (only if success=true)"
    )
    message: Optional[str] = Field(
        default=None,
        description="Success message"
    )
    error: Optional[str] = Field(
        default=None,
        description="Error message in plain English (only if success=false)"
    )


# ============================================================================
# TODO_DELETE Tool - Input & Output Schemas
# ============================================================================

class TodoDeleteInput(BaseModel):
    """Delete a task permanently by ID"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "task_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }
    )

    task_id: UUID = Field(
        description="UUID of task to delete (required)"
    )


class TodoDeleteOutput(BaseModel):
    """Response from todo_delete: deleted task ID or error"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "task_id": "123e4567-e89b-12d3-a456-426614174000",
                "message": "Task deleted successfully"
            }
        }
    )

    success: bool = Field(
        description="Whether task was deleted successfully"
    )
    task_id: Optional[UUID] = Field(
        default=None,
        description="UUID of deleted task (only if success=true)"
    )
    message: Optional[str] = Field(
        default=None,
        description="Success message"
    )
    error: Optional[str] = Field(
        default=None,
        description="Error message in plain English (only if success=false)"
    )
