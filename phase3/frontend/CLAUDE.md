# Frontend Guidelines (Phase 2 + Phase 3 Unified)

## Stack
- **Next.js 15** (App Router, Server Components first)
- **TypeScript** - Type safety across layers
- **Tailwind CSS** - Utility-first styling
- **OpenAI ChatKit** - Agentic chat UI component (Phase 3)

## Core Architecture
Frontend provides **unified UI** supporting both access patterns:
1. **Phase 2 (Dashboard)**: Traditional task management via forms
2. **Phase 3 (Chat)**: Conversational task management via ChatKit

**KEY**: The chat interface is NOT a separate app—it's embedded in the main UI. Users switch between Dashboard and Chat views, sharing the same task list and session context.

## Project Structure
```
frontend/
├── app/
│   ├── layout.tsx               # Root layout + auth wrapper
│   ├── page.tsx                 # Home (redirects to dashboard/chat)
│   ├── dashboard/
│   │   ├── page.tsx             # Task dashboard (Phase 2)
│   │   └── components/
│   │       ├── TaskList.tsx
│   │       └── TaskForm.tsx
│   └── chat/
│       ├── page.tsx             # Chat interface (Phase 3)
│       └── components/
│           └── ChatContainer.tsx # ChatKit wrapper
├── components/
│   ├── Navbar.tsx              # Navigation (Dashboard ↔ Chat toggle)
│   ├── Footer.tsx
│   ├── Layout.tsx              # Common layout wrapper
│   └── TaskCard.tsx            # Shared task display
├── lib/
│   ├── api.ts                  # API client (all backend calls)
│   └── auth.ts                 # JWT token management
└── hooks/
    └── useUserTasks.ts         # Data fetching (shared by both UIs)
```

## Component Patterns

### Server vs Client Components
- **Server Components (Default)**:
  - Layout wrappers, static page frames
  - Data fetching at page level
  - Direct database access (if auth handled server-side)

- **Client Components** (only when needed):
  - Form handling (`'use client'`)
  - Real-time updates (chat messages)
  - Interactive state (collapsible panels, toggles)
  - ChatKit container (requires `'use client'`)

### Shared Components
- `/components/TaskCard.tsx` - Displays task (used by Dashboard + Chat responses)
- `/components/TaskForm.tsx` - Create/edit task form (used by Dashboard + Chat follow-ups)
- `/lib/hooks/useUserTasks.ts` - Data fetching hook (both UIs call API, never localStorage)

## API Client (`/lib/api.ts`)

### Principles
- **Single source of truth**: All backend calls go through this client
- **JWT Management**: Automatically attach `Authorization` header
- **No local storage for task data**: Fetch fresh on each page load
- **Error handling**: Return user-friendly messages

### Usage Pattern
```typescript
// Do NOT use localStorage for tasks
// Always call API for fresh data

import { api } from '@/lib/api'

// Example: Get tasks
const tasks = await api.getTasks()

// Example: Submit chat message
const response = await api.chat({
  message: 'Create task: Buy milk',
  conversation_id: conversationId
})
```

### Key Methods (Reference, not exhaustive)
- `api.getTasks()` - Fetch user's task list
- `api.createTask(title, description, priority)` - Add task
- `api.updateTask(id, updates)` - Modify task
- `api.deleteTask(id)` - Remove task
- `api.chat(message, conversation_id)` - Send message to Agent
- `api.getConversations()` - List chat sessions
- `api.getMessages(conversation_id)` - Retrieve chat history

## State Management

### NO Local Storage for Tasks
- ❌ DO NOT: `localStorage.setItem('tasks', ...)`
- ✅ DO: Fetch via `api.getTasks()` on component mount
- ✅ DO: Re-fetch after mutation (create/update/delete)

### JWT Token Storage
- Store in secure, **HTTP-only cookie** (preferred)
- Or: Browser sessionStorage (if using Better Auth)
- Never expose in localStorage for sensitive data

### Chat State (Phase 3)
- ChatKit manages transient chat UI state (message input, scroll position)
- Conversation history persisted in backend `messages` table
- Retrieve history on page load: `api.getMessages(conversation_id)`

## Phase 2: Dashboard UI

