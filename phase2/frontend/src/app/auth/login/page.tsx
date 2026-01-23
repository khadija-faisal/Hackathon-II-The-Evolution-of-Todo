// [Task]: T-035
// [From]: plan.md §4.2: Better Auth Integration, tasks.md §T-035
// [Reference]: Constitution §III (Server Components by default), FR-001 (Login)

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import LoginForm from "@/components/auth/LoginForm"

/**
 * Login Page - Server Component
 *
 * Checks authentication status and renders login form:
 * - If already authenticated → redirect to /dashboard
 * - If not authenticated → render LoginForm
 *
 * Constitution Compliance:
 * - Principle III: Server Component by default (data fetching, auth checks)
 * - Principle I: Integrates with JWT Bridge Pattern
 */
export default async function LoginPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  // Redirect authenticated users to dashboard
  if (token) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access your tasks
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </main>
  )
}
