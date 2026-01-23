# [Task]: T-012
# [From]: plan.md §1.3 (JWT Middleware - Principle II Gatekeeper), Constitution §I
# [Reference]: FR-005, FR-007, Constitution §I (JWT Auth & User Isolation)

import jwt
from fastapi import Request
from fastapi.responses import JSONResponse
from backend.config import settings
from typing import Optional
from uuid import UUID


class JWTMiddlewareException(Exception):
    """JWT verification failed"""
    pass


async def jwt_middleware(request: Request, call_next):
    """FastAPI middleware for JWT token verification

    Principle I Enforcement (Constitution):
    - Extract Authorization: Bearer <token> header
    - Verify JWT signature using BETTER_AUTH_SECRET (HS256)
    - Extract user_id from 'sub' claim
    - Attach user_id to request.state for downstream handlers
    - Return 401 for missing/invalid/expired tokens

    Public Routes (no JWT required):
    - /health (health check)
    - /api/v1/auth/login (login endpoint)
    - /api/v1/auth/register (registration endpoint)

    Protected Routes (JWT required):
    - All other routes return 401 if no valid token

    Security Model:
    - Signature verification ensures token not tampered with
    - Expiration check ensures token not reused after expiry
    - user_id extraction populates request.state for authorization
    - Defense-in-depth: JWT + database query filtering by user_id
    """

    # Define public routes that don't require JWT
    public_routes = {"/health", "/api/v1/auth/login", "/api/v1/auth/register"}
    request_path = request.url.path

    # Skip JWT validation for public routes
    if request_path in public_routes:
        return await call_next(request)

    try:
        # Extract Authorization header
        auth_header = request.headers.get("authorization", "")

        if not auth_header:
            return JSONResponse(
                {
                    "detail": "Unauthorized",
                    "code": "AUTH_FAILED",
                    "error": "Missing Authorization header"
                },
                status_code=401
            )

        # Parse Bearer token format: "Bearer <token>"
        if not auth_header.startswith("Bearer "):
            return JSONResponse(
                {
                    "detail": "Unauthorized",
                    "code": "AUTH_FAILED",
                    "error": "Invalid Authorization header format. Expected: Bearer <token>"
                },
                status_code=401
            )

        token = auth_header[7:]  # Remove "Bearer " prefix

        # Verify JWT signature and extract claims
        try:
            payload = jwt.decode(
                token,
                settings.BETTER_AUTH_SECRET,
                algorithms=["HS256"]
            )
        except jwt.ExpiredSignatureError:
            return JSONResponse(
                {
                    "detail": "Unauthorized",
                    "code": "AUTH_FAILED",
                    "error": "Token expired"
                },
                status_code=401
            )
        except jwt.InvalidTokenError as e:
            return JSONResponse(
                {
                    "detail": "Unauthorized",
                    "code": "AUTH_FAILED",
                    "error": f"Invalid token: {str(e)}"
                },
                status_code=401
            )

        # Extract user_id from 'sub' claim
        user_id_str = payload.get("sub")

        if not user_id_str:
            return JSONResponse(
                {
                    "detail": "Unauthorized",
                    "code": "AUTH_FAILED",
                    "error": "Token missing 'sub' claim (user_id)"
                },
                status_code=401
            )

        # Parse user_id as UUID
        try:
            user_id = UUID(user_id_str)
        except ValueError:
            return JSONResponse(
                {
                    "detail": "Unauthorized",
                    "code": "AUTH_FAILED",
                    "error": "Invalid user_id format in token"
                },
                status_code=401
            )

        # Attach user_id to request state for use in route handlers
        request.state.user_id = user_id

        # Proceed to next middleware/route handler
        return await call_next(request)

    except Exception as e:
        # Catch any unexpected errors and return 500
        return JSONResponse(
            {
                "detail": "Internal Server Error",
                "code": "SERVER_ERROR",
                "error": f"JWT middleware error: {str(e)}"
            },
            status_code=500
        )
