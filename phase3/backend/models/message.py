# [Task]: T-M1-005
# [From]: specs/database/schema.md §SQLModel Python Classes (Phase III Additions), plan.md §Part 6 M1-T4
# [Reference]: Constitution §V (User-Scoped DB Queries), Constitution §X (Persistence), Constitution §XII (Stateless)

from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional, Dict, List, Any
from pydantic import ConfigDict


class ToolCall(SQLModel):
    """Tool invocation record in message audit trail"""

    tool_name: str = Field(description="Name of the Tool invoked (e.g., 'todo_create')")
    input: Dict = Field(description="Tool input parameters as dict")
    result: Dict = Field(description="Tool result/output as dict")


class Message(SQLModel, table=True):
    """Chat message with tool call audit trail"""

    __tablename__ = "messages"

    # Primary Key
    id: Optional[UUID] = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique message identifier (UUID)"
    )

    # Foreign Keys - Conversation & User Association
    conversation_id: UUID = Field(
        foreign_key="conversations.id",
        index=True,
        description="Parent conversation thread (FK to conversations.id)"
    )

    user_id: UUID = Field(
        foreign_key="users.id",
        index=True,
        description="Message author's user_id (FK to users.id, enforces user isolation)"
    )

    # Message Metadata
    role: str = Field(
        max_length=10,
        description="Message origin: 'user' (human) or 'agent' (AI)"
    )

    # Message Content
    content: str = Field(
        description="Message text (user query or agent response, may include Markdown)"
    )

    # Tool Call Audit Trail (JSONB)
    tool_calls: Optional[List[Dict[str, Any]]] = Field(
        sa_column=Column(JSON), # <--- Yeh batana lazmi hai
        default=None,
        description="JSON array of Tool invocations"
    )
    # Timestamp
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Message creation timestamp (UTC)"
    )


class MessageResponse(SQLModel):
    """API response model for message data"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID = Field(description="Message ID")
    conversation_id: UUID = Field(description="Parent conversation ID")
    user_id: UUID = Field(description="Message author's user_id")
    role: str = Field(description="Message origin ('user' or 'agent')")
    content: str = Field(description="Message text")
    tool_calls: Optional[List[Dict]] = Field(
        default=None,
        description="Tool invocations array (agent messages only)"
    )
    created_at: datetime = Field(description="Message creation timestamp")


class MessageCreateRequest(SQLModel):
    """API request model for user message"""

    content: str = Field(
        min_length=1,
        max_length=10000,
        description="Message text (required, 1-10000 characters)"
    )
