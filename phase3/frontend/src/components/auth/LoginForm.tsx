// [Task]: T-036, T-037, T-038, T-039
// [From]: plan.md §4.2: Better Auth Integration, rest-endpoints.md §POST /api/v1/auth/login
// [Reference]: Constitution §I (JWT Bridge), FR-001 (Login), FR-014 (Request validation)

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!password) {
      setError("Password is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to sign in. Please try again."
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm"
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
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[#1A1A1A] placeholder-gray-500 focus:border-[#F3A03F] focus:outline-none focus:ring-2 focus:ring-[#F3A03F]/20 disabled:bg-gray-100 transition"
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
          autoComplete="current-password"
          required
          minLength={1}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[#1A1A1A] placeholder-gray-500 focus:border-[#F3A03F] focus:outline-none focus:ring-2 focus:ring-[#F3A03F]/20 disabled:bg-gray-100 transition"
          placeholder="Enter your password"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-[#1A1A1A] text-white font-bold rounded-lg hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? "Signing in..." : "Sign In"}
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
          className="py-2 rounded-lg border border-gray-300 text-[#1A1A1A] font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
        >
          Google
        </button>
        <button
          type="button"
          disabled={isLoading}
          className="py-2 rounded-lg border border-gray-300 text-[#1A1A1A] font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
        >
          GitHub
        </button>
      </div>

      {/* Forgot Password Link */}
      <div className="text-center">
        <a href="#" className="text-sm text-[#F3A03F] hover:text-[#E08F2C] font-medium">
          Forgot password?
        </a>
      </div>
    </form>
  )
}
