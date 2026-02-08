-- [Task]: T-M1-001
-- [From]: specs/database/schema.md §Table: conversations, plan.md §Part 6 M1-T1
-- [Phase]: III (Conversation persistence for chatbot)
-- [Purpose]: Create conversations table for storing AI chatbot conversation threads

-- Drop table if exists (for idempotent re-runs in development)
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table with proper schema and constraints
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversations_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance optimization
-- Index 1: Fast filtering by user_id (common query: list conversations for a user)
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- Index 2: Composite index for dashboard query pattern
-- Lists user's conversations ordered by most recent (updated_at DESC)
-- This enables both filtering (user_id) and sorting (updated_at DESC) efficiently
CREATE INDEX idx_conversations_user_id_updated_at ON conversations(user_id, updated_at DESC);

-- Verify table created successfully
-- SELECT * FROM conversations LIMIT 0;  -- Returns empty result set with correct schema
