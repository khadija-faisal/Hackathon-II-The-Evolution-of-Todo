# [Task]: T-013, T-015
# [From]: rest-endpoints.md §Pydantic Models, §POST /api/v1/auth/login, §POST /api/v1/auth/register
# [Reference]: FR-001, FR-014, Constitution §VII (Type Safety & Validation)

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional


class UserResponse(BaseModel):
    """API response model for user data (excludes password_hash)

    Usage: Returned by login, register, and user info endpoints
    Security: password_hash is intentionally excluded from this model
    """

    id: UUID = Field(description="User ID")
    email: str = Field(description="User email address")
    created_at: datetime = Field(description="Account creation timestamp")
    updated_at: Optional[datetime] = Field(
        default=None,
        description="Last update timestamp"
    )


class AuthResponse(BaseModel):
    """API response model for successful authentication

    Usage: Returned by login and register endpoints
    Contains:
    - access_token: JWT token for subsequent API requests
    - token_type: Always "Bearer" (RFC 6750 standard)
    - user: UserResponse (no password_hash)
    - expires_in: Token expiration time in seconds (optional)

    Security:
    - access_token is HS256-signed JWT with user_id in 'sub' claim
    - Token includes expiration (exp claim set to iat + JWT_EXPIRATION_HOURS)
    - Frontend stores token securely (httpOnly cookie or secure storage)
    """

    access_token: str = Field(description="JWT Bearer token for API requests")
    token_type: str = Field(default="Bearer", description="Token type (always Bearer)")
    user: UserResponse = Field(description="Authenticated user details")
    expires_in: Optional[int] = Field(
        default=None,
        description="Token expiration time in seconds"
    )


class LoginRequest(BaseModel):
    """API request model for user login

    Usage: Expected payload for POST /api/v1/auth/login
    Validation:
    - email: Valid email format (RFC 5322)
    - password: Non-empty string (min 1 char, validated server-side)

    Security:
    - HTTPS only in production
    - Password never logged or stored in request logs
    - No password complexity validation here (use at registration if needed)
    """

    email: EmailStr = Field(description="User email address")
    password: str = Field(min_length=1, description="User password (plaintext)")


class RegisterRequest(BaseModel):
    """API request model for user registration

    Usage: Expected payload for POST /api/v1/auth/register
    Validation:
    - email: Valid email format (RFC 5322)
    - password: String (server validates strength, min 8 chars recommended)

    Security:
    - Email uniqueness checked against users.email UNIQUE constraint
    - Password hashed with bcrypt before storage (never store plaintext)
    - Returns 400 if email already exists (unique constraint violation)
    """

    email: EmailStr = Field(description="New user email address")
    password: str = Field(min_length=1, description="New user password (plaintext)")
