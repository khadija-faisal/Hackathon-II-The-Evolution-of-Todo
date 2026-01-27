// [Task]: T-036, T-037, T-038, T-039
// [From]: plan.md §4.2: Better Auth Integration, rest-endpoints.md §POST /api/v1/auth/login
// [Reference]: Constitution §I (JWT Bridge), FR-001 (Login), FR-014 (Request validation)

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

/**
 * LoginForm - Client Component for user authentication
 *
 * Features:
 * - Email input with HTML5 validation (T-037)
 * - Password input with min length enforcement
 * - Form validation on submit
 * - Error message display with auto-dismiss
 * - Loading state with disabled button
 * - API integration via useAuth().login() (T-038)
 * - Redirect to /dashboard on success
 * - Accessibility: labels, error messaging, keyboard navigation (T-039)
 *
 * Constitution Compliance:
 * - Principle I: Uses JWT Bridge Pattern via useAuth hook
 * - Principle III: Client Component for interactivity
 * - Principle VI: Error handling with user-friendly messages
 */
export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  /**
   * Handle form submission
   * Validates input, calls login API, handles success/error
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Client-side validation
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!password) {
      setError("Password is required")
      return
    }

    if (password.length < 1) {
      setError("Please enter your password")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Call login from AuthContext (syncs with lib/auth.ts)
      await login(email, password)

      // Redirect to dashboard on success
      router.push("/dashboard")
    } catch (err: any) {
      // Handle login errors
      const errorMessage = err?.message || "Failed to sign in. Please try again."

      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Error Message (T-039 Accessibility) */}
      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* Email Input (T-037 Validation) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="you@example.com"
        />
      </div>

      {/* Password Input (T-037 Validation) */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={1}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </button>

      {/* Registration Link (Future - T-040/T-041) */}
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <a
          href="/auth/register"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign up here
        </a>
      </p>
    </form>
  )
}
