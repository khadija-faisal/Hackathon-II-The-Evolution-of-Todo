# Feature Specification: Task CRUD Operations

**Feature Branch**: `001-web-specs`
**Created**: 2026-01-15
**Status**: Active

## User Scenarios & Testing

### User Story 1 - Create Task (Priority: P1)

An authenticated user can create a new task with a title and optional description. The task is immediately stored in the database and associated with the user's account.

**Why this priority**: Creating tasks is the core functionality; without this, the app is not usable. This is the MVP entry point.

**Independent Test**: Can be fully tested by user logging in, submitting a task creation form, and verifying the task appears in their task list. Delivers immediate value: users can begin capturing their work.

**Acceptance Scenarios**:

1. **Given** user is authenticated and on task creation form, **When** user enters title "Buy groceries" and clicks Create, **Then** task is created with completed=false and current timestamp
2. **Given** user creates a task with title and description, **When** task is saved, **Then** both title and description are stored in database
3. **Given** user creates a task, **When** task is saved, **Then** created_at and updated_at are set to current time
4. **Given** two different users each create a task with the same title, **When** tasks are retrieved, **Then** each user sees only their own task (user_id isolation verified)

---

### User Story 2 - Read/List Tasks (Priority: P1)

An authenticated user can view all tasks they have created. The dashboard displays their task list with status indicators.

**Why this priority**: Reading tasks is equally critical to creation. Users must see what they've created for the app to be functional.

**Independent Test**: Can be fully tested by user logging in and seeing their dashboard with task list. Delivers value: users can see their current work.

**Acceptance Scenarios**:

1. **Given** authenticated user with 3 tasks in database, **When** user views dashboard, **Then** exactly 3 tasks are displayed
2. **Given** user has completed tasks and incomplete tasks, **When** viewing dashboard, **Then** completion status is shown for each task
3. **Given** two users each with different tasks, **When** user A logs in, **Then** user A sees only their tasks, not user B's tasks
4. **Given** task was created 2 days ago, **When** viewing dashboard, **Then** creation date is displayed with proper timestamp

---

### User Story 3 - Update Task (Priority: P2)

An authenticated user can modify an existing task's title, description, or completion status.

**Why this priority**: Update capability is essential for task management but slightly lower priority than creation/reading. Users can still be productive with create + read functionality alone.

**Independent Test**: Can be fully tested by user creating a task, editing it, and verifying changes are persisted. Delivers value: users can refine task details as priorities change.

**Acceptance Scenarios**:

1. **Given** user has an existing incomplete task, **When** user marks it as completed, **Then** completed field is set to true and updated_at timestamp is refreshed
2. **Given** user edits task title from "Buy groceries" to "Buy organic groceries", **When** task is saved, **Then** title is updated in database
3. **Given** user attempts to edit another user's task, **When** request is made, **Then** operation is rejected (user_id mismatch)
4. **Given** user updates task description, **When** task is saved, **Then** updated_at timestamp reflects change time

---

### User Story 4 - Delete Task (Priority: P2)

An authenticated user can permanently remove a task from their task list.

**Why this priority**: Delete is important for housekeeping but users can still be productive without it for demonstration purposes. Included in MVP after core functionality is solid.

**Independent Test**: Can be fully tested by user creating a task, deleting it, and verifying it no longer appears in their list. Delivers value: users can remove completed or no-longer-relevant tasks.

**Acceptance Scenarios**:

1. **Given** user has an existing task, **When** user requests task deletion, **Then** task is removed from database
2. **Given** task is deleted, **When** user views dashboard, **Then** deleted task no longer appears in their list
3. **Given** user attempts to delete another user's task, **When** request is made, **Then** operation is rejected (user_id mismatch)
4. **Given** user has 5 tasks and deletes 1, **When** dashboard refreshes, **Then** exactly 4 tasks remain

---

### Edge Cases

- What happens when user creates a task with empty/whitespace-only title? → Validation prevents empty titles
- How does system handle user attempting CRUD operation on task created by different user? → Operation rejected; error message returned
- What happens if task database record is corrupted or missing? → API returns 404 error; task removed from user's view
- How are tasks ordered in the list? → By created_at descending (newest first); maintained by database query
- Can user update another user's task through direct API call with modified user_id? → No; backend extracts user_id from JWT token, never accepts user_id from request body

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create new tasks with title (required) and description (optional)
- **FR-002**: System MUST associate each task with the user_id extracted from the JWT token at creation time
- **FR-003**: System MUST persist task data in Neon PostgreSQL database with fields: id, user_id, title, description, completed (default: false), created_at, updated_at
- **FR-004**: Users MUST be able to retrieve only tasks belonging to their user_id; database queries filtered by WHERE user_id = authenticated_user_id
- **FR-005**: System MUST prevent users from viewing, modifying, or deleting tasks created by other users (user_id isolation enforced)
- **FR-006**: Users MUST be able to update task title, description, or completed status for their own tasks
- **FR-007**: System MUST update the updated_at timestamp whenever a task is modified
- **FR-008**: Users MUST be able to delete tasks they own; deleted tasks are permanently removed from database
- **FR-009**: All task CRUD operations MUST require a valid JWT Bearer token in the Authorization header
- **FR-010**: System MUST validate that titles are non-empty strings and descriptions are optional strings
- **FR-011**: System MUST return Pydantic model responses with proper HTTP status codes (201 Created, 200 OK, 400 Bad Request, 404 Not Found, 401 Unauthorized)

### Key Entities

- **Task**: Represents a user's todo item with title, description, completion status, timestamps, and user_id foreign key for multi-user isolation
- **User**: Represents an authenticated user account; referenced by tasks via user_id foreign key to enforce data isolation

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can create a task in under 2 seconds from form submission to database confirmation
- **SC-002**: Task list displays on user dashboard with no more than 1 second latency (user-perceived as instant)
- **SC-003**: 100% of CRUD operations for the authenticated user succeed; operations on other users' tasks fail with 403 Forbidden
- **SC-004**: All tasks displayed to a user belong exclusively to that user (user_id isolation verified with 100% accuracy)
- **SC-005**: User can complete typical workflows (create 3 tasks, view list, update 1 task, delete 1 task) in under 5 minutes
- **SC-006**: System maintains task data consistency across concurrent operations from the same user

## Assumptions

- Task title is required; description is optional (common todo app pattern)
- Tasks display in reverse chronological order by creation (newest first) unless specified otherwise
- "Completed" status is a simple boolean toggle; no complex workflow states
- Users cannot share or transfer task ownership (single owner per task)
- Soft deletes are not required; physical deletion is acceptable for demonstration purposes
- Pydantic models provide automatic validation; additional validation logic kept minimal

## Completion Status Update (API Implementation Detail)

The completion status for tasks is updated via the generic `PATCH /api/v1/tasks/{task_id}` endpoint, which accepts partial updates including the `completed` boolean field. Additionally, a specialized convenience endpoint `PATCH /api/v1/tasks/{task_id}/complete` is available for scenarios where only the completion status is being toggled, improving UX for the common case of marking tasks complete/incomplete.

**Both endpoints enforce identical security guarantees:**
- JWT Bearer token required in Authorization header
- Backend extracts `user_id` from JWT claims
- Database query scoped to authenticated user: `WHERE user_id = :user_id`
- Prevents cross-user task completion manipulation (403 Forbidden if user_id mismatch)
- `updated_at` timestamp automatically refreshed on completion status change
