# [Task]: T-M1-004
# [From]: specs/database/schema.md §SQLModel Python Classes (Phase III Additions), plan.md §Part 6 M1-T3
# [Reference]: Constitution §V (User-Scoped DB Queries), Constitution §X (Persistence)

from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional


class Conversation(SQLModel, table=True):
    """Conversation database model for chat threads"""

    __tablename__ = "conversations"

    # Primary Key
    id: Optional[UUID] = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique conversation identifier (UUID)"
    )

    # Foreign Key - User Association (Principle V enforcement)
    user_id: UUID = Field(
        foreign_key="users.id",
        index=True,
        description="Conversation owner's user_id (FK to users.id, enforces user isolation)"
    )

    # Conversation Content
    title: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Conversation topic/title (optional, auto-generated or user-provided, max 255 chars)"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Conversation start timestamp (UTC)"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last message timestamp (UTC, updates when new message added)"
    )


class ConversationResponse(SQLModel):
    """API response model for conversation data"""

    id: UUID = Field(description="Conversation ID")
    user_id: UUID = Field(description="User who owns this conversation")
    title: Optional[str] = Field(default=None, description="Conversation title/topic")
    created_at: datetime = Field(description="Conversation start timestamp")
    updated_at: datetime = Field(description="Last message timestamp")


class ConversationCreateRequest(SQLModel):
    """API request model for creating a conversation"""
    """API request model for creating a new conversation

    Usage: Expected payload for POST /api/v1/conversations
    Note: user_id is NOT included (extracted from JWT by backend)
    """

    title: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Conversation title (optional, max 255 chars)"
    )
