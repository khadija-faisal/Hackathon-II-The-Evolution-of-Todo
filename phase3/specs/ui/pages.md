# UI Specification: Pages and Components

**Feature Branch**: `001-web-specs`
**Created**: 2026-01-15
**Status**: Active

## Overview

The Todo App web UI consists of three primary pages built with Next.js 16 (App Router) and styled with Tailwind CSS. All pages enforce user authentication with JWT tokens stored securely in the browser. The UI focuses on simplicity and usability for task management.

## Design Principles

1. **Responsive Design**: Works on desktop, tablet, and mobile
2. **Accessible**: WCAG 2.1 AA compliance (semantic HTML, ARIA labels, keyboard navigation)
3. **Fast**: Client-side state management; minimal server round-trips
4. **Intuitive**: Familiar task management patterns (checkbox to complete, delete button)
5. **Secure**: No sensitive data in localStorage; JWT token managed securely

## Page 1: Login Page

**Route**: `/auth/login`
**Visibility**: Public (unauthenticated users only)
**Redirect**: Authenticated users redirected to `/dashboard`

### Layout

```
┌─────────────────────────────────────────┐
│                                         │
│           LOGO / APP NAME              │
│           Todo App                     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Email Address                         │
│  [______________________________]       │
│                                         │
│  Password                              │
│  [______________________________]       │
│                                         │
│  [  Login  ] [  Register  ]            │
│                                         │
│  Error message (if any):               │
│  "Invalid credentials"                 │
│                                         │
└─────────────────────────────────────────┘
```

### Components

#### Form Container
- Centered card layout
- White background with subtle shadow
- Maximum width 400px on desktop
- Padding 2rem (Tailwind: px-8 py-10)

#### Email Input Field
- Label: "Email Address"
- Type: `email`
- Placeholder: "you@example.com"
- Validation: Email format required
- Error state: Red border + error message

#### Password Input Field
- Label: "Password"
- Type: `password`
- Placeholder: "••••••••"
- Validation: Required, minimum 8 characters
- Error state: Red border + error message

#### Buttons
- **Login Button**
  - Primary action (blue background, white text)
  - Full width on mobile, fixed width on desktop
  - Loading state: Spinner + disabled
  - Tooltip: "Sign in with email and password"

- **Register Link/Button**
  - Secondary action (text link or outline button)
  - Navigates to `/auth/register`
  - Tooltip: "Create new account"

#### Error Message Display
- Appears below form if login fails
- Red background with white text (Tailwind: bg-red-100 text-red-700)
- Displays specific error: "Invalid credentials" or "User not found"
- Auto-dismisses after 5 seconds or on user input

#### Success Feedback
- After login, brief "Signing in..." message
- Automatically redirects to `/dashboard` after token received
- No manual "Continue" button required

### User Interactions

1. **User enters email and password**
   - Form validates on blur (email format)
   - Password field shows character count (optional UX enhancement)

2. **User clicks Login**
   - Button shows loading spinner
   - Form becomes disabled (prevent double-submit)
   - API call to `POST /api/v1/auth/login`

3. **On Success**
   - JWT token stored securely
   - Redirect to `/dashboard`

4. **On Error**
   - Error message displayed
   - Button re-enables
   - User can retry

### Accessibility

- Form labels associated with inputs (for attribute)
- Error messages linked via aria-describedby
- Submit button has clear label
- Keyboard navigation: Tab through fields, Enter to submit
- Focus visible on interactive elements

---

## Page 2: Dashboard Page

**Route**: `/dashboard`
**Visibility**: Protected (authenticated users only)
**Redirect**: Unauthenticated users redirected to `/auth/login`

### Layout

