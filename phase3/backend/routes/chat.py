# [Task]: T-M2-008
# [From]: .specify/plans/ai-chatbot.md §4.0 (Chat Endpoint), specs/002-ai-chatbot-specs/checklists/requirements.md §Chat API
# [Phase]: III (Chat Endpoint - Stateless Chatbot Interface)
# [Reference]: Constitution §XII (Statelessness), Constitution §X (Persistence), Constitution §I (User-Scoped Operations)

"""Chat endpoint for AI-Powered Todo Chatbot.

POST /api/v1/chat: Handles chat interactions with OpenAI Agent + MCP Tools.
GET /api/v1/conversations: List user's conversations (paginated).
GET /api/v1/conversations/{conversation_id}/messages: Fetch messages in a conversation (paginated).

Flow: Validate JWT → Extract user_id → Process message via Agent → Return response.
Stateless: Agent fresh per request, conversation history from DB only.
"""

from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, Request, status, Query
from pydantic import BaseModel, Field
from sqlmodel import Session, select
from typing import Optional, List, Dict, Any

from backend.db import get_session
from backend.models.conversation import Conversation, ConversationResponse
from backend.models.message import Message, MessageResponse
from backend.services.chat_agent import ChatAgentService
from backend.utils.errors import NotFoundError, BadRequestError

# Create router for chat endpoints
router = APIRouter()


# ============================================================================
# Request/Response Models (Chat API contracts)
# ============================================================================

class ChatRequest(BaseModel):
    """Chat endpoint request: message and optional conversation_id."""

    model_config = {
        "json_schema_extra": {
            "example": {
                "message": "What tasks do I have?",
                "conversation_id": None
            }
        }
    }

    message: str = Field(
        min_length=1,
        max_length=10000,
        description="User's message (required, 1-10000 characters)"
    )
    conversation_id: Optional[UUID] = Field(
        default=None,
        description="Existing conversation ID (optional, creates new if omitted)"
    )


class ChatResponse(BaseModel):
    """Chat endpoint response: conversation_id, agent_response, and tool_calls audit trail."""

    model_config = {
        "json_schema_extra": {
            "example": {
                "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
                "agent_response": "You have 3 incomplete tasks",
                "tool_calls": [
                    {
                        "tool_name": "todo_list",
                        "input": {"completed": False, "limit": 100, "offset": 0},
                        "result": {
                            "success": True,
                            "tasks": [
                                {
                                    "task_id": "...",
                                    "title": "Buy groceries",
                                    "completed": False
                                }
                            ],
                            "total_count": 3
                        }
                    }
                ]
            }
        }
    }

    conversation_id: UUID = Field(
        description="Conversation ID (new or existing)"
    )
    agent_response: str = Field(
        description="Agent's text response (may include Markdown formatting)"
    )
    tool_calls: List[Dict[str, Any]] = Field(
        default=[],
        description="Array of Tool calls made by Agent (audit trail for conversation replay)"
    )


class MessagesListResponse(BaseModel):
    """Paginated list of messages in a conversation."""

    model_config = {
        "json_schema_extra": {
            "example": {
                "data": [
                    {
                        "id": "msg-123",
                        "conversation_id": "conv-456",
                        "user_id": "user-789",
                        "role": "user",
                        "content": "What tasks do I have?",
                        "tool_calls": None,
                        "created_at": "2026-02-08T10:00:00Z"
                    }
                ],
                "total": 5,
                "limit": 50,
                "offset": 0
            }
        }
    }

    data: List[MessageResponse] = Field(
        description="List of message objects"
    )
    total: int = Field(
        description="Total number of messages in conversation"
    )
    limit: int = Field(
        description="Pagination limit (items per page)"
    )
    offset: int = Field(
        description="Pagination offset (number of items skipped)"
    )


# ============================================================================
# Chat Endpoint
# ============================================================================

