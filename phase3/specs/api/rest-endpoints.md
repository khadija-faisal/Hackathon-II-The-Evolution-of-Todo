# API Specification: REST Endpoints & Conversational AI

**Feature Branches**: `001-web-specs` (Phase II) | `002-ai-chatbot-specs` (Phase III)
**Created**: 2026-01-15 (Phase II) | Updated: 2026-02-07 (Phase III)
**Status**: Active (Phase II) + Expanding (Phase III)

## Overview

All REST endpoints are versioned under `/api/v1/` and follow RESTful conventions. Every endpoint except login and registration requires a valid JWT Bearer token in the Authorization header for authentication and user_id extraction.

## Security & Authentication

### Authorization Requirement

Every protected endpoint MUST include:

```
Authorization: Bearer <jwt_token>
```

Where `<jwt_token>` is a valid JWT token signed with `BETTER_AUTH_SECRET` and containing user_id claim.

**Response for missing/invalid token**: 401 Unauthorized

## Endpoints

### Authentication Endpoints (No user_id required)

#### POST /api/v1/auth/login

**Description**: Authenticate user with email and password; issue JWT token

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com"
  }
}
```

**Error Responses**:
- 400 Bad Request: Invalid email/password format
- 401 Unauthorized: Invalid credentials
- 404 Not Found: User doesn't exist

**Implementation Notes**:
- Uses Pydantic model for request/response validation
- Password verified against bcrypt hash in database
- JWT token issued with 24-hour expiration

---

#### POST /api/v1/auth/register

**Description**: Create new user account with email and password

**Request**:
```json
{
  "email": "newuser@example.com",
  "password": "password123"
}
```

**Success Response (201 Created)**:
```json
{
  "id": "uuid-string",
  "email": "newuser@example.com",
  "created_at": "2026-01-15T10:30:00Z"
}
```

**Error Responses**:
- 400 Bad Request: Email already exists or password too weak
- 422 Unprocessable Entity: Invalid email format

**Implementation Notes**:
- Email must be unique in users table
- Password hashed using bcrypt before storage
- Returns created user object (no password in response)

---

#### POST /api/v1/auth/logout

**Description**: Invalidate current user's session (frontend-initiated; backend clears token validation)

**Request**: Empty body (Authorization header provides user_id)

**Success Response (200 OK)**:
```json
{
  "message": "Logout successful"
}
```

**Implementation Notes**:
- Frontend deletes token from storage
- Backend can optionally track logged-out tokens (blacklist)

---

### Task CRUD Endpoints (JWT Required)

#### POST /api/v1/tasks

**Description**: Create new task for authenticated user

**Authorization**: Required (Bearer token with user_id)

**Request**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Success Response (201 Created)**:
```json
{
  "id": "task-uuid",
  "user_id": "user-uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-15T10:30:00Z"
}
```

**Error Responses**:
- 400 Bad Request: Title missing or invalid
- 401 Unauthorized: Missing or invalid token

**Implementation Notes**:
- user_id extracted from JWT token claims (not from request body)
- created_at and updated_at set to current UTC timestamp
- completed defaults to false
- Response includes full task object

---

#### GET /api/v1/tasks

**Description**: Retrieve all tasks for authenticated user

**Authorization**: Required (Bearer token with user_id)

**Query Parameters** (optional):
- `completed` (boolean): Filter by completion status
- `limit` (integer): Maximum tasks to return (default: 100)
- `offset` (integer): Pagination offset (default: 0)

**Request Example**: `GET /api/v1/tasks?completed=false&limit=20`

**Success Response (200 OK)**:
```json
{
  "tasks": [
    {
      "id": "task-uuid-1",
      "user_id": "user-uuid",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T10:30:00Z"
    },
    {
      "id": "task-uuid-2",
      "user_id": "user-uuid",
      "title": "Complete project",
      "description": "Finish phase 2",
      "completed": true,
      "created_at": "2026-01-14T15:00:00Z",
      "updated_at": "2026-01-15T09:00:00Z"
    }
  ],
  "total": 2
}
```

**Error Responses**:
- 401 Unauthorized: Missing or invalid token

**Implementation Notes**:
- All returned tasks belong exclusively to authenticated user (WHERE user_id = :user_id)
- Tasks ordered by created_at descending (newest first)
- Pagination prevents loading huge task lists

---

#### GET /api/v1/tasks/{task_id}

**Description**: Retrieve specific task by ID

**Authorization**: Required (Bearer token with user_id)

**Path Parameters**:
- `task_id` (string): UUID of task to retrieve

**Request Example**: `GET /api/v1/tasks/task-uuid-1`

**Success Response (200 OK)**:
```json
{
  "id": "task-uuid-1",
  "user_id": "user-uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-15T10:30:00Z"
}
```

**Error Responses**:
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: Task belongs to different user (user_id mismatch)
- 404 Not Found: Task doesn't exist

**Implementation Notes**:
- Backend verifies task.user_id matches authenticated user_id before returning
- Returns 404 if task doesn't exist OR belongs to different user (no distinction)

---

#### PUT /api/v1/tasks/{task_id}

**Description**: Update existing task

**Authorization**: Required (Bearer token with user_id)

**Path Parameters**:
- `task_id` (string): UUID of task to update

**Request**:
```json
{
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, chicken",
  "completed": false
}
```

**Success Response (200 OK)**:
```json
{
  "id": "task-uuid-1",
  "user_id": "user-uuid",
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, chicken",
  "completed": false,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-15T11:45:00Z"
}
```

**Error Responses**:
- 400 Bad Request: Title missing or invalid
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: Task belongs to different user
- 404 Not Found: Task doesn't exist

**Implementation Notes**:
- Only specified fields are updated (partial updates allowed)
- updated_at automatically set to current UTC timestamp
- Backend verifies user_id matches before updating
- Request body cannot override user_id (always from JWT)

---

#### PATCH /api/v1/tasks/{task_id}

**Description**: Partially update task (alternative to PUT)

**Authorization**: Required (Bearer token with user_id)

**Path Parameters**:
- `task_id` (string): UUID of task to update

**Request** (minimal example):
```json
{
  "completed": true
}
```

**Success Response (200 OK)**:
```json
{
  "id": "task-uuid-1",
  "user_id": "user-uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-15T12:00:00Z"
}
```

**Error Responses**: Same as PUT

**Implementation Notes**:
- PATCH semantics: only provided fields are updated
- Behavior functionally identical to PUT in most implementations

---

#### PATCH /api/v1/tasks/{task_id}/complete

**Description**: Toggle or set task completion status (convenience endpoint for completion toggling)

**Authorization**: Required (Bearer token with user_id)

**Path Parameters**:
- `task_id` (string): UUID of task to toggle completion for

**Request** (toggle):
```json
{
  "completed": true
}
```

**Success Response (200 OK)**:
```json
{
  "id": "task-uuid-1",
  "user_id": "user-uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-15T12:00:00Z"
}
```

**Error Responses**:
- 400 Bad Request: Invalid completed value (not boolean)
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: Task belongs to different user
- 404 Not Found: Task doesn't exist

**Security & Implementation Notes**:
- User isolation enforced: Backend verifies `task.user_id == authenticated_user_id` before toggling
- JWT Bearer token extracted from Authorization header; user_id claim used to scope database query
- Request body cannot override user_id (always extracted from JWT)
- `completed` field must be boolean; if provided, task completion status is set to that value
- If `completed` is omitted from request body, returns 400 Bad Request (field required for this endpoint)
- Prevents users from toggling completion status for tasks belonging to other users (403 Forbidden)
- `updated_at` automatically refreshed to current UTC timestamp on successful completion

**Design Rationale**:
- Specialized endpoint for the common use case of marking tasks complete/incomplete
- Reduces API surface complexity compared to generic PATCH when only toggling completion
- Explicit endpoint improves frontend UX (single-purpose action vs. multi-field update)
- Maintains identical security guarantees as generic PATCH: user isolation via `user_id` in JWT + database scope

---

#### DELETE /api/v1/tasks/{task_id}

**Description**: Delete task permanently

**Authorization**: Required (Bearer token with user_id)

**Path Parameters**:
- `task_id` (string): UUID of task to delete

**Request Example**: `DELETE /api/v1/tasks/task-uuid-1`

**Success Response (204 No Content)**: Empty body

**Error Responses**:
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: Task belongs to different user
- 404 Not Found: Task doesn't exist

**Implementation Notes**:
- Physical deletion from database (no soft delete)
- Backend verifies user_id matches before deleting
- Returns 204 No Content (no response body)

---

## Response Format

### Success Response Structure

All successful responses include:
- **HTTP Status**: 200 OK, 201 Created, 204 No Content
- **Content-Type**: application/json
- **Body**: Pydantic model serialized to JSON

### Error Response Structure

All error responses include:
- **HTTP Status**: 400, 401, 403, 404, 422
- **Content-Type**: application/json
- **Body**:
```json
{
  "detail": "Human-readable error message"
}
```

### Common HTTP Status Codes

| Status | Meaning | Scenario |
|--------|---------|----------|
| 200 OK | Request succeeded | Task retrieved, updated |
| 201 Created | Resource created | Task created |
| 204 No Content | Resource deleted | Task deleted |
| 400 Bad Request | Invalid input | Missing required field |
| 401 Unauthorized | Auth token invalid/missing | No Bearer token |
| 403 Forbidden | User lacks permission | Task belongs to different user |
| 404 Not Found | Resource doesn't exist | Task ID doesn't exist |
| 422 Unprocessable Entity | Validation error | Invalid email format |

## Pydantic Models

All request/response bodies use Pydantic models for automatic validation and serialization:

### TaskCreateRequest
```python
- title: str (required, non-empty)
- description: str (optional)
```

### TaskResponse
```python
- id: str (UUID)
- user_id: str (UUID)
- title: str
- description: str
- completed: bool
- created_at: datetime
- updated_at: datetime
```

### UserResponse
```python
- id: str (UUID)
- email: str
- created_at: datetime
```

### AuthResponse
```python
- access_token: str
- token_type: str (always "Bearer")
- user: UserResponse
```

## Data Flow Diagram

```
[Frontend HTTP Request]
        ↓
