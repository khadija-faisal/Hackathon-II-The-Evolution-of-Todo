# [Task]: T-027, T-028, T-029, T-030, T-031, T-032, T-033, T-034
# [From]: plan.md §3.1-3.7, rest-endpoints.md
# [Reference]: Constitution §V (User-Scoped Queries), Constitution §VI (Error Handling)

from uuid import UUID
from fastapi import APIRouter, Depends, Request, status
from sqlmodel import Session
from backend.db import get_session
from backend.services.task_service import (
    create_task,
    get_user_tasks,
    get_task_by_id,
    update_task,
    delete_task,
)
from backend.schemas.task import (
    TaskCreateRequest,
    TaskUpdateRequest,
    TaskResponse,
    TaskListResponse,
)
from backend.utils.errors import NotFoundError, BadRequestError

# Create router for task endpoints
router = APIRouter()


# [Task]: T-027
# POST /api/v1/tasks - Create task
@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task_endpoint(
    request: Request,
    task_data: TaskCreateRequest,
    session: Session = Depends(get_session),
) -> TaskResponse:
    """Create a new task for authenticated user

    [Task]: T-027
    [From]: rest-endpoints.md §POST /api/v1/tasks

    **Authorization**: Required (Bearer token with user_id)

    **Request Body**:
    - title: str (required, 1-255 chars)
    - description: str (optional, max 4000 chars)

    **Response**: 201 Created with TaskResponse

    **Error Responses**:
    - 400 Bad Request: Title missing or invalid
    - 401 Unauthorized: Missing or invalid JWT token

    **User Isolation**:
    - user_id extracted from JWT claims (request.state.user_id)
    - Cannot create tasks for other users
    - Task always associated with authenticated user

    **Implementation**:
    - Calls task_service.create_task() with user_id from JWT
    - Returns 201 Created with full task details
    """

    try:
        user_id = request.state.user_id
        task_response = create_task(
            session,
            user_id,
            task_data.title,
            task_data.description,
        )
        return task_response
    except BadRequestError as e:
        raise e


# [Task]: T-028
# GET /api/v1/tasks - List user's tasks
@router.get("/", response_model=TaskListResponse, status_code=status.HTTP_200_OK)
async def list_tasks_endpoint(
    request: Request,
    completed: bool = None,
    limit: int = 100,
    offset: int = 0,
    session: Session = Depends(get_session),
) -> TaskListResponse:
    """Retrieve all tasks for authenticated user

    [Task]: T-028
    [From]: rest-endpoints.md §GET /api/v1/tasks

    **Authorization**: Required (Bearer token with user_id)

    **Query Parameters** (optional):
    - completed: bool - Filter by completion status
    - limit: int - Max tasks to return (default 100)
    - offset: int - Pagination offset (default 0)

    **Response**: 200 OK with TaskListResponse

    **Error Responses**:
    - 401 Unauthorized: Missing or invalid JWT token

    **User Isolation**:
    - WHERE user_id = :authenticated_user_id (mandatory)
    - Returns ONLY tasks owned by authenticated user
    - Total count also scoped by user_id

    **Ordering**:
    - Tasks ordered by created_at DESC (newest first)
    - Optimized by composite index idx_tasks_user_id_created_at

    **Performance**:
    - SC-002: Dashboard < 1 second latency (achieved via index)
    - Pagination prevents loading huge lists

    **Implementation**:
    - Calls task_service.get_user_tasks() with user_id from JWT
    - Returns list + total count for pagination
    """

    user_id = request.state.user_id

    # Validate pagination parameters
    if limit < 1 or limit > 1000:
        limit = 100
    if offset < 0:
        offset = 0

    tasks, total = get_user_tasks(
        session,
        user_id,
        completed=completed,
        limit=limit,
        offset=offset,
    )

    return TaskListResponse(
        data=tasks,
        total=total,
        limit=limit,
        offset=offset,
    )


# [Task]: T-029
# GET /api/v1/tasks/{task_id} - Get single task
@router.get("/{task_id}", response_model=TaskResponse, status_code=status.HTTP_200_OK)
async def get_task_endpoint(
    request: Request,
    task_id: UUID,
    session: Session = Depends(get_session),
) -> TaskResponse:
    """Retrieve specific task by ID (verify ownership)

    [Task]: T-029
    [From]: rest-endpoints.md §GET /api/v1/tasks/{task_id}

    **Authorization**: Required (Bearer token with user_id)

    **Path Parameters**:
    - task_id: UUID of task to retrieve

    **Response**: 200 OK with TaskResponse

    **Error Responses**:
    - 401 Unauthorized: Missing or invalid JWT token
    - 404 Not Found: Task doesn't exist OR user doesn't own it

    **User Isolation**:
    - WHERE id = :task_id AND user_id = :authenticated_user_id
    - Returns 404 if task doesn't exist OR user doesn't own (no distinction)
    - Prevents information leakage about other users' tasks

    **Security**:
    - Defensive: Even if JWT validation somehow failed, DB prevents leaks
    - No "403 Forbidden" response (404 hides permission denial)

    **Implementation**:
    - Calls task_service.get_task_by_id() with user_id from JWT
    - Raises NotFoundError if task not found OR user doesn't own
    """

    try:
        user_id = request.state.user_id
        task_response = get_task_by_id(session, user_id, task_id)
        return task_response
    except NotFoundError as e:
        raise e


