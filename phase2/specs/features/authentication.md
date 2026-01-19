# Feature Specification: User Authentication

**Feature Branch**: `001-web-specs`
**Created**: 2026-01-15
**Status**: Active

## User Scenarios & Testing

### User Story 1 - User Login (Priority: P1)

An unauthenticated user can log in with email and password credentials. The system verifies credentials, issues a JWT token, and redirects the user to the dashboard.

**Why this priority**: Authentication is the gatekeeper for all features. Without login, no user can access the application or their tasks. This is mandatory for MVP.

**Independent Test**: Can be fully tested by user entering credentials on login page, receiving JWT token, and being redirected to authenticated dashboard. Delivers value: users can access their secure account.

**Acceptance Scenarios**:

1. **Given** user on login page with valid email and correct password, **When** user clicks "Login", **Then** JWT token is issued and stored, user redirected to dashboard
2. **Given** user submits login with correct email but wrong password, **When** form is submitted, **Then** error message "Invalid credentials" displayed, user remains on login page
3. **Given** user submits login with email that doesn't exist, **When** form is submitted, **Then** error message "User not found" displayed
4. **Given** user successfully logs in, **When** token is issued, **Then** token contains user_id claim for backend verification
5. **Given** login is successful, **When** user is redirected to dashboard, **Then** subsequent API requests include JWT token in Authorization header

---

### User Story 2 - Token Verification on Backend (Priority: P1)

The backend verifies every API request by checking the JWT token signature using BETTER_AUTH_SECRET and extracting the user_id claim.

**Why this priority**: Token verification is the security mechanism that enforces user isolation. Without this, the app cannot trust that requests belong to the authenticated user.

**Independent Test**: Can be fully tested by backend receiving request with valid token, successfully extracting user_id, and scoping operations to that user. Delivers value: ensures user data is isolated.

**Acceptance Scenarios**:

1. **Given** API request with valid JWT token, **When** backend receives request, **Then** token signature is verified using BETTER_AUTH_SECRET
2. **Given** valid token, **When** backend verifies it, **Then** user_id claim is extracted and used to scope database queries
3. **Given** API request with invalid/tampered token, **When** backend receives request, **Then** verification fails and 401 Unauthorized is returned
4. **Given** API request with expired token, **When** backend receives request, **Then** 401 Unauthorized is returned
5. **Given** API request with no Authorization header, **When** backend receives request, **Then** 401 Unauthorized is returned

---

### User Story 3 - Token Storage on Frontend (Priority: P2)

The frontend stores the JWT token securely after login and includes it in subsequent API requests.

**Why this priority**: Token storage enables authenticated API calls but is secondary to the core login/verification flow. Users can still manually refresh if needed.

**Independent Test**: Can be fully tested by verifying token is stored after login and automatically included in API request headers. Delivers value: seamless authenticated user experience.

**Acceptance Scenarios**:

1. **Given** user receives JWT token after successful login, **When** token is issued, **Then** token is stored in secure client storage
2. **Given** token is stored, **When** user makes API request, **Then** token is automatically included in Authorization header as "Bearer <token>"
3. **Given** user closes and reopens browser, **When** page loads, **Then** user is still authenticated if token is valid (persistent session)
4. **Given** user logs out, **When** logout is triggered, **Then** token is cleared from storage and user redirected to login page

---

### User Story 4 - User Registration (Priority: P3)

A new user can create an account with email and password. The system hashes the password and creates a user record.

**Why this priority**: Registration enables new users but can be demo-populated or skipped for MVP if admin account creation is available. Lower priority than existing user login.

**Independent Test**: Can be fully tested by user entering new email and password, account being created, and user able to log in. Delivers value: allows application growth beyond pre-registered users.

**Acceptance Scenarios**:

1. **Given** new user on registration page with unique email and password, **When** registration submitted, **Then** account is created and user can log in
2. **Given** user registers with existing email, **When** registration submitted, **Then** error "Email already registered" displayed
3. **Given** user registers with weak password, **When** registration submitted, **Then** password validation message shown
4. **Given** successful registration, **When** user logs in, **Then** same credentials work to authenticate

---

### Edge Cases

- What happens if token expires while user is actively using the app? → User sees "Session expired" message; redirected to login to refresh token
- Can user manually modify token to change user_id claim? → No; token signature verification fails if any claim is modified
- What if BETTER_AUTH_SECRET is compromised? → New tokens signed with new secret; old tokens invalidated; users re-authenticate
- What happens if user logs in from multiple devices simultaneously? → Each device receives separate token; both remain authenticated independently
- Can user authenticate with email that contains uppercase characters? → Email normalization handles this (treated case-insensitively for comparison)

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a login form accepting email and password credentials
- **FR-002**: System MUST verify login credentials against stored user records using secure password hashing (bcrypt or equivalent)
- **FR-003**: System MUST issue a JWT token upon successful login containing user_id claim
- **FR-004**: JWT token MUST be signed using BETTER_AUTH_SECRET and include expiration time (default 24 hours recommended)
- **FR-005**: Backend MUST verify JWT signature on every API request using the same BETTER_AUTH_SECRET
- **FR-006**: Backend MUST extract user_id from JWT token claims and use it to scope all database queries
- **FR-007**: System MUST reject requests with missing, invalid, or expired JWT tokens with 401 Unauthorized response
- **FR-008**: Frontend MUST store JWT token after successful login and include it in Authorization header for subsequent API requests
- **FR-009**: System MUST provide logout functionality that clears token from frontend storage and invalidates session
- **FR-010**: System MUST prevent users from viewing other users' data even if they attempt to modify requests or bypass token verification
- **FR-011**: Passwords MUST NOT be stored in plaintext; system uses secure hashing algorithm
- **FR-012**: System MUST provide registration endpoint for new users to create accounts with email/password
- **FR-013**: System MUST validate email format and enforce password complexity requirements (minimum 8 characters, mixed case recommended)
- **FR-014**: All authentication endpoints MUST return Pydantic model responses with consistent error messages

### Key Entities

- **User**: Represents an authenticated user with email, password_hash, created_at, updated_at, and id (used in JWT user_id claim)
- **JWT Token**: Contains user_id claim, issued_at, expiration_time, and signature verified by BETTER_AUTH_SECRET

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete login in under 2 seconds from form submission to dashboard redirect
- **SC-002**: 100% of valid JWT tokens are accepted by backend; 100% of invalid tokens are rejected
- **SC-003**: Users can switch between accounts by logging out and logging in; each user sees only their own data
- **SC-004**: System maintains user isolation with zero instances of cross-user data leakage (verified through testing)
- **SC-005**: Token verification adds less than 50ms latency to each API request
- **SC-006**: Backend correctly extracts user_id from JWT claims in 100% of authenticated requests

## Assumptions

- Email/password authentication is sufficient for MVP (no social login required)
- JWT tokens expire after 24 hours; no refresh token rotation implemented initially
- Better Auth library provides secure token signing and verification; implementation details delegated to library
- Password hashing uses industry-standard algorithms (bcrypt); salting handled automatically
- CORS and HTTPS are configured correctly in deployment (assumed; not detailed in this spec)
- User registration is available as feature but login prioritized for MVP demonstration
