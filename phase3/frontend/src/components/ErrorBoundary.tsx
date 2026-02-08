// [Task]: T-063
// [From]: tasks.md §T-063, pages.md §Error Handling
// [Reference]: Constitution §VI (Error Handling Standards)

"use client"

import React, { ReactNode, Component } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary - Client Component for error handling
 *
 * Catches errors in child components and displays a user-friendly message
 * instead of crashing the entire app.
 *
 * Features:
 * - Catches React component errors
 * - Logs error to console for debugging
 * - Displays user-friendly error message
 * - Provides refresh button to recover
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * Constitution Compliance:
 * - Principle VI: User-friendly error handling
 * - Client Component for error catching
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error("ErrorBoundary caught an error:", error)
    console.error("Error info:", errorInfo)

    // In production, you could send to error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-6 text-center">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4v2m0-6a4 4 0 100 8 4 4 0 000-8zm0-12C6.477 3 2 7.477 2 12s4.477 9 10 9 10-4.477 10-10S17.523 1 12 1z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
              <p className="mt-2 text-sm text-gray-600">
                We encountered an unexpected error. Please try refreshing the page to continue.
              </p>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-left">
                <p className="text-xs font-semibold text-red-800">Error Details:</p>
                <pre className="mt-1 text-xs text-red-700 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={this.handleReset}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Refresh Page
            </button>

            {/* Home Link */}
            <a
              href="/"
              className="block text-sm text-blue-600 hover:text-blue-500 transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