### Pages
- `/dashboard` - Main task list + create form
  - Display tasks from `api.getTasks()`
  - Create form calls `api.createTask()`
  - Edit/Delete via task actions

### Components
- `TaskList` - Renders all user tasks (read-only display)
- `TaskForm` - Create/edit form with validation
- `TaskCard` - Individual task (display + action buttons)

### Example Flow
```
User opens /dashboard
  → Load layout.tsx (auth check)
  → Fetch tasks via useUserTasks hook
  → Render TaskList (maps tasks to TaskCard components)
  → User clicks "Create Task"
  → TaskForm opens (client component with form state)
  → On submit: api.createTask() → re-fetch list
```

## Phase 3: Chat UI

### Pages
- `/chat` - ChatKit-powered chat interface
  - Displays conversation history
  - Sends user messages to Agent
  - Renders Agent responses + Tool calls

### Components
- `ChatContainer` (client component)
  - ChatKit wrapper
  - Handles message submission: `api.chat(message, conversation_id)`
  - Displays Agent responses (parsed markdown)
  - Shows Tool execution results (inline notifications)

### ChatKit Integration
- Use OpenAI ChatKit component for UI
- On mount: Fetch conversation history from `api.getMessages(conversation_id)`
- On message send: Submit to Agent via `api.chat(message, conversation_id)`
- Update chat state with Agent response (local state, transient)
- Do NOT persist chat state to localStorage

### Example Flow
```
User opens /chat
  → Load layout.tsx (auth check)
  → Select conversation (from api.getConversations())
  → Fetch history: api.getMessages(conversation_id)
  → Render ChatKit with history
  → User types message: "Create task: Review code"
  → On send: api.chat({ message, conversation_id })
  → Backend: Agent calls todo_create Tool
  → Response returned: Agent says "I've created the task"
  → ChatKit re-renders with Agent message
  → User can switch to /dashboard to see task (fresh fetch)
```

## Navigation & UI Flow

### Navbar
- Logo / Home link
- **Toggle Button**: "Dashboard" ↔ "Chat"
- User profile menu (logout)
- Desktop: horizontal nav; Mobile: hamburger menu

### Shared Context
- User session (JWT from auth)
- Current conversation ID (if in chat)
- Task count or status (optional badge)

## Styling

### Conventions
- Utility-first Tailwind CSS (no custom CSS unless unavoidable)
- Dark mode support (via Tailwind dark mode or theme provider)
- Responsive design: mobile-first approach
- Accessibility: WCAG AA (semantic HTML, ARIA labels where needed)

### Component Theming
- Define color palette once (e.g., `colors.ts`)
- Apply via Tailwind classes in components
- ChatKit styling: Use Tailwind to override ChatKit defaults if needed

## Task Traceability

Every code file must include a comment linking to specification:
```typescript
// [Task]: T-XXX
// [From]: specs/ui/pages.md §2.1, specs/ui/chatbot-ui.md §3.2
// [Phase]: II (Dashboard) | III (Chat UI)
```

## Environment Setup

### `.env.local`
```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication
NEXT_PUBLIC_BETTER_AUTH_URL=...  # If using Better Auth client-side
```

### Running
```bash
cd frontend && npm run dev
# Open http://localhost:3000
```

## Key Rules (Enforce Strictly)

1. ✅ **Server Components First** → Client components only for interactivity
2. ✅ **API Client Centralized** → All calls through `/lib/api.ts`
3. ✅ **NO Local Storage for Tasks** → API is single source
4. ✅ **Chat is Part of App** → Not a separate single-page chatbot
5. ✅ **JWT Auto-Attached** → API client handles auth header
6. ✅ **ChatKit Transient State** → Database is persistent layer
7. ✅ **Shared Components** → TaskCard, TaskForm used by both UIs
8. ✅ **Task IDs in Code** → Every file references its spec origin
9. ✅ **Error Boundaries** → Graceful failures (show fallback UI)
10. ✅ **Accessibility** → Semantic HTML + ARIA labels

## References
- Spec: `/specs/ui/pages.md` (Phase 2) + `/specs/ui/chatbot-ui.md` (Phase 3)
- Principles: `.specify/memory/constitution.md`