# UI Specification: Agentic Chat Interface with OpenAI ChatKit

**Feature Branches**: `002-ai-chatbot-specs` (Phase III)
**Created**: 2026-02-07
**Status**: Specification

---

## Overview

The chatbot UI provides a conversational interface powered by OpenAI ChatKit components. Users interact with an AI Agent via natural language, eliminating the need for traditional task management forms. The interface consists of:

1. **Sidebar**: Conversation history and management
2. **Main Chat Area**: Message display and user input
3. **Real-time Streaming**: Agent responses stream as they're generated

---

## Layout Architecture

### Desktop Layout (1024px+)

```
┌─────────────────────────────────────────┐
│  Logout | Settings                      │
├──────────────┬──────────────────────────┤
│              │                          │
│ Sidebar      │   Chat Message Area     │
│              │                          │
│ • Recent     │  ┌────────────────────┐ │
│   Convs      │  │ User: "Add a       │ │
│              │  │ meeting at 2pm"    │ │
│ • New Conv   │  └────────────────────┘ │
│              │  ┌────────────────────┐ │
│ • Search     │  │ Agent: "I've       │ │
│              │  │ created a meeting… │ │
│              │  └────────────────────┘ │
│              │                          │
│              │  ┌────────────────────┐ │
│              │  │ [Input field]      │ │
│              │  │ [Send button]      │ │
│              │  └────────────────────┘ │
├──────────────┴──────────────────────────┤
│  Status: Agent processing...            │
└─────────────────────────────────────────┘
```

### Mobile Layout (< 1024px)

```
┌─────────────────────────────┐
│ ☰ | Conversations | Logout  │
├─────────────────────────────┤
│  Chat Message Area (Full)   │
│                             │
│ User: "Add meeting at 2pm"  │
│                             │
│ Agent: "I've created..."    │
│                             │
├─────────────────────────────┤
│ [Input field]               │
│ [Send button]               │
├─────────────────────────────┤
│ Status: Agent processing... │
└─────────────────────────────┘

[Sidebar revealed via hamburger menu]
```

---

## Component Specifications

### 1. Sidebar: Conversation History

**Component**: `ConversationSidebar`

**Features**:
- Displays list of recent conversations (default: last 20)
- Each conversation shows title + last message timestamp
- Current conversation highlighted
- Click conversation to load thread
- Hover shows "Delete conversation" option
- "New Conversation" button at top creates fresh thread

**Styling**:
- Width: 300px (desktop), hidden/collapsible (mobile)
- Background: Light gray (matches Next.js pattern)
- Border-right: Subtle divider
- Font: 14px for conversation titles, 12px for timestamps
- Scrollable with 10 max height before overflow

**Sorting**:
- Most recent first (ordered by conversation.updated_at DESC)
- Pagination: Load 20 at a time; infinite scroll loads more

**Actions**:
- Click: Load conversation thread
- Right-click/menu: Delete conversation (with confirmation)
- Search field: Filter conversations by title or message content (optional Phase III.1)

### 2. Main Chat Area: Message Display

**Component**: `ChatMessageArea` (powered by ChatKit)

**Message Rendering**:

