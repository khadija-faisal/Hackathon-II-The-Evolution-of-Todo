# Integration Test Plan: Backend-Frontend Connectivity

**Date**: 2026-01-24
**Status**: READY FOR TESTING

## Test Environment Setup

### Backend (FastAPI)
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Expected Output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Frontend (Next.js)
```bash
cd frontend
npm run dev
```

Expected Output:
```
> frontend@1.0.0 dev
> next dev
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local
```

---

## Integration Test Scenarios

### Test 1: API Health Check (No Auth Required)
**Endpoint**: GET /health
**Expected**: 200 OK

```bash
curl http://localhost:8000/health
```

**Expected Response**:
```json
{"status": "ok"}
```

---

### Test 2: Protected Route Without Token
**Endpoint**: GET /api/v1/tasks
**Headers**: None
**Expected**: 401 Unauthorized

```bash
curl http://localhost:8000/api/v1/tasks
```

**Expected Response**:
```json
{"detail": "Unauthorized"}
```

---

### Test 3: Protected Route With Invalid Token
**Endpoint**: GET /api/v1/tasks
**Headers**: Authorization: Bearer invalid_token
**Expected**: 401 Unauthorized

```bash
curl -H "Authorization: Bearer invalid_token" http://localhost:8000/api/v1/tasks
```

**Expected Response**:
```json
{"detail": "Unauthorized"}
```

---

### Test 4: Frontend API Client Configuration
**Location**: frontend/src/lib/api.ts
**Verification**:
- [x] apiCall() function exists
- [x] Automatically injects Bearer token from localStorage
- [x] Handles 401 by redirecting to login
- [x] Returns typed response

**Test Code**:
```typescript
// Run in browser console on /dashboard
const result = await apiGet<TaskListResponse>('/api/v1/tasks');
console.log(result); // Should show tasks array
```

---

### Test 5: Frontend Route Protection Middleware
**Location**: frontend/src/middleware.ts
**Verification**:
- [x] Unauthenticated users redirected from /dashboard to /auth/login
- [x] Authenticated users can access /dashboard
- [x] Authenticated users redirected from /auth/login to /dashboard

**Test Steps**:
1. Open http://localhost:3000 (no token)
   - Expected: Redirected to /auth/login

2. Open http://localhost:3000/dashboard (no token)
   - Expected: Redirected to /auth/login

3. Open http://localhost:3000/auth/login (with token)
   - Expected: Redirected to /dashboard

---

### Test 6: Backend Task CRUD Endpoints
**Prerequisite**: Valid JWT token from login

#### Create Task (POST /api/v1/tasks)
```bash
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "description": "Test description"}'
```

**Expected**: 201 Created with TaskResponse

#### List Tasks (GET /api/v1/tasks)
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8000/api/v1/tasks
```

**Expected**: 200 OK with TaskListResponse

#### Get Single Task (GET /api/v1/tasks/{id})
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8000/api/v1/tasks/<task_id>
```

**Expected**: 200 OK with TaskResponse

#### Update Task (PUT /api/v1/tasks/{id})
```bash
curl -X PUT http://localhost:8000/api/v1/tasks/<task_id> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "description": "Updated description", "completed": false}'
```

**Expected**: 200 OK with updated TaskResponse

#### Toggle Completion (PATCH /api/v1/tasks/{id}/complete)
```bash
curl -X PATCH http://localhost:8000/api/v1/tasks/<task_id>/complete \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

**Expected**: 200 OK with TaskResponse (completed: true)

#### Delete Task (DELETE /api/v1/tasks/{id})
```bash
curl -X DELETE http://localhost:8000/api/v1/tasks/<task_id> \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected**: 204 No Content

---

### Test 7: User Isolation Enforcement
**Objective**: Verify one user cannot access another user's tasks

**Setup**:
1. Create User A with token_a
2. Create User B with token_b
3. User A creates Task X

