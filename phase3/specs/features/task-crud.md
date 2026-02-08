# Feature Specification: Task CRUD Operations & Natural Language Management

**Feature Branches**: `001-web-specs` (Phase II) | `002-ai-chatbot-specs` (Phase III)
**Created**: 2026-01-15 (Phase II) | Updated: 2026-02-07 (Phase III)
**Status**: Active (Phase II) + Expanding (Phase III)

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

### User Story 5 - Natural Language Task Management (Priority: P1, Phase III)

An authenticated user can manage tasks using conversational natural language in the chatbot interface. The OpenAI Agents framework interprets user intent and calls appropriate MCP Tools to perform CRUD operations.

**Why this priority**: Natural language interface is the core Phase III feature. Users can interact without navigating complex UI hierarchy. This is the primary interaction mode in Phase III.

**Independent Test**: Can be fully tested by user typing natural language queries ("Add a meeting at 2pm", "Show my tasks due today", "Mark the grocery task as done") and verifying the agent calls correct Tools and confirms actions. Delivers value: conversational task management replaces form-based CRUD.

**Acceptance Scenarios**:

1. **Given** authenticated user types "Add a meeting at 2pm tomorrow" in chat, **When** agent processes input, **Then** agent calls `todo_create` Tool with title="Meeting at 2pm" and due_date set to tomorrow at 2pm
2. **Given** user has 3 tasks in database, **When** user types "Show me all my tasks", **Then** agent calls `todo_list` Tool and responds with all 3 tasks in conversational format (Markdown list)
3. **Given** user types "Mark the grocery task as done", **When** agent processes input, **Then** agent calls `todo_list` to find "grocery" task, then calls `todo_update` with completed=true
4. **Given** user types ambiguous query "Update the task", **When** agent cannot determine which task, **Then** agent asks clarifying question ("Which task would you like to update?")
5. **Given** Agent calls Tools, **When** Tool execution completes, **Then** all Tool calls and results are stored in `messages.tool_calls` JSONB field for auditability
6. **Given** user had previous conversation yesterday, **When** user starts new conversation, **Then** old messages remain in database under previous conversation_id; new message in new conversation_id

---

### Edge Cases (Phase III)

- What happens when user types vague intent like "add something"? → Agent asks clarifying question conversationally
- How does agent handle Tool failures (e.g., "task not found")? → Agent handles Tool error gracefully and reports back to user in natural language
- Can multiple agents process same conversation concurrently? → Each request creates fresh Agent instance; conversation history retrieved from DB prevents conflicts
- What if agent calls multiple Tools in sequence (e.g., "create task AND show all")? → All Tool calls recorded in single message's tool_calls array; agent synthesizes combined response
- How are agent responses formatted? → Markdown supported; agent uses bullet lists, bold, code blocks for clarity

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
- **SC-007** (Phase III): AI Agent correctly identifies user intent and maps it to the appropriate MCP Tool with 95%+ accuracy for common task operations (create, list, update, delete)

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
