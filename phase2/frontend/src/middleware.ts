// [Task]: T-021
// [From]: plan.md §4.4: Next.js Middleware (Protection)
// [Reference]: FR-004, Constitution §III

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // TODO: Implement route protection (T-021)
  // Redirect unauthenticated users from /dashboard and /tasks/* routes to /auth/login
  // Redirect authenticated users from /auth/login to /dashboard

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect dashboard routes
    "/dashboard/:path*",
    "/tasks/:path*",
  ],
};