**Test**:
```bash
# User A creates task
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer <token_a>" \
  -d '{"title": "User A Task"}'

# Response: 201 with task_id = <task_id_x>

# User B tries to access User A's task
curl -H "Authorization: Bearer <token_b>" http://localhost:8000/api/v1/tasks/<task_id_x>

# Expected: 404 Not Found (user isolation enforced)
```

**Result**: ✅ PASS if 404 returned

---

### Test 8: Frontend-Backend E2E Flow
**Steps**:
1. Navigate to http://localhost:3000
   - Expected: Redirected to /auth/login

2. Click "Sign in" (navigate to login page)
   - Expected: LoginForm renders

3. Enter email and password
   - Expected: Form validates on client-side

4. Submit login form
   - Expected: Calls POST /api/v1/auth/login
   - **Note**: This endpoint not yet implemented; will fail with 404

5. (After login implemented) Token stored in localStorage
   - Expected: localStorage contains auth_token

6. Dashboard loads and fetches tasks
   - Expected: Calls GET /api/v1/tasks with Bearer token
   - Expected: Displays user's tasks only

7. Create new task
   - Expected: Form validates (client-side)
   - Expected: POST /api/v1/tasks called
   - Expected: New task appears in list (optimistic UI)

8. Toggle task completion
   - Expected: Checkbox toggles immediately (optimistic UI)
   - Expected: PATCH /api/v1/tasks/{id}/complete called
   - Expected: Task remains marked complete if successful

9. Edit task
   - Expected: Navigate to /dashboard/tasks/{id}/edit
   - Expected: Form pre-populates with existing data
   - Expected: PUT /api/v1/tasks/{id} called
   - Expected: Redirect to /dashboard

10. Delete task
    - Expected: Confirmation modal appears
    - Expected: DELETE /api/v1/tasks/{id} called
    - Expected: Task removed from list

11. Logout
    - Expected: Logout confirmation modal appears
    - Expected: Token cleared from localStorage
    - Expected: Redirect to /auth/login

**Result**: ✅ PASS if all steps complete successfully

---

## Critical Path Items

### BLOCKING ITEM: Login Endpoint Not Implemented
**Issue**: POST /api/v1/auth/login not yet in backend routes

**Impact**: Cannot complete full E2E test flow; users cannot log in

**Required Implementation**:
```python
# backend/routes/auth.py (needs to be created)

@router.post("/login")
async def login(request: LoginRequest, session: Session = Depends(get_session)):
    """
    Authenticate user with email and password
    Returns JWT token on success
    """
    # Verify email exists
    # Verify password
    # Issue JWT token
    # Return AuthResponse
```

**Status**: ⏭️ PENDING

---

## Test Results Template

### Integration Test Execution Report

| Test # | Scenario | Status | Notes |
|--------|----------|--------|-------|
| 1 | Health check (/health) | ✅/❌ | |
| 2 | Protected route without token | ✅/❌ | |
| 3 | Protected route with invalid token | ✅/❌ | |
| 4 | Frontend API client configuration | ✅/❌ | |
| 5 | Frontend route protection middleware | ✅/❌ | |
| 6 | Backend task CRUD endpoints | ✅/❌ | |
| 7 | User isolation enforcement | ✅/❌ | |
| 8 | Frontend-Backend E2E flow | ✅/❌ | Blocked by missing login endpoint |

---

## Next Steps

1. **Implement POST /api/v1/auth/login**
   - Verify email exists in users table
   - Verify password matches bcrypt hash
   - Issue JWT token with user_id in 'sub' claim
   - Return AuthResponse with access_token

2. **Run full E2E test suite**
   - Navigate through complete user journey
   - Verify all CRUD operations work
   - Test error scenarios

3. **Load testing** (optional, before production)
   - Verify dashboard query completes < 1 second
   - Verify login completes < 2 seconds
   - Verify concurrent users don't interfere

4. **Security testing** (optional)
   - Test SQL injection protection (Pydantic models)
   - Test XSS protection (React escaping)
   - Test CSRF protection (same-origin validation)

---

**Status**: READY FOR EXECUTION