```
┌────────────────────────────────────────────────────────┐
│  Logo    Todo App Dashboard    [⚙️ Settings] [Logout]  │  ← Header
├────────────────────────────────────────────────────────┤
│                                                        │
│  My Tasks (4)                                          │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ☐ Buy groceries              [✎ Edit] [✕ Delete] │ │
│  │   Milk, eggs, bread                             │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ☑ Complete project           [✎ Edit] [✕ Delete] │ │ ← Completed (muted)
│  │   Finish phase 2                                │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ☐ Write documentation        [✎ Edit] [✕ Delete] │ │
│  │   API endpoints                                 │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [+ New Task]                                          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Components

#### Header
- Logo/App name (left)
- Page title: "My Tasks"
- Settings icon (gear) → settings page (future)
- Logout button (right)
- Background: Light blue or gray (Tailwind: bg-slate-50)

#### Task Counter
- Text: "My Tasks (4)"
- Shows total task count
- Updates in real-time as tasks are added/deleted

#### Task List Container
- Maximum width 800px
- Margin auto (centered on wide screens)
- Padding 1rem (Tailwind: p-4)
- Empty state: "No tasks yet. Create one to get started." with link to create form

#### Task Item Card
Each task displayed as a card with:

- **Checkbox** (left)
  - Unchecked: Open circle (☐)
  - Checked: Filled circle (☑)
  - Clicking toggles completed status
  - Triggers PATCH request to `/api/v1/tasks/{id}` with `completed: true/false`

- **Task Content** (center, flex-grow)
  - **Title**: Bold, normal text color
  - **Description**: Gray text, smaller font (optional)
  - Click on title or description to inline-edit (optional UX enhancement)

- **Action Buttons** (right)
  - **Edit Button** (✎): Navigates to `/dashboard/tasks/{id}/edit`
  - **Delete Button** (✕): Shows confirmation modal, then calls DELETE endpoint

- **Completed State**:
  - Completed tasks show faded/strikethrough text
  - Checkbox is checked
  - Same height as uncompleted tasks

- **Spacing**:
  - Card margin: 0.5rem bottom (Tailwind: mb-2)
  - Card padding: 1rem (Tailwind: p-4)
  - Border: Light gray (Tailwind: border border-gray-200)
  - Hover effect: Subtle shadow increase

#### Task Creation Button
- Label: "+ New Task" or "Create Task"
- Type: Floating action button (FAB) or regular button
- Location: Below task list or sticky at bottom
- Navigates to `/dashboard/tasks/new` (create page)
- Keyboard shortcut: 'C' key (optional, show in help)

#### Filter/Sort Options (Future)
- Not required for MVP
- Placeholder for: Filter by completed/incomplete, sort by date/name
- Prepared UI structure but not implemented initially

### User Interactions

1. **User logs in**
   - Redirected to `/dashboard`
   - Task list fetched via `GET /api/v1/tasks`
   - Task counter updated

2. **User toggles task completion**
   - Click checkbox
   - Checkbox animates (0.2s transition)
   - PATCH request sent to `/api/v1/tasks/{id}`
   - Task appearance updates (strikethrough if completed)

3. **User edits task**
   - Click edit button or task content
   - Navigate to edit page (or inline edit modal)
   - Modify task and save
   - Return to dashboard; task updated in list

4. **User deletes task**
   - Click delete button
   - Confirmation modal appears: "Delete this task?"
   - Confirm: DELETE request sent; task removed from list
   - Cancel: Modal closes; task remains

5. **User creates new task**
   - Click "+ New Task"
   - Navigate to create form page
   - Fill title/description and submit
   - Redirected back to dashboard; new task appears in list

6. **User logs out**
   - Click logout button
   - Confirmation: "Log out?"
   - Token cleared from storage
   - Redirect to `/auth/login`

### Accessibility

- Task list uses semantic HTML (ul/li or divs with roles)
- Checkbox has proper label association
- Delete button has aria-label: "Delete task: [task title]"
- Edit button navigates to new route (semantic action)
- Focus management: Focus moves to next item after deletion
- Keyboard navigation: Tab through checkboxes and buttons

---

## Page 3: Task Create/Edit Page

**Routes**:
- Create: `/dashboard/tasks/new`
- Edit: `/dashboard/tasks/{id}/edit`

**Visibility**: Protected (authenticated users only)

### Layout

```
┌────────────────────────────────────────────────────────┐
│  Logo    [← Back]                                      │  ← Header
├────────────────────────────────────────────────────────┤
│                                                        │
│  Create New Task                                       │
│  or                                                    │
│  Edit Task                                             │
│                                                        │
│  Task Title                                            │
│  [_________________________________]                 │
│  Required field                                        │
│                                                        │
│  Description (optional)                               │
│  [_________________________________                   │
│   _________________________________                   │
│   _________________________________]                  │
│  Add notes, details, or due date info                 │
│                                                        │
│  [  Save  ]  [  Cancel  ]                             │
│                                                        │
│  Unsaved changes? (appears if form modified)         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Components

#### Page Header
- Back button (← Back)
  - Navigates to `/dashboard`
  - Confirmation if unsaved changes: "Discard changes?"

- Page title
  - Create mode: "Create New Task"
  - Edit mode: "Edit Task"

