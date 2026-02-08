// [Task]: T-020
// [From]: rest-endpoints.md §Pydantic Models, schema.md §Database Models
// [Reference]: Constitution §VII (Type Safety & Validation)

/**
 * TypeScript type definitions matching backend Pydantic models
 *
 * Principles:
 * - All types correspond 1:1 with backend models
 * - Ensures type safety across HTTP API boundary
 * - Frontend and backend models always in sync
 * - Used for request validation and response typing
 */

/**
 * Task response model (read-only representation)
 * Returned by all task endpoints
 */
export interface TaskResponse {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Task list response with pagination
 * Returned by GET /api/v1/tasks
 */
export interface TaskListResponse {
  data: TaskResponse[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * User response model (excludes password_hash)
 * Returned by auth endpoints
 */
export interface UserResponse {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Authentication response
 * Returned by POST /api/v1/auth/login and POST /api/v1/auth/register
 *
 * Contains:
 * - access_token: JWT Bearer token for subsequent requests
 * - token_type: Always "Bearer" (RFC 6750 standard)
 * - user: Authenticated user details (no password)
 * - expires_in: Token expiration in seconds (optional)
 */
export interface AuthResponse {
  access_token: string;
  token_type: "Bearer";
  user: UserResponse;
  expires_in?: number;
}

/**
 * Create task request model
 * Expected by POST /api/v1/tasks
 *
 * Note: user_id is NOT included (extracted from JWT by backend)
 */
export interface TaskCreateRequest {
  title: string;
  description?: string;
}

/**
 * Update task request model
 * Expected by PATCH and PUT endpoints
 *
 * All fields optional for partial updates (PATCH behavior)
 */
export interface TaskUpdateRequest {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

/**
 * Login request model
 * Expected by POST /api/v1/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request model
 * Expected by POST /api/v1/auth/register
 */
export interface RegisterRequest {
  email: string;
  password: string;
}

/**
 * API error response
 * Used for error handling across all endpoints
 */
export interface ApiError {
  detail: string;
  code: string;
  error?: string;
}

/**
 * Tool call record in conversation
 * Represents a Tool invoked by the Agent with input and output
 */
export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status?: "pending" | "completed" | "failed";
}

/**
 * Message in a conversation thread
 * Either from user or agent, includes optional Tool calls
 */
export interface MessageResponse {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "agent";
  content: string;
  tool_calls?: ToolCall[];
  created_at: string;
}

/**
 * Conversation thread metadata
 * Minimal representation for listing conversations
 */
export interface ConversationResponse {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

/**
 * Chat request to Agent
 * Sent to POST /api/v1/chat
 */
export interface ChatRequest {
  message: string;
  conversation_id?: string | null;
}

/**
 * Chat response from Agent
 * Returned by POST /api/v1/chat
 */
export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  user_message: string;
  agent_response: string;
  tool_calls?: ToolCall[];
  created_at: string;
}

/**
 * Paginated message list response
 * Returned by GET /api/v1/conversations/{id}/messages
 */
export interface MessageListResponse {
  data: MessageResponse[];
  total: number;
  limit: number;
  offset: number;
}