# [Task]: T-M2-008
# POST /api/v1/chat - Chat with AI Agent
@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_endpoint(
    request: Request,
    chat_request: ChatRequest,
    session: Session = Depends(get_session),
) -> ChatResponse:
    """Chat with AI Agent for natural language task management.

    [Task]: T-M2-008 | [From]: plan.md §4.0

    Authorization required (Bearer JWT). Extracts user_id from token (never from body).
    Processes message via stateless Agent, returns conversation_id, agent_response, tool_calls.
    All Tool calls scoped by user_id. Every message/response persisted to database.
    Errors: 400 (invalid message), 401 (missing JWT), 404 (conversation not found/not owned).
    """

    try:
        # Step 1: Extract user_id from JWT (enforced by middleware)
        user_id = request.state.user_id

        # Step 2: Validate request (ChatRequest model handles validation)
        # ChatRequest ensures:
        # - message is 1-10000 characters
        # - conversation_id is optional UUID (if provided)

        # Step 3: Initialize stateless Chat Agent Service
        # NO global state maintained; Agent created fresh per request
        agent_service = ChatAgentService()

        # Step 4: Process message through Agent
        # This will:
        # - Get/create conversation
        # - Store user message
        # - Fetch conversation history from DB
        # - Initialize fresh OpenAI Agent with Tools
        # - Agent calls Tools via OpenAI API
        # - Store agent response + Tool calls
        response = agent_service.process_message(
            session=session,
            user_id=user_id,
            message=chat_request.message,
            conversation_id=chat_request.conversation_id,
        )

        # Step 5: Return ChatResponse
        return ChatResponse(
            conversation_id=response["conversation_id"],
            agent_response=response["agent_response"],
            tool_calls=response["tool_calls"],
        )

    except NotFoundError as e:
        # Conversation doesn't exist or user doesn't own it
        raise NotFoundError(str(e))

    except BadRequestError as e:
        # Input validation failed
        raise BadRequestError(str(e))

    except Exception as e:
        # Unexpected error (log internally, return generic message to user)
        # In production: log e to error tracking service, don't expose details
        raise BadRequestError("Failed to process message. Please try again.")


# ============================================================================
# Conversations Endpoints
# ============================================================================

# [Task]: T-M3-XXX (Conversations Listing)
# GET /api/v1/conversations - List user's conversations (paginated)
@router.get("/conversations", response_model=List[ConversationResponse], status_code=status.HTTP_200_OK)
async def list_conversations(
    request: Request,
    session: Session = Depends(get_session),
    limit: int = Query(20, ge=1, le=100, description="Number of conversations to return (1-100)"),
    offset: int = Query(0, ge=0, description="Number of conversations to skip (>=0)"),
) -> List[ConversationResponse]:
    """List user's recent conversations with pagination.

    [From]: specs/002-ai-chatbot-specs/requirements.md §Conversation Management
    [Phase]: III (Chat UI - Fetch Conversations)

    Authorization required (Bearer JWT). Extracts user_id from token.
    Returns list of conversations ordered by most recent first.
    Only returns conversations owned by the authenticated user.
    Supports pagination via limit/offset query parameters.
    """

    try:
        # Step 1: Extract user_id from JWT (enforced by middleware)
        user_id = request.state.user_id

        # Step 2: Query conversations for user (scoped by user_id)
        # Query conversations with pagination
        query = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())  # Most recent first
            .limit(limit)
            .offset(offset)
        )
        conversations = session.exec(query).all()

        # Step 3: Convert to response models
        conversation_responses = [
            ConversationResponse.model_validate(conv) for conv in conversations
        ]

        # Step 4: Return conversation list
        return conversation_responses

    except Exception as e:
        # Log error internally, return generic message
        raise BadRequestError("Failed to fetch conversations. Please try again.")


# [Task]: T-M3-XXX (Conversation Update)
# PATCH /api/v1/conversations/{conversation_id} - Update conversation (rename)
@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse, status_code=status.HTTP_200_OK)
async def update_conversation(
    request: Request,
    conversation_id: UUID,
    session: Session = Depends(get_session),
    title: Optional[str] = None,
) -> ConversationResponse:
    """Update conversation (rename title).

    [From]: specs/002-ai-chatbot-specs/requirements.md §Conversation Management
    [Phase]: III (Chat UI - Update Conversation)

    Authorization required (Bearer JWT). Extracts user_id from token.
    Only user who owns the conversation can update it.
    Errors: 404 if conversation doesn't exist or user doesn't own it.
    """

    try:
        # Step 1: Extract user_id from JWT
        user_id = request.state.user_id

        # Step 2: Verify conversation exists and is owned by user
        conversation_query = select(Conversation).where(
            (Conversation.id == conversation_id) & (Conversation.user_id == user_id)
        )
        conversation = session.exec(conversation_query).first()

        if not conversation:
            raise NotFoundError(
                f"Conversation not found or you don't have permission to access it."
            )

        # Step 3: Update conversation fields
        if title is not None:
            conversation.title = title
        conversation.updated_at = datetime.utcnow()

        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        # Step 4: Return updated conversation
        return ConversationResponse.model_validate(conversation)

    except NotFoundError as e:
        raise NotFoundError(str(e))

    except Exception as e:
        # Log error internally, return generic message
        raise BadRequestError("Failed to update conversation. Please try again.")


