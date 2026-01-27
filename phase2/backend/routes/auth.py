# [Task]: T-027+ (Authentication endpoints - login)
# [From]: rest-endpoints.md §POST /api/v1/auth/login, plan.md §1.3: JWT Middleware
# [Reference]: FR-001 (User Login), FR-002 (Verify credentials), FR-003 (JWT token issuance), Constitution §I (JWT Auth)

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime, timedelta
import jwt

from backend.db import get_session
from backend.models.user import User
from backend.schemas.auth import LoginRequest, AuthResponse, UserResponse
from backend.utils.password import verify_password
from backend.config import settings

# Create router for authentication endpoints
router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


def create_token(user_id: str, expires_in_hours: int) -> str:
    """Create JWT token with user_id in 'sub' claim

    Args:
        user_id: User ID to encode in token
        expires_in_hours: Token expiration time in hours

    Returns:
        JWT token string

    Security:
    - Uses BETTER_AUTH_SECRET from config for signing
    - HS256 algorithm for signature verification
    - Sets expiration time based on JWT_EXPIRATION_HOURS
    - user_id stored in 'sub' claim (standard JWT convention)
    """
    payload = {
        "sub": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=expires_in_hours)
    }
    token = jwt.encode(
        payload,
        settings.BETTER_AUTH_SECRET,
        algorithm="HS256"
    )
    return token


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    session: Session = Depends(get_session)
) -> AuthResponse:
    """Authenticate user and issue JWT token

    Endpoint: POST /api/v1/auth/login

    Request:
    {
        "email": "user@example.com",
        "password": "password123"
    }

    Success Response (200):
    {
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "token_type": "Bearer",
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "created_at": "2026-01-24T12:00:00Z"
        },
        "expires_in": 86400
    }

    Error Responses:
    - 400: Invalid request (validation failed)
    - 401: Invalid credentials (user not found or password mismatch)
    - 500: Server error

    Security:
    - Email and password validated against users table
    - Password verified using secure bcrypt comparison
    - JWT token issued with user_id in 'sub' claim
    - Token expiration set from JWT_EXPIRATION_HOURS config
    - No password returned in response

    Principle I (JWT Auth & User Isolation):
    - Token is stateless and signed with BETTER_AUTH_SECRET
    - user_id extracted from token on subsequent requests
    - Backend filters all queries by user_id from token

    [Task]: T-027 (Authentication endpoint)
    [Reference]: FR-001, FR-002, FR-003, FR-005
    """

    # Validate request
    if not request.email or not request.password:
        raise HTTPException(
            status_code=400,
            detail="Email and password are required"
        )

    # Find user by email (case-insensitive)
    statement = select(User).where(User.email == request.email.lower())
    user = session.exec(statement).first()

    if not user:
        # Don't reveal whether email exists (security best practice)
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Verify password using bcrypt
    if not verify_password(request.password, user.password_hash):
        # Same generic error message for security
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Create JWT token with user_id in 'sub' claim
    access_token = create_token(
        str(user.id),
        settings.JWT_EXPIRATION_HOURS
    )

    # Prepare response (exclude password_hash)
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

    return AuthResponse(
        access_token=access_token,
        token_type="Bearer",
        user=user_response,
        expires_in=settings.JWT_EXPIRATION_HOURS * 3600  # Convert hours to seconds
    )
