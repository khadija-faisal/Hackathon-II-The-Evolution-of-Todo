# [Task]: T-008
# [From]: plan.md §1.2 (Database Initialization), schema.md §Table: users
# [Reference]: FR-002 (verify credentials), FR-011 (secure hashing), Constitution §VII (Type Safety)

from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional


class User(SQLModel, table=True):
    """User database model - persists user authentication data

    Principles:
    - id: Unique identifier (UUID primary key)
    - email: Unique email address (UNIQUE constraint for login uniqueness)
    - password_hash: Bcrypt-hashed password (never store plaintext per Constitution §VI)
    - created_at: Account creation timestamp (UTC)
    - updated_at: Last modification timestamp (UTC)

    Security:
    - Email is indexed for fast login lookups
    - password_hash is never returned in API responses (see UserResponse)
    - All user data associated with multi-tenant tasks via tasks.user_id FK
    """

    __tablename__ = "users"

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(
        unique=True,
        index=True,
        max_length=255,
        description="Unique email address for user login"
    )
    password_hash: str = Field(
        max_length=255,
        description="Bcrypt hash of user password (never exposed in API)"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp (UTC)"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp (UTC)"
    )


class UserResponse(SQLModel):
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
