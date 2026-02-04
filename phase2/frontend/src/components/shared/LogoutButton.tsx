// [Task]: T-049
// [From]: tasks.md §T-049 (Add Logout button to Header)
// [Reference]: Constitution §I (JWT Bridge), FR-009 (Logout)

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

/**
 * LogoutButton - Client Component for user logout
 *
 * Features:
 * - Shows confirmation modal before logout
 * - Calls useAuth().logout() to clear token and user state
 * - Redirects to login page after logout
 * - Accessible button with proper ARIA labels
 *
 * Constitution Compliance:
 * - Principle I: Clears JWT token via AuthContext
 * - Client Component for interactivity (modal, state)
 */
export default function LogoutButton() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
      // Redirect to login page
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-xs sm:text-sm font-bold text-[#1A1A1A] hover:bg-gray-50 hover:border-[#F3A03F]/30 focus:outline-none focus:ring-2 focus:ring-[#F3A03F]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? "Logging out..." : "Sign Out"}
      </button>

      {/* Confirmation Modal - Portal-style positioning */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => !isLoading && setShowConfirm(false)}
          ></div>

          {/* Modal Content - On top of backdrop */}
          <div
            className="relative bg-white border-2 border-gray-200 rounded-lg sm:rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            <h2 id="logout-modal-title" className="text-lg sm:text-xl font-black text-[#1A1A1A] mb-2 sm:mb-3">
              Sign Out?
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              Are you sure you want to sign out? You'll need to sign in again to access your tasks.
            </p>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="rounded-lg border-2 border-gray-300 px-4 py-2 text-xs sm:text-sm font-bold text-[#1A1A1A] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-gray-300/50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-xs sm:text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                {isLoading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>}
                {isLoading ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