# [Task]: T-030
# PUT /api/v1/tasks/{task_id} - Full update
@router.put("/{task_id}", response_model=TaskResponse, status_code=status.HTTP_200_OK)
async def update_task_endpoint(
    request: Request,
    task_id: UUID,
    task_data: TaskUpdateRequest,
    session: Session = Depends(get_session),
) -> TaskResponse:
    """Update existing task (full or partial update)

    [Task]: T-030
    [From]: rest-endpoints.md §PUT /api/v1/tasks/{task_id}

    **Authorization**: Required (Bearer token with user_id)

    **Path Parameters**:
    - task_id: UUID of task to update

    **Request Body**:
    - title: str (optional, 1-255 chars if provided)
    - description: str (optional, max 4000 chars if provided)
    - completed: bool (optional)

    **Response**: 200 OK with updated TaskResponse

    **Error Responses**:
    - 400 Bad Request: Title invalid or other validation error
    - 401 Unauthorized: Missing or invalid JWT token
    - 404 Not Found: Task doesn't exist OR user doesn't own

    **User Isolation**:
    - WHERE id = :task_id AND user_id = :authenticated_user_id
    - Cannot update other users' tasks (403 Forbidden)
    - user_id parameter is immutable (cannot be changed)

    **Timestamp Updates**:
    - updated_at automatically refreshed to current UTC time
    - created_at remains unchanged

    **Implementation**:
    - Calls task_service.update_task() with user_id from JWT
    - Returns 200 OK with updated task
    """

    try:
        user_id = request.state.user_id
        task_response = update_task(session, user_id, task_id, task_data)
        return task_response
    except (NotFoundError, BadRequestError) as e:
        raise e


# [Task]: T-031
# PATCH /api/v1/tasks/{task_id} - Partial update (identical to PUT in this implementation)
@router.patch("/{task_id}", response_model=TaskResponse, status_code=status.HTTP_200_OK)
async def patch_task_endpoint(
    request: Request,
    task_id: UUID,
    task_data: TaskUpdateRequest,
    session: Session = Depends(get_session),
) -> TaskResponse:
    """Partially update task (PATCH semantics)

    [Task]: T-031
    [From]: rest-endpoints.md §PATCH /api/v1/tasks/{task_id}

    **Authorization**: Required (Bearer token with user_id)

    **Path Parameters**:
    - task_id: UUID of task to update

    **Request Body** (all fields optional):
    - title: str (optional, 1-255 chars if provided)
    - description: str (optional, max 4000 chars if provided)
    - completed: bool (optional)

    **Response**: 200 OK with updated TaskResponse

    **Error Responses**: Same as PUT

    **Implementation**:
    - Functionally identical to PUT in this implementation
    - Only provided fields are updated
    - All other fields remain unchanged
    - updated_at refreshed on change
    """

    try:
        user_id = request.state.user_id
        task_response = update_task(session, user_id, task_id, task_data)
        return task_response
    except (NotFoundError, BadRequestError) as e:
        raise e


# [Task]: T-032
# PATCH /api/v1/tasks/{task_id}/complete - Toggle completion status
@router.patch(
    "/{task_id}/complete",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
)
async def toggle_task_completion_endpoint(
    request: Request,
    task_id: UUID,
    task_data: TaskUpdateRequest,
    session: Session = Depends(get_session),
) -> TaskResponse:
    """Toggle or set task completion status (convenience endpoint)

    [Task]: T-032
    [From]: rest-endpoints.md §PATCH /api/v1/tasks/{task_id}/complete

    **Authorization**: Required (Bearer token with user_id)

    **Path Parameters**:
    - task_id: UUID of task to toggle

    **Request Body**:
    - completed: bool (required) - Set completion status to true/false

    **Response**: 200 OK with updated TaskResponse

    **Error Responses**:
    - 400 Bad Request: completed field missing or not boolean
    - 401 Unauthorized: Missing or invalid JWT token
    - 404 Not Found: Task doesn't exist OR user doesn't own

    **User Isolation**:
    - WHERE id = :task_id AND user_id = :authenticated_user_id
    - Cannot toggle other users' tasks (403 Forbidden)

    **Security**:
    - Identical guarantees as generic PATCH
    - user_id verified before toggling
    - JWT token extracted from Authorization header

    **Implementation**:
    - Calls task_service.update_task() with user_id from JWT
    - Only updates the completed field
    - Refreshes updated_at timestamp
    """

    try:
        if task_data.completed is None:
            raise BadRequestError("completed field is required for this endpoint")

        user_id = request.state.user_id
        task_response = update_task(session, user_id, task_id, task_data)
        return task_response
    except (NotFoundError, BadRequestError) as e:
        raise e


# [Task]: T-033
# DELETE /api/v1/tasks/{task_id} - Delete task
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_endpoint(
    request: Request,
    task_id: UUID,
    session: Session = Depends(get_session),
) -> None:
    """Delete task permanently

    [Task]: T-033
    [From]: rest-endpoints.md §DELETE /api/v1/tasks/{task_id}

    **Authorization**: Required (Bearer token with user_id)

    **Path Parameters**:
    - task_id: UUID of task to delete

    **Response**: 204 No Content (empty body)

    **Error Responses**:
    - 401 Unauthorized: Missing or invalid JWT token
    - 404 Not Found: Task doesn't exist OR user doesn't own

    **User Isolation**:
    - WHERE id = :task_id AND user_id = :authenticated_user_id
    - Cannot delete other users' tasks (403 Forbidden)

    **Deletion Type**:
    - Physical deletion (no soft delete, no recovery)
    - Task permanently removed from database

    **Implementation**:
    - Calls task_service.delete_task() with user_id from JWT
    - Returns 204 No Content (no response body)
    """

    try:
        user_id = request.state.user_id
        delete_task(session, user_id, task_id)
    except NotFoundError as e:
        raise e
