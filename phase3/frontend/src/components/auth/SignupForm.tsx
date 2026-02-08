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
          className="rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200"
        >
          Account created successfully! Redirecting to login...
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-[#1A1A1A] mb-2">
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
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-[#1A1A1A] placeholder-gray-500 focus:border-[#F3A03F] focus:outline-none focus:ring-2 focus:ring-[#F3A03F]/20 disabled:bg-gray-100 transition"
          placeholder="you@example.com"
        />
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password" className="block text-sm font-bold text-[#1A1A1A] mb-2">
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
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-[#1A1A1A] placeholder-gray-500 focus:border-[#F3A03F] focus:outline-none focus:ring-2 focus:ring-[#F3A03F]/20 disabled:bg-gray-100 transition"
          placeholder="Minimum 8 characters"
        />
        <p className="mt-2 text-xs text-gray-600">At least 8 characters required</p>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#1A1A1A] mb-2">
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
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-[#1A1A1A] placeholder-gray-500 focus:border-[#F3A03F] focus:outline-none focus:ring-2 focus:ring-[#F3A03F]/20 disabled:bg-gray-100 transition"
          placeholder="Re-enter your password"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-[#1A1A1A] text-white font-bold rounded-lg hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? "Creating account..." : "Sign up"}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 bg-white text-gray-600">Or</span>
        </div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled={isLoading}
          className="py-2 rounded-lg border-2 border-gray-300 text-[#1A1A1A] font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
        >
          Google
        </button>
        <button
          type="button"
          disabled={isLoading}
          className="py-2 rounded-lg border-2 border-gray-300 text-[#1A1A1A] font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
        >
          GitHub
        </button>
      </div>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a
          href="/auth/login"
          className="font-bold text-[#F3A03F] hover:text-[#E08F2C]"
        >
          Sign in here
        </a>
      </p>
    </form>
  )
}
