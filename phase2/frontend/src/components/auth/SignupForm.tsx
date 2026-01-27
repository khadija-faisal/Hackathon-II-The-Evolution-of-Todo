// [Task]: T-040, T-041
// [From]: plan.md §4.2: Better Auth Integration, rest-endpoints.md §POST /api/v1/auth/register
// [Reference]: Constitution §I (JWT Bridge), FR-012 (User Registration), FR-014 (Request validation)

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { register } from "@/lib/auth"

/**
 * SignupForm - Client Component for user registration
 *
 * Features:
 * - Email input with HTML5 validation
 * - Password input with min length enforcement
 * - Confirm password input to prevent typos
 * - Form validation on submit
 * - Error message display with auto-dismiss
 * - Loading state with disabled button
 * - API integration via register() function
 * - Redirect to login on success for user to authenticate
 * - Accessibility: labels, error messaging, keyboard navigation
 *
 * Constitution Compliance:
 * - Principle I: Uses JWT Bridge Pattern via register function
 * - Principle III: Client Component for interactivity
 * - Principle VI: Error handling with user-friendly messages
 */
export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  /**
   * Handle form submission
   * Validates input, calls register API, handles success/error
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

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Call register function
      await register(email, password)

      // Show success message
      setSuccess(true)

      // Redirect to login page after brief delay
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err: any) {
      // Handle registration errors
      const errorMessage = err?.message || "Failed to create account. Please try again."

      setError(errorMessage)
      setIsLoading(false)
    }
  }

  // Show success message
  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div
          role="alert"
          className="rounded-md bg-green-50 p-4 text-sm text-green-800 border border-green-200"
        >
          Account created successfully! Redirecting to login...
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* Email Input */}
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

      {/* Password Input */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="Minimum 8 characters"
        />
        <p className="mt-1 text-xs text-gray-500">At least 8 characters</p>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="Re-enter your password"
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
            Creating account...
          </span>
        ) : (
          "Sign up"
        )}
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a
          href="/auth/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign in here
        </a>
      </p>
    </form>
  )
}
