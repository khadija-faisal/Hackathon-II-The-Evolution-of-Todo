// [Task]: T-019
// [From]: plan.md §4.3: API Client Setup
// [Reference]: Constitution §II (API-First Backend), Constitution §VI (Error Handling)

import { getToken, logout } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * HTTP API client wrapper with automatic JWT Bearer token injection
 *
 * Principles:
 * - All requests automatically include Authorization: Bearer <token> header
 * - Handles 401 Unauthorized by clearing token and redirecting to login
 * - Enforces JSON content-type for requests and responses
 * - Type-safe: Returns typed responses via generic <T>
 *
 * Signature:
 * @param endpoint - API endpoint path (e.g., "/api/v1/tasks")
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise<T> - Parsed JSON response typed as T
 *
 * Example:
 * ```typescript
 * const tasks = await apiCall<TaskResponse[]>('/api/v1/tasks');
 * const task = await apiCall<TaskResponse>('/api/v1/tasks', {
 *   method: 'POST',
 *   body: JSON.stringify({ title: 'New task' })
 * });
 * ```
 *
 * Error Handling:
 * - 401 Unauthorized: Clears token, redirects to login
 * - 4xx/5xx: Throws error with response details
 * - Network errors: Throws with error message
 */
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Get stored JWT token
  const token = await getToken();

  // Build request headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(typeof options?.headers === "object"
      ? (options.headers as Record<string, string>)
      : {}),
  };

  // Add Bearer token to Authorization header if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    // Make fetch request to API
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized (token invalid/expired)
    if (response.status === 401) {
      // Clear stored credentials
      await logout();

      // Redirect to login page in browser context
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }

      // Throw error for caller context
      throw new Error("Session expired. Redirecting to login...");
    }

    // Check if response is ok (status 200-299)
    if (!response.ok) {
      // Try to parse error details from response
      const error = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`,
      }));

      throw new Error(error.detail || `API error: ${response.status}`);
    }

    // Handle 204 No Content (no response body)
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse and return JSON response
    return (await response.json()) as T;
  } catch (error) {
    // Re-throw with context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`API call failed: ${String(error)}`);
  }
}

/**
 * Convenience method: GET request
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, { method: "GET" });
}

/**
 * Convenience method: POST request with JSON body
 */
export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiCall<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience method: PUT request with JSON body
 */
export async function apiPut<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiCall<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience method: PATCH request with JSON body
 */
export async function apiPatch<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiCall<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience method: DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, { method: "DELETE" });
}
