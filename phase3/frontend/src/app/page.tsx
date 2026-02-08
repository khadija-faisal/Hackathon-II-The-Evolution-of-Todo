// [Task]: T-061
// [From]: plan.md §4.1: Frontend Project Structure, tasks.md §T-061
// [Reference]: Constitution §II (API-First Backend)

import { redirect } from "next/navigation"
import { cookies } from "next/headers"

/**
 * Home Page - Authentication-based redirect
 *
 * Server Component that redirects based on authentication status:
 * - Authenticated users → /dashboard
 * - Unauthenticated users → /welcome (landing page)
 *
 * This prevents direct access to the home page and ensures proper routing
 *
 * Constitution Compliance:
 * - Principle II (API-First): Relies on backend authentication
 * - Server-side redirect (no client-side logic)
 */
export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (token) {
    redirect("/dashboard")
  } else {
    redirect("/welcome")
  }
}