#### Title Input Field
- Label: "Task Title"
- Type: `text`
- Placeholder: "What needs to be done?"
- Required: Yes (form won't submit without value)
- Validation: Non-empty, max 255 characters
- Character counter: "X / 255" (optional)
- Error state: Red border + error message

#### Description Field
- Label: "Description (optional)"
- Type: `textarea`
- Placeholder: "Add notes, details, or due date info"
- Required: No
- Max height: 150px with scroll
- Character counter: Optional (informational only)

#### Save Button
- Label: "Save"
- Primary action (blue background)
- Triggers form validation
- On success: Redirect to `/dashboard` with toast notification "Task saved!"
- On error: Show error message; keep form open
- Loading state: Spinner + "Saving..."

#### Cancel Button
- Label: "Cancel"
- Secondary action (text link or outline button)
- Navigates back to `/dashboard`
- Confirmation if unsaved changes: "Discard changes?"

#### Unsaved Changes Indicator
- Browser tab title shows asterisk: "Edit Task *"
- Optional warning before leaving: "You have unsaved changes."
- Clears after successful save

### User Interactions

1. **Create New Task**
   - Click "+ New Task" on dashboard
   - Navigate to `/dashboard/tasks/new`
   - Form is empty
   - User enters title and description
   - Click Save
   - POST request to `/api/v1/tasks`
   - Redirect to `/dashboard` with new task visible

2. **Edit Existing Task**
   - Click edit on task card
   - Navigate to `/dashboard/tasks/{id}/edit`
   - Form pre-populated with current task data
   - User modifies title/description
   - Click Save
   - PUT request to `/api/v1/tasks/{id}`
   - Redirect to `/dashboard` with updated task visible

3. **Validation Flow**
   - On Save click, validate title is non-empty
   - If validation fails, show error: "Title is required"
   - If validation passes, disable form and send request
   - On API error (e.g., 400), show error message; re-enable form
   - On API success (201 or 200), dismiss form and return to dashboard

4. **Discard Changes**
   - User modifies form but doesn't save
   - Click Back or Cancel
   - Modal confirmation: "Discard unsaved changes?"
   - Confirm: Return to dashboard without saving
   - Cancel: Modal closes; user stays on form

### Accessibility

- Form labels associated with inputs (for attribute)
- Error messages linked via aria-describedby
- Submit and cancel buttons have clear labels
- Keyboard navigation: Tab through fields, Enter to submit, Escape to cancel
- Focus management: Focus moves to first error field on validation failure
- Character counter provides aria-label for screen readers

---

## Responsive Design Breakpoints

| Breakpoint | Screen Size | Adjustments |
|------------|-------------|-------------|
| Mobile | < 640px | Single column, full-width cards, stacked buttons |
| Tablet | 640px - 1024px | Two-column layout (if applicable), adjusted padding |
| Desktop | > 1024px | Max-width container (800px-1200px), side-by-side layout |

---

## Color Scheme (Tailwind)

| Element | Color | Tailwind |
|---------|-------|----------|
| Primary (buttons, links) | Blue | `bg-blue-500`, `text-blue-600` |
| Success (checkmarks, confirmations) | Green | `bg-green-100`, `text-green-700` |
| Error (validation, warnings) | Red | `bg-red-100`, `text-red-700` |
| Background | Light Gray | `bg-white`, `bg-slate-50` |
| Text (primary) | Dark Gray | `text-slate-900` |
| Text (secondary) | Medium Gray | `text-slate-600` |
| Borders | Light Gray | `border-gray-200` |
| Completed tasks | Faded | `text-gray-500`, `line-through` |

---

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| App Name (Logo) | System | 24px | 700 (bold) |
| Page Title | System | 20px | 600 (semibold) |
| Section Title | System | 16px | 600 (semibold) |
| Body Text | System | 14px | 400 (normal) |
| Small Text (helpers, counters) | System | 12px | 400 (normal) |
| Links | System | 14px | 500 (medium), underlined on hover |

---

## Animations

| Action | Animation | Duration |
|--------|-----------|----------|
| Checkbox toggle | Bounce + fade | 200ms |
| Task creation | Slide in from left | 300ms |
| Task deletion | Fade out + slide out right | 200ms |
| Button hover | Subtle shadow increase | 100ms |
| Error message appearance | Fade in | 150ms |
| Error message disappear | Fade out | 200ms |
| Page transitions | Fade in | 200ms |

---

## State Management

### Authenticated User State
- User ID: Extracted from JWT and stored in context
- Email: Displayed in header (optional)
- Token: Stored securely; refreshed on logout

### Task List State
- Tasks array: Fetched on dashboard load
- Loading state: Show skeleton while fetching
- Error state: Show error message with retry button
- Empty state: Show helpful message when no tasks

### Form State (Create/Edit)
- Title input: Controlled component
- Description input: Controlled component
- Validation errors: Displayed inline
- Unsaved changes flag: Used for confirmation dialog
- Loading state: Disable form during submission

---

## Error Handling

### User-Facing Errors

1. **Network Error**
   - Message: "Unable to connect. Please check your internet and try again."
   - Recovery: Retry button

2. **Server Error (500)**
   - Message: "Something went wrong. Please try again later."
   - Recovery: Retry button

3. **Unauthorized (401)**
   - Message: "Session expired. Please log in again."
   - Action: Redirect to login page

4. **Validation Error (400)**
   - Message: Display specific field error (e.g., "Title is required")
   - Recovery: User can fix and resubmit

5. **Permission Denied (403)**
   - Message: "You don't have permission to modify this task."
   - Recovery: Go back to dashboard

---

## Cross-References

- **Authentication Flow**: See `specs/features/authentication.md`
- **REST API Endpoints**: See `specs/api/rest-endpoints.md`
- **Task CRUD Operations**: See `specs/features/task-crud.md`
- **Database Schema**: See `specs/database/schema.md`

## Assumptions

- Tailwind CSS is available and configured in Next.js project
- Client-side state management (Context API or similar) used for auth state
- No third-party component library (Shadcn, Material, etc.) required; custom components using Tailwind
- Forms use HTML5 validation with custom error messages
- No TypeScript-specific requirements (can use JS, but TS recommended)
- Accessibility follows WCAG 2.1 AA standards
- Mobile-first responsive design approach