# [Task]: T-M3-XXX (Conversation Deletion)
# DELETE /api/v1/conversations/{conversation_id} - Delete conversation
@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    request: Request,
    conversation_id: UUID,
    session: Session = Depends(get_session),
) -> None:
    """Delete conversation and all its messages.

    [From]: specs/002-ai-chatbot-specs/requirements.md §Conversation Management
    [Phase]: III (Chat UI - Delete Conversation)

    Authorization required (Bearer JWT). Extracts user_id from token.
    Only user who owns the conversation can delete it.
    Errors: 404 if conversation doesn't exist or user doesn't own it.
    """

    try:
        # Step 1: Extract user_id from JWT
        user_id = request.state.user_id

        # Step 2: Verify conversation exists and is owned by user
        conversation_query = select(Conversation).where(
            (Conversation.id == conversation_id) & (Conversation.user_id == user_id)
        )
        conversation = session.exec(conversation_query).first()

        if not conversation:
            raise NotFoundError(
                f"Conversation not found or you don't have permission to access it."
            )

        # Step 3: Delete conversation (cascade will delete messages)
        session.delete(conversation)
        session.commit()

    except NotFoundError as e:
        raise NotFoundError(str(e))

    except Exception as e:
        # Log error internally, return generic message
        raise BadRequestError("Failed to delete conversation. Please try again.")


# [Task]: T-M3-XXX (Messages Listing)
# GET /api/v1/conversations/{conversation_id}/messages - List messages in conversation
@router.get("/conversations/{conversation_id}/messages", response_model=MessagesListResponse, status_code=status.HTTP_200_OK)
async def list_conversation_messages(
    request: Request,
    conversation_id: UUID,
    session: Session = Depends(get_session),
    limit: int = Query(50, ge=1, le=100, description="Number of messages to return (1-100)"),
    offset: int = Query(0, ge=0, description="Number of messages to skip (>=0)"),
) -> MessagesListResponse:
    """Fetch messages in a specific conversation with pagination.

    [From]: specs/002-ai-chatbot-specs/requirements.md §Message History
    [Phase]: III (Chat UI - Fetch Message History)

    Authorization required (Bearer JWT). Extracts user_id from token.
    Returns paginated list of messages ordered chronologically (oldest first).
    Only returns messages from conversations owned by the authenticated user.
    Errors: 404 if conversation doesn't exist or user doesn't own it.
    """

    try:
        # Step 1: Extract user_id from JWT
        user_id = request.state.user_id

        # Step 2: Verify conversation exists and is owned by user
        conversation_query = select(Conversation).where(
            (Conversation.id == conversation_id) & (Conversation.user_id == user_id)
        )
        conversation = session.exec(conversation_query).first()

        if not conversation:
            raise NotFoundError(
                f"Conversation not found or you don't have permission to access it."
            )

        # Step 3: Query messages in conversation (scoped by conversation_id + user_id)
        # Count total messages
        count_query = select(Message).where(
            (Message.conversation_id == conversation_id) & (Message.user_id == user_id)
        )
        total_count = len(session.exec(count_query).all())

        # Query messages with pagination (order by created_at ascending = oldest first)
        query = (
            select(Message)
            .where((Message.conversation_id == conversation_id) & (Message.user_id == user_id))
            .order_by(Message.created_at.asc())  # Oldest first (chronological)
            .limit(limit)
            .offset(offset)
        )
        messages = session.exec(query).all()

        # Step 4: Convert to response models
        message_responses = [
            MessageResponse.model_validate(msg) for msg in messages
        ]

        # Step 5: Return paginated response with 'data' field (matches frontend type)
        return MessagesListResponse(
            data=message_responses,
            total=total_count,
            limit=limit,
            offset=offset,
        )

    except NotFoundError as e:
        raise NotFoundError(str(e))

    except Exception as e:
        # Log error internally, return generic message
        raise BadRequestError("Failed to fetch messages. Please try again.")
