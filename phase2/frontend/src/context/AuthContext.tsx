// [Task]: T-038.1
// [From]: plan.md §4.2: Better Auth Integration, tasks.md §T-038.1
// [Reference]: Constitution §I (JWT Bridge Pattern), Constitution §VIII (Component Architecture)

"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getToken, login as authLogin, logout as authLogout, getUser } from "@/lib/auth"
import type { UserResponse } from "@/lib/types"

interface AuthContextType {
  user: UserResponse | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * AuthProvider - Global authentication state management
 *
 * Provides JWT token and user state across the application via React Context
 * Syncs with lib/auth.ts for persistent token storage
 * Exposes useAuth() hook for components to access auth state
 *
 * Features:
 * - Loads auth state from storage on mount
 * - Exposes login() and logout() methods that sync with lib/auth.ts
 * - Provides useAuth() hook for accessing user, token, isAuthenticated, isLoading
 *
 * Constitution Compliance:
 * - Principle I (JWT Bridge): Manages JWT token lifecycle
 * - Principle III (Server Components): Client Component for state management
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state on mount from localStorage
  useEffect(() => {
    async function loadAuth() {
      try {
        const savedToken = await getToken()
        const savedUser = await getUser()
        setToken(savedToken)
        setUser(savedUser as UserResponse | null)
      } catch (error) {
        console.error("Failed to load auth state:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAuth()
  }, [])

  // Login handler - syncs with lib/auth.ts
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authLogin(email, password)
      setToken(response.access_token)
      setUser(response.user)
    } catch (error) {
      // Error is handled by caller
      throw error
    }
  }

  // Logout handler - syncs with lib/auth.ts
  const handleLogout = async () => {
    try {
      await authLogout()
      setToken(null)
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      // Clear state even if logout fails
      setToken(null)
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth - Hook for accessing auth context in components
 *
 * Usage:
 * ```typescript
 * const { user, isAuthenticated, login, logout } = useAuth()
 * ```
 *
 * Throws error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