**User Message Bubble**:
- Aligned to right
- Background: Light blue (#E3F2FD or similar)
- Text color: Dark gray
- Font: 14px, sans-serif
- Padding: 12px 16px
- Border-radius: 12px (rounded corners)
- Max-width: 70% of container
- Timestamp below message (12px, lighter color)

**Agent Message Bubble**:
- Aligned to left
- Background: White / subtle gray (#F5F5F5)
- Border: 1px solid #E0E0E0
- Text color: Dark gray
- Font: 14px, sans-serif
- Padding: 12px 16px
- Border-radius: 12px
- Max-width: 70% of container
- Timestamp below message
- **Markdown support**: Agent responses support bold, italics, code blocks, bullet lists

**Message Content**:

```markdown
# Agent Response Example:

I've created a meeting for tomorrow at 2:00 PM. Here's the confirmation:

- **Task**: Meeting at 2pm
- **Due**: 2026-02-08 14:00:00
- **Status**: Created

Would you like me to do anything else?
```

**Tool Call Visualization** (Optional, for transparency):
- Collapsible "Tool Calls" section below agent message
- Shows Tool name, input parameters, and result
- Format: `"Called tool_create with title='Meeting at 2pm'"`
- Expandable for debugging/transparency

**Streaming Response**:
- Agent response streams character-by-character (if OpenAI API supports streaming)
- Loading indicator while streaming ("Agent is thinking...")
- Message completes and Tool calls displayed once done

### 3. User Input Area

**Component**: `ChatInput` (powered by ChatKit)

**Features**:
- Multi-line text input field
- Placeholder: "Type your message or natural language command (e.g., 'Add a task...')"
- Send button to right of input
- Character counter (optional): Show "XYZ characters"
- Submit on Enter key; Shift+Enter for newline

**Styling**:
- Input field: 100% width, min-height 80px
- Border: 1px solid #D0D0D0; focus: 2px solid #1976D2
- Padding: 12px
- Font: 14px, sans-serif
- Background: White
- Send button: Material Design style, blue (#1976D2), white text, 36px square

**States**:
- Empty state: Send button disabled (grayed out)
- Loading state: Send button shows spinner; input disabled (user cannot submit while agent processing)
- Error state: Red border on input + error message below

**Keyboard Support**:
- Enter: Send message
- Shift+Enter: New line
- Ctrl+A: Select all
- Tab: Accessibility navigation

### 4. Status Bar (Footer)

**Component**: `StatusBar`

**Displays**:
- **Default**: Conversation ID (copy to clipboard icon) + "Ready"
- **Loading**: "Agent is processing... (2s elapsed)" [timer updates]
- **Error**: "Error: [User-friendly message]" in red
- **Streaming**: "Receiving response..." with ellipsis animation

**Styling**:
- Height: 32px
- Background: Light gray
- Text: 12px, centered
- Border-top: 1px solid #E0E0E0

---

## User Interactions & Flows

### Flow 1: Create New Conversation

1. User clicks "New Conversation" button
2. System creates new conversation_id
3. Chat area clears; shows "Start your conversation..."
4. Input field focused
5. User types natural language message
6. On send: Message appears in chat (user bubble, right-aligned)
7. Status shows "Agent is processing..."
8. Agent processes, calls Tools
9. Agent response streams to chat (agent bubble, left-aligned)
10. Tool confirmation included ("I've created a meeting...")
11. Sidebar updates with new conversation title (auto-generated from first message or user-provided)

### Flow 2: Continue Existing Conversation

1. User clicks conversation in sidebar
2. Chat area loads all previous messages
3. Messages appear in chronological order (oldest at top)
4. Newest message at bottom with input field
5. User types new message
6. Same flow as Flow 1 from step 6 onward

### Flow 3: Ambiguous Intent Handling

1. User types vague query: "Update the task"
2. Agent recognizes ambiguity
3. Agent responds: "I found multiple tasks. Which one would you like to update?"
4. User clarifies: "The meeting task"
5. Agent proceeds with update (if successful)

### Flow 4: View Conversation History

1. Sidebar displays all conversations (scrollable)
2. Most recent at top
3. User hovers over conversation
4. "Delete" icon appears
5. Click delete → confirmation dialog
6. Confirm → conversation deleted (and all messages)

---

## Real-time Streaming & Responsiveness

### Streaming Response Behavior

- Agent response streams token-by-token (if OpenAI API supports)
- User sees Agent message bubble appear and grow as text arrives
- No lag between token generation and display (sub-100ms)
- Loading indicator removed once complete

### Real-time Message Persistence

- User message persisted to DB immediately on send (optimistic UI)
- Agent message streamed live; persisted once complete
- Tool calls logged in database as they execute
- User sees consistent view across browser refresh

---

## OpenAI ChatKit Integration Details

### Library & Dependencies

- **Package**: `@openai/chat-kit` (or similar OpenAI-provided package)
- **Installation**: `npm install @openai/chat-kit`
- **Version**: Latest stable (e.g., v1.x)

### Configuration

```javascript
// Example Next.js component
import { ChatKit } from '@openai/chat-kit';

export default function ChatInterface() {
  return (
    <ChatKit
      apiEndpoint="/api/v1/chat"
      onMessage={(msg) => handleUserMessage(msg)}
      theme="light"
      enableMarkdown={true}
      enableStreaming={true}
    />
  );
}
```

### Customization

- **Theme**: Light mode (primary color: #1976D2)
- **Markdown Support**: Enabled (bold, italics, lists, code blocks, tables)
- **Streaming**: Enabled (token-by-token Agent responses)
- **Message Timestamps**: Displayed below each bubble
- **Avatar Icons**: Optional (chat-kit-provided defaults acceptable)

---

## Accessibility (A11y)

- [ ] Keyboard navigation: Tab through input, send button, sidebar
- [ ] Focus indicators visible (outline on focus)
- [ ] ARIA labels on button ("Send message", "New conversation")
- [ ] Color contrast: Text ≥ 4.5:1 ratio
- [ ] Screen reader support: Messages announced as they arrive
- [ ] Message bubbles semantic (proper heading hierarchy if applicable)

---

## Performance Requirements

- **Chat load latency**: < 1 second (load previous messages)
- **Send message → UI update**: < 500ms
- **Agent response streaming**: Begins within 1-2 seconds of send
- **Sidebar render**: < 500ms (20 conversations)
- **Mobile responsiveness**: Sidebar collapse/expand < 300ms animation

---

## Error Handling & User Feedback

### Error States

| Scenario | User Message | Action |
|----------|--------------|--------|
| Network error | "Couldn't send message. Retry?" | Show retry button |
| OpenAI API failure | "Agent encountered an issue. Please try again." | Offer retry |
| Malformed user input (empty) | Silently ignore; input field remains focused | No message sent |
| Session expired (401) | "Your session expired. Please log in again." | Redirect to login |
| Conversation not found (404) | "This conversation doesn't exist." | Return to conversations list |

### Success Feedback

- Message appears in chat immediately (optimistic update)
- Agent response streams with visual feedback
- Tool confirmation shown conversationally (not technical JSON)
- Status bar shows "Ready" once complete

---

## Responsive Design Breakpoints

| Breakpoint | Layout | Behavior |
|------------|--------|----------|
| < 640px | Mobile | Hamburger menu for sidebar; full-width chat |
| 640px - 1024px | Tablet | Sidebar 25% width; chat 75% |
| > 1024px | Desktop | Sidebar 300px fixed; chat responsive |

---

## Future Enhancements (Not Phase III MVP)

- Rich message formatting: Code syntax highlighting
- File attachments: Upload files to share with Agent
- Voice input: Speak instead of type
- Conversation export: Download conversation as PDF/Markdown
- Dark mode toggle
- Multi-language support
- Conversation search/filtering
- Custom agent system prompt (admin only)

---

## Cross-References

- **API**: See `specs/api/rest-endpoints.md` for chat endpoint (POST /api/v1/chat)
- **Database**: See `specs/database/schema.md` for conversations/messages tables
- **Backend**: MCP Tools defined in implementation (`/backend/tools/`)
- **Constitution**: See `.specify/memory/constitution.md` principle III & IX for ChatKit & Agents details