[Authorization Header Extracted]
        ↓
[JWT Token Verified with BETTER_AUTH_SECRET]
        ↓
[user_id Claim Extracted]
        ↓
[Request Routed to Handler]
        ↓
[Handler Scopes Query: WHERE user_id = :authenticated_user_id]
        ↓
[Pydantic Model Validation]
        ↓
[Database Operation]
        ↓
[Response Serialized to JSON]
        ↓
[HTTP Response Returned]
```

---

## Conversational AI API (Phase III)

**Status**: NEW in Phase III
**Purpose**: Enable natural language task management via OpenAI Agents framework

### Chat Endpoint

#### POST /api/v1/chat

**Description**: Send user message to AI chatbot; agent processes intent and calls MCP Tools

**Authorization**: Required (Bearer token with user_id)

**Request**:
```json
{
  "user_message": "Add a meeting at 2pm tomorrow",
  "conversation_id": "uuid-string-or-null"
}
```

**Request Fields**:
- `user_message` (string, required): Natural language user input
- `conversation_id` (UUID, optional): Existing conversation thread to continue. If null/omitted, creates new conversation.

**Success Response (200 OK)**:
```json
{
  "conversation_id": "conv-uuid-1",
  "message_id": "msg-uuid-agent",
  "user_message": "Add a meeting at 2pm tomorrow",
  "agent_response": "I've created a meeting for tomorrow at 2:00 PM. The task has been added to your task list.",
  "tool_calls": [
    {
      "tool_name": "todo_create",
      "input": {
        "title": "Meeting at 2pm",
        "description": "Tomorrow's scheduled meeting",
        "due_date": "2026-02-08T14:00:00Z"
      },
      "result": {
        "task_id": "task-uuid-new",
        "success": true
      }
    }
  ],
  "created_at": "2026-02-07T14:30:00Z"
}
```

**Response Fields**:
- `conversation_id` (UUID): Conversation thread ID (same as input or newly created)
- `message_id` (UUID): Unique ID for this agent message in database
- `user_message` (string): Echo of user input (for confirmation)
- `agent_response` (string): Natural language response from OpenAI Agent (Markdown supported)
- `tool_calls` (array): Record of MCP Tools called by agent during intent resolution
  - `tool_name` (string): Tool invoked (e.g., `todo_create`, `todo_list`)
  - `input` (object): Parameters passed to Tool
  - `result` (object): Tool result/confirmation
- `created_at` (datetime): Timestamp of agent response

**Error Responses**:
- 400 Bad Request: user_message empty or conversation_id invalid format
- 401 Unauthorized: Missing or invalid JWT token
- 404 Not Found: conversation_id specified but doesn't exist or belongs to different user
- 500 Internal Server Error: OpenAI Agent framework error or Tool execution failure

**Implementation Notes**:
- user_id extracted from JWT token (not from request body)
- conversation_id scoped to authenticated user_id; returns 404 if user doesn't own conversation
- Agent may call multiple Tools in sequence (e.g., "Add task AND show me all tasks")
- All messages (user + agent) stored in database with `conversations` and `messages` tables
- Tool calls logged with inputs and results for auditability
- Agent responses are stateless: no conversation state stored in memory (all history retrieved from DB)

**Statelessness Guarantee**:
- Backend stores NO conversation state in-memory
- Each request independently retrieves conversation history from database
- Agent initialized fresh each request with conversation context from database
- Database is ONLY persistent state (conversation_id, messages, tool_calls, results)
- Horizontal scaling: Any backend instance can handle any conversation (no affinity required)

**Tool Invocation Rules**:
- Agent calls Tools based on user intent (natural language understanding)
- Only relevant Tools are called (agent decides which Tool fits intent)
- Tool calls execute within authenticated user_id context
- All Tool results scoped by user_id (no data leakage between users)
- Tool errors handled gracefully; agent reports back to user conversationally

---

#### GET /api/v1/conversations

**Description**: List all conversation threads for authenticated user

**Authorization**: Required (Bearer token with user_id)

**Query Parameters** (optional):
- `limit` (integer): Maximum conversations to return (default: 50, max: 100)
- `offset` (integer): Pagination offset (default: 0)

**Request Example**: `GET /api/v1/conversations?limit=20&offset=0`

**Success Response (200 OK)**:
```json
{
  "conversations": [
    {
      "id": "conv-uuid-1",
      "user_id": "user-uuid",
      "title": "Task planning session",
      "message_count": 5,
      "created_at": "2026-02-07T10:00:00Z",
      "updated_at": "2026-02-07T14:30:00Z"
    },
    {
      "id": "conv-uuid-2",
      "user_id": "user-uuid",
      "title": "Meeting rescheduling",
      "message_count": 3,
      "created_at": "2026-02-06T15:00:00Z",
      "updated_at": "2026-02-06T16:00:00Z"
    }
  ],
  "total": 12,
  "limit": 20,
  "offset": 0
}
```

**Error Responses**:
- 401 Unauthorized: Missing or invalid token

---

#### GET /api/v1/conversations/{conversation_id}/messages

**Description**: Retrieve all messages in a conversation thread

**Authorization**: Required (Bearer token with user_id)

**Path Parameters**:
- `conversation_id` (UUID): Conversation to retrieve

**Query Parameters** (optional):
- `limit` (integer): Maximum messages to return (default: 100)
- `offset` (integer): Pagination offset (default: 0)

**Request Example**: `GET /api/v1/conversations/conv-uuid-1/messages`

**Success Response (200 OK)**:
```json
{
  "conversation_id": "conv-uuid-1",
  "messages": [
    {
      "id": "msg-uuid-1",
      "role": "user",
      "content": "Add a meeting at 2pm",
      "tool_calls": null,
      "created_at": "2026-02-07T14:25:00Z"
    },
    {
      "id": "msg-uuid-2",
      "role": "agent",
      "content": "I've created a meeting for 2:00 PM.",
      "tool_calls": [
        {
          "tool_name": "todo_create",
          "input": { "title": "Meeting at 2pm" },
          "result": { "task_id": "task-uuid", "success": true }
        }
      ],
      "created_at": "2026-02-07T14:25:30Z"
    }
  ],
  "total": 2
}
```

**Error Responses**:
- 401 Unauthorized: Missing or invalid token
- 404 Not Found: Conversation doesn't exist or belongs to different user

---

## Cross-References

- **Authentication Flow**: See `specs/features/authentication.md`
- **Task CRUD Logic**: See `specs/features/task-crud.md`
- **Database Schema**: See `specs/database/schema.md` (includes conversation/message tables)
- **UI Integration**: See `specs/ui/pages.md` (Phase II) and `specs/ui/chatbot-ui.md` (Phase III)
- **MCP Tools**: Defined in implementation; see `/backend/tools/` for tool definitions
- **OpenAI Agents**: See `002-ai-chatbot-specs` feature documentation
