// [Task]: T-021
// [From]: plan.md §4.4: Next.js Middleware (Protection)
// [Reference]: FR-004, Constitution §III (Server Components Default)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js middleware for route protection
 *
 * Principles:
 * - Runs on every request to protected routes
 * - Checks for auth_token cookie/header
 * - Redirects unauthenticated users to /auth/login
 * - Redirects authenticated users from /auth/login to /dashboard
 *
 * Flow:
 * 1. User requests protected route (/dashboard, /tasks/*)
 * 2. Middleware checks for auth_token
 * 3. If missing → redirect to /auth/login
 * 4. If present → allow request to proceed
 *
 * Security:
 * - Server-side enforcement (cannot be bypassed by client-side code)
 * - Works alongside JWT middleware on backend (defense-in-depth)
 * - Does NOT validate token signature (backend handles this)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookies (set by login page after auth success)
  const token = request.cookies.get("auth_token")?.value;

  // Protected routes that require authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/tasks");

  // Public auth routes
  const isAuthRoute = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");

  // If user is authenticated (has token)
  if (token) {
    // Redirect from login page to dashboard if already authenticated
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Allow access to protected routes
    if (isProtectedRoute) {
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // If user is NOT authenticated
  if (!token) {
    // Redirect from protected routes to login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Allow access to public routes (login, register, home)
    return NextResponse.next();
  }

  return NextResponse.next();
}

/**
 * Route matcher configuration
 *
 * Specifies which routes trigger the middleware
 * We want to protect:
 * - /dashboard/* (main app interface)
 * - /tasks/* (task management pages)
 *
 * Also protect auth routes to redirect authenticated users
 */
export const config = {
  matcher: [
    // Protect dashboard routes
    "/dashboard/:path*",
    // Protect task routes
    "/tasks/:path*",
    // Protect auth routes (to redirect authenticated users)
    "/auth/:path*",
  ],
};
