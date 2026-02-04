// [Task]: T-038, T-018
// [From]: plan.md §4.2: Better Auth Integration
// [Reference]: FR-008 (Session Management), FR-009 (JWT Tokens), Constitution §I (JWT Auth)

import { createAuthClient } from "better-auth/client"

/**
 * Better Auth Client Configuration
 *
 * This configures Better Auth CLIENT to work with our FastAPI backend.
 *
 * Architecture:
 * 1. Frontend (Better Auth Client): Manages session/UI
 * 2. Backend (FastAPI): Issues JWT tokens and verifies them
 * 3. Both: Share BETTER_AUTH_SECRET for token verification
 *
 * Flow:
 * - User logs in via Better Auth client
 * - Client calls POST /api/v1/auth/login on FastAPI
 * - FastAPI returns JWT token (HS256, signed with BETTER_AUTH_SECRET)
 * - Client stores token and includes it in Authorization header
 * - Backend middleware verifies token using same secret
 *
 * Security:
 * - BETTER_AUTH_SECRET must match between frontend and backend
 * - JWT tokens expire automatically (24 hours by default)
 * - Tokens include user_id in 'sub' claim for user isolation
 * - Tokens are verified on every protected API request
 */

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  basePath: "/api/v1/auth", // FastAPI auth endpoints path
})

