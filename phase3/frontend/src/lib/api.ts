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

// ============================================================================
// Phase 3: Chat & Conversation APIs
// ============================================================================
// [Task]: T-M3-006
// [From]: plan.md §Part 6 M3-T6, Part 5.2; requirements.md §API Specification
// [Phase]: III (Chat Integration)

import type {
  ChatRequest,
  ChatResponse,
  ConversationResponse,
  MessageListResponse,
} from "./types";

/**
 * Send a message to the chatbot Agent
 * Creates a new conversation if conversation_id is null
 * Stores user message and agent response in database
 * Automatically attaches JWT token to request
 *
 * @param message - User message text
 * @param conversationId - Optional conversation ID; creates new if null
 * @returns ChatResponse with agent response and Tool calls
 */
export async function apiChat(
  message: string,
  conversationId?: string | null
): Promise<ChatResponse> {
  const body: ChatRequest = {
    message,
    conversation_id: conversationId ?? null,
  };
  return apiPost<ChatResponse>("/api/v1/chat", body);
}

/**
 * Fetch all conversations for authenticated user
 * Returns list of conversation metadata with most recent first
 * Supports pagination via limit/offset
 *
 * @param limit - Number of conversations to fetch (default: 20)
 * @param offset - Pagination offset (default: 0)
 * @returns List of conversations
 */
export async function apiGetConversations(
  limit: number = 20,
  offset: number = 0
): Promise<ConversationResponse[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiGet<ConversationResponse[]>(`/api/v1/conversations?${params.toString()}`);
}

/**
 * Fetch message history for a specific conversation
 * Returns all messages in chronological order
 * Each message includes Tool calls if Agent invoked any
 * Verifies user ownership before returning data
 *
 * @param conversationId - ID of conversation to fetch
 * @param limit - Number of messages to fetch (default: 100)
 * @param offset - Pagination offset (default: 0)
 * @returns Message list with pagination info
 */
export async function apiGetMessages(
  conversationId: string,
  limit: number = 100,
  offset: number = 0
): Promise<MessageListResponse> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiGet<MessageListResponse>(
    `/api/v1/conversations/${conversationId}/messages?${params.toString()}`
  );
}

/**
 * Update conversation (rename title)
 * Only the conversation owner can update it
 *
 * @param conversationId - ID of conversation to update
 * @param title - New title for the conversation
 * @returns Updated conversation
 */
export async function apiUpdateConversation(
  conversationId: string,
  title: string
): Promise<ConversationResponse> {
  return apiPatch<ConversationResponse>(
    `/api/v1/conversations/${conversationId}?title=${encodeURIComponent(title)}`
  );
}

/**
 * Delete a conversation and all its messages
 * Only the conversation owner can delete it
 *
 * @param conversationId - ID of conversation to delete
 */
export async function apiDeleteConversation(conversationId: string): Promise<void> {
  return apiDelete(`/api/v1/conversations/${conversationId}`);
}
