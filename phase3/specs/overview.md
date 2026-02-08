# Todo App with AI-Powered Chatbot - Hackathon Phase III: Project Overview

**Feature Branches**: `001-web-specs` (Phase II) | `002-ai-chatbot-specs` (Phase III)

## Evolution from Phase I to Phase III

**Phase I** delivered a console-based CLI todo application with core task management functionality: users could create, read, update, and delete tasks via command-line interface with local file persistence.

**Phase II** (RETAINED) evolves the CLI into a secure, multi-user web application:
- **Web UI** (Next.js 15 with App Router) replacing console interface
- **Multi-user isolation** with JWT-based authentication via Better Auth
- **Persistent cloud storage** using Neon PostgreSQL database
- **RESTful API backend** (FastAPI) for secure, scalable task operations
- **User authentication** with secure token management

**Phase III** (NEW) adds Conversational AI capabilities to Phase II foundation:
- **Agentic Chat Interface** powered by OpenAI Agents framework
- **Natural Language Task Management** via conversational intent recognition
- **MCP Server Architecture** with CRUD operations exposed as discoverable Tools
- **Conversation Persistence** tracking all user-agent exchanges in database
- **OpenAI ChatKit UI** for modern chat-based interaction
- **Stateless Chatbot** enforcing zero in-memory state (all data → database)

## Technology Stack

| Component | Technology | Purpose | Phase |
|-----------|-----------|---------|-------|
| **Frontend** | Next.js 15 (App Router) | Server-rendered web UI with client-side interactivity | II |
| **Backend** | FastAPI (Python) | High-performance REST API with automatic validation | II |
| **Database** | Neon PostgreSQL | Cloud-hosted relational database for persistent storage | II |
| **ORM** | SQLModel | SQL database ORM combining SQLAlchemy and Pydantic | II |
| **Authentication** | Better Auth | Secure JWT token generation and verification | II |
| **API Responses** | Pydantic Models | Type-safe serialization for all API responses | II |
| **MCP Server** | Official MCP SDK | Model Context Protocol for exposing CRUD as Tools | III |
| **AI Orchestration** | OpenAI Agents SDK | Intelligent intent-based agent framework | III |
| **Chat UI** | OpenAI ChatKit | Modern chat interface components & message handling | III |
| **Conversation Storage** | Neon PostgreSQL | Database tables for conversation history & messages | III |

## Architecture: JWT Bridge + Agentic Chatbot Pattern

The application implements a **JWT Bridge** (Phase II) with **Agentic Chatbot** layer (Phase III):

```
PHASE II (Web UI):
[Frontend (Next.js + Better Auth)]
        ↓ (HTTP + JWT Bearer Token)
        ↓
[FastAPI Backend - REST Endpoints]
        ├─→ JWT Verification (BETTER_AUTH_SECRET)
        ├─→ Extract user_id from token claims
        ├─→ Scope all queries to user_id
        ↓
[Database (Neon PostgreSQL)]
        └─→ user_id Foreign Key Constraint

PHASE III (Agentic Chat):
[ChatKit UI Component (Next.js Client)]
        ↓ (User natural language message)
        ↓
[Chat Endpoint (FastAPI + JWT)]
        ├─→ JWT Verification
        ├─→ Store user message in conversations table
        ↓
[OpenAI Agents Framework]
        ├─→ Parse user intent
        ├─→ Select & call MCP Tools
        ↓
[MCP Server + Tools (FastAPI)]
        ├─→ todo_create, todo_read, todo_update, todo_delete, todo_list
        ├─→ Verify user_id access
        ├─→ Execute CRUD operations
        ↓
[Database (Neon PostgreSQL)]
        ├─→ tasks table (Phase II)
        ├─→ conversations table (NEW)
        ├─→ messages table (NEW)
        └─→ All scoped by user_id

[Agent Response Synthesis]
        ↓
[Store agent message + Tool calls in database]
        ↓
[Return to ChatKit UI]
```

### Security Guarantees

1. **User Isolation**: Every database query filtered by `user_id` from authenticated JWT token
2. **No Shared Data**: Task records include `user_id` foreign key; users never see other users' tasks
3. **Token Verification**: Every API request validates `Authorization: Bearer <token>` using `BETTER_AUTH_SECRET`
4. **No Local Storage**: All persistence happens in PostgreSQL; no browser-based data storage

## Core Features

### Phase II Features (RETAINED)

#### Feature 1: User Authentication
- Users log in via email/password with Better Auth
- Backend issues JWT token with user_id claim
- Token used to authorize subsequent API requests

#### Feature 2: Task Management (CRUD Operations)
- **Create**: Authenticated users create tasks scoped to their user_id
- **Read**: Users retrieve only their own tasks from the database
- **Update**: Users modify only their own tasks
- **Delete**: Users delete only their own tasks

#### Feature 3: Web User Interface
- **Login Page**: Email/password authentication form
- **Dashboard**: List of user's tasks with CRUD actions
- **Task Form**: Create and edit tasks with title and description

### Phase III Features (NEW)

#### Feature 4: Conversational AI Chatbot
- Users interact via natural language in ChatKit chat interface
- OpenAI Agents framework interprets user intent
- Agent calls appropriate MCP Tools to perform CRUD operations

#### Feature 5: Natural Language Task Management
- Examples: "Add a meeting at 2pm", "Show me all tasks due today", "Mark the grocery task as done"
- Agent translates natural language to Tool calls (e.g., "Add a meeting" → `todo_create`)
- Agent provides conversational response with confirmation

#### Feature 6: Conversation History
- All user-agent exchanges stored in database
- Users can view past conversations
- Messages track which Tools were called and their results
- Enables conversation replay and auditability

## Data Model: User Isolation

All data operations enforce user_id-based isolation:

```
users table (plural, lowercase)
├─ id (Primary Key)
├─ email (Unique)
├─ password_hash
├─ created_at
└─ updated_at

tasks table (plural, lowercase)
├─ id (Primary Key)
├─ user_id (Foreign Key → users.id)
├─ title
├─ description
├─ completed (boolean)
├─ created_at
└─ updated_at
```

## Non-Functional Requirements

- **Performance**: API responds to requests within 200ms (user-perceived as instant)
- **Availability**: System supports 1000 concurrent authenticated users
- **Security**: All sensitive operations require valid JWT token; password stored as hash
- **Data Consistency**: Database constraints enforce user_id relationships; no orphaned tasks
- **Scalability**: Neon PostgreSQL handles growing task volume without degradation

## Key Constraints (from Constitution)

1. **Multi-user isolation is non-negotiable**: Every task query includes `WHERE user_id = :user_id`
2. **No local storage for data**: Browser localStorage only stores JWT token; all tasks persist in PostgreSQL
3. **API responses use Pydantic models**: Type safety and automatic validation
4. **All REST endpoints require JWT Bearer token**: No anonymous task operations
