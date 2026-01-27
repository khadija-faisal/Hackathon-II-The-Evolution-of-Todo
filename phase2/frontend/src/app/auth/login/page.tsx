// [Task]: T-035
// [From]: plan.md §4.2: Better Auth Integration, tasks.md §T-035
// [Reference]: Constitution §III (Server Components by default), FR-001 (Login)

import LoginForm from "@/components/auth/LoginForm"

/**
 * Login Page - Client Component (Route Handler compatible)
 *
 * Renders login form.
 * Client-side authentication check is handled in middleware.ts
 *
 * Constitution Compliance:
 * - Principle III: Server Component with client auth handling
 * - Principle I: Integrates with JWT Bridge Pattern
 */
export default function LoginPage() {

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
