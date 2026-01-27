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
        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Logging out..." : "Log out"}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <>
          {/* Backdrop - Very Dark and Complete Coverage */}
          <div
            className="fixed inset-0 bg-black/98 z-[9998]"
            onClick={() => !isLoading && setShowConfirm(false)}
          ></div>

          {/* Modal Container */}
          <div
            className="fixed inset-0 flex items-center justify-center z-[9999] opacity-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={() => !isLoading && setShowConfirm(false)}
            style={{ pointerEvents: "none" }}
          >
            {/* Modal Content - Click propagation stopped */}
            <div
              className="bg-slate-800 border-2 border-red-500/60 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl shadow-red-600/50 backdrop-blur-xl ring-1 ring-red-500/20 opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                e.currentTarget.style.pointerEvents = "auto"
              }}
              style={{ pointerEvents: "auto" }}
            >
            <h2 id="logout-modal-title" className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-3">
              <span className="text-3xl">🚪</span> Log Out?
            </h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to log out? You'll need to sign in again to access your tasks.
            </p>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end mt-8">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="rounded-md border-2 border-gray-500 px-5 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:border-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="rounded-md bg-red-600 hover:bg-red-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-red-500/60 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-slate-800"
              >
                {isLoading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>}
                {isLoading ? "Logging out..." : "🚪 Log out"}
              </button>
            </div>
          </div>
          </div>
        </>
      )}
    </>
  )
}
