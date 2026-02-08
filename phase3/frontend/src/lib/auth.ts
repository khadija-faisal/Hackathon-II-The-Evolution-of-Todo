// [Task]: T-018
// [From]: plan.md §4.2: Better Auth Integration
// [Reference]: FR-008, FR-009, Constitution §III (Server Components Default)

/**
 * Better Auth + FastAPI Integration
 *
 * This module integrates Better Auth client library with our FastAPI backend.
 * The flow is:
 * 1. User logs in via login() function
 * 2. Frontend calls FastAPI POST /api/v1/auth/login
 * 3. FastAPI issues JWT token signed with BETTER_AUTH_SECRET
 * 4. Token stored in localStorage (Better Auth manages it)
 * 5. All API requests include token in Authorization: Bearer <token> header
 * 6. FastAPI middleware verifies token using same BETTER_AUTH_SECRET
 *
 * This provides:
 * - User isolation: Each user only sees their tasks (filtered by user_id from JWT)
 * - Stateless auth: Backend doesn't need session DB
 * - Token expiry: JWTs expire automatically after 24 hours
 */

const TOKEN_STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";

/**
 * Stores JWT token in both localStorage and as a cookie
 *
 * Why both?
 * - localStorage: Used by client-side fetch() calls
 * - Cookie: Used by Next.js middleware AND server-side fetch requests
 *
 * Why this works:
 * - Client-side: fetch() adds Authorization header from localStorage token
 * - Server-side: Cookies are automatically sent with fetch() requests
 * - Middleware: Checks for auth_token cookie for route protection
 *
 * Security Note:
 * - In production, use httpOnly cookies instead of localStorage
 * - Requires HTTPS in production
 */
function setToken(token: string): void {
  if (typeof window !== "undefined") {
    // Store in localStorage for client-side code
    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    // Set as cookie for server-side code and middleware
    // Cookie expires in 24 hours (match JWT expiration)
    // SameSite=Lax allows cookie in top-level navigations
    document.cookie = `${TOKEN_STORAGE_KEY}=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
  }
}

/**
 * Retrieves stored JWT token
 *
 * Works in both client and server contexts:
 * - Client (browser): Reads from localStorage
 * - Server (Next.js): Reads from cookies (automatically sent in requests)
 *
 * Returns: Token string or null if not found
 */
export async function getToken(): Promise<string | null> {
  // Server-side context (Next.js Server Components)
  if (typeof window === "undefined") {
    // On server, we need to get token from cookies
    // For Server Components, token comes via cookies in the request
    // We'll use the 'cookie' module if available, otherwise return null
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get(TOKEN_STORAGE_KEY)?.value;
      return token || null;
    } catch (e) {
      // Fallback for server context
      return null;
    }
  }

  // Client-side context (browser)
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    return token || null;
  } catch (e) {
    console.error("Failed to retrieve token:", e);
    return null;
  }
}

/**
 * Stores user info (non-sensitive) for quick access
 */
function setUser(user: Record<string, any>): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

/**
 * Retrieves stored user info
 */
export async function getUser(): Promise<Record<string, any> | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error("Failed to retrieve user:", e);
    return null;
  }
}

/**
 * Login user with email and password
 *
 * Flow:
 * 1. Call POST /api/v1/auth/login with credentials
 * 2. Backend verifies credentials and returns JWT token
 * 3. Store token for subsequent API requests
 * 4. Store user info for UI
 *
 * Returns: AuthResponse with access_token and user
 * Throws: Error if login fails (401, 400, etc.)
 */
export async function login(email: string, password: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.detail || "Login failed");
  }

  const data = await response.json();

  // Store token and user info
  setToken(data.access_token);
  setUser(data.user);

  return data;
}

/**
 * Logout user and clear stored credentials
 *
 * Flow:
 * 1. Clear token from localStorage
 * 2. Clear token cookie
 * 3. Clear user info from storage
 * 4. Frontend redirects to login page via middleware
 */
export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    // Clear auth_token cookie
    document.cookie = "auth_token=; path=/; max-age=0";
  }
}

/**
 * Check if user is authenticated
 *
 * Returns: True if token exists, False otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

/**
 * Register new user with email and password
 *
 * Flow:
 * 1. Call POST /api/v1/auth/register with credentials
 * 2. Backend creates new user and returns user data (no token)
 * 3. User must then login to get JWT token
 * 4. Return user info for display on success page
 *
 * Returns: UserResponse with id, email, created_at
 * Throws: Error if registration fails (400 if email exists, 422 if validation failed)
 */
export async function register(email: string, password: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.detail || "Registration failed");
  }

  const data = await response.json();
  return data;
}
