# Todo App - Hackathon Phase II: Project Overview

## Evolution from Phase I to Phase II

**Phase I** delivered a console-based CLI todo application with core task management functionality: users could create, read, update, and delete tasks via command-line interface with local file persistence.

**Phase II** evolves this into a secure, multi-user web application by introducing:
- **Web UI** (Next.js 15 with App Router) replacing console interface
- **Multi-user isolation** with JWT-based authentication via Better Auth
- **Persistent cloud storage** using Neon PostgreSQL database
- **RESTful API backend** (FastAPI) for secure, scalable task operations
- **User authentication** with secure token management

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | Server-rendered web UI with client-side interactivity |
| **Backend** | FastAPI (Python) | High-performance REST API with automatic validation |
| **Database** | Neon PostgreSQL | Cloud-hosted relational database for persistent storage |
| **ORM** | SQLModel | SQL database ORM combining SQLAlchemy and Pydantic |
| **Authentication** | Better Auth | Secure JWT token generation and verification |
| **API Responses** | Pydantic Models | Type-safe serialization for all API responses |

## Architecture: JWT Bridge Pattern

The application implements a **JWT Bridge** architecture ensuring secure multi-user isolation:

```
[Frontend (Next.js)]
        ↓ (HTTP + Bearer Token)
        ↓
[Backend API (FastAPI)]
        ├─→ JWT Verification (BETTER_AUTH_SECRET)
        ├─→ Extract user_id from token claims
        ├─→ Scope all queries to user_id
        ↓
[Database (Neon PostgreSQL)]
        └─→ user_id Foreign Key Constraint
```

### Security Guarantees

1. **User Isolation**: Every database query filtered by `user_id` from authenticated JWT token
2. **No Shared Data**: Task records include `user_id` foreign key; users never see other users' tasks
3. **Token Verification**: Every API request validates `Authorization: Bearer <token>` using `BETTER_AUTH_SECRET`
4. **No Local Storage**: All persistence happens in PostgreSQL; no browser-based data storage

## Core Features

### Feature 1: User Authentication
- Users log in via email/password with Better Auth
- Backend issues JWT token with user_id claim
- Token used to authorize subsequent API requests

### Feature 2: Task Management (CRUD Operations)
- **Create**: Authenticated users create tasks scoped to their user_id
- **Read**: Users retrieve only their own tasks from the database
- **Update**: Users modify only their own tasks
- **Delete**: Users delete only their own tasks

### Feature 3: Web User Interface
- **Login Page**: Email/password authentication form
- **Dashboard**: List of user's tasks with CRUD actions
- **Task Form**: Create and edit tasks with title and description

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
