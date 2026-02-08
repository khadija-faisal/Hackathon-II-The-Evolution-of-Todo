-- [Task]: T-M1-002
-- [From]: specs/database/schema.md §Table: messages, plan.md §Part 6 M1-T2
-- [Phase]: III (Chat message history with tool call audit trail)
-- [Purpose]: Create messages table for storing AI chatbot conversation history and tool call results

-- Drop table if exists (for idempotent re-runs in development)
DROP TABLE IF EXISTS messages CASCADE;

-- Create messages table with proper schema and constraints
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'agent')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_conversation_id FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance optimization

-- Index 1: Fast retrieval of all messages in a conversation
-- Common query: SELECT * FROM messages WHERE conversation_id = :cid ORDER BY created_at
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Index 2: User-scoped queries for audit trail and message history
-- Common query: SELECT * FROM messages WHERE user_id = :uid
CREATE INDEX idx_messages_user_id ON messages(user_id);

-- Index 3: Composite index for retrieving conversation thread in chronological order
-- Enables both filtering (conversation_id) and sorting (created_at ASC) efficiently
-- Common query: SELECT * FROM messages WHERE conversation_id = :cid ORDER BY created_at ASC
CREATE INDEX idx_messages_conversation_id_created_at ON messages(conversation_id, created_at ASC);

-- Verify table created successfully
-- SELECT * FROM messages LIMIT 0;  -- Returns empty result set with correct schema

-- Note on tool_calls JSONB column:
-- Stores structured data about Tool invocations made by the agent
-- Example structure:
-- [
--   {
--     "tool_name": "todo_create",
--     "input": {"title": "...", "description": "..."},
--     "result": {"task_id": "...", "success": true}
--   }
-- ]
