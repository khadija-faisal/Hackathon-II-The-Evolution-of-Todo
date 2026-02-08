# MCP (Model Context Protocol) Module
# Defines MCP Tools for CRUD operations and MCP Server setup
# [Task]: T-M2-001, T-M2-002-006
# [Phase]: III (MCP Tool Integration)

from backend.mcp.schemas import (
    # Tool Schemas - Create
    TodoCreateInput,
    TodoCreateOutput,
    # Tool Schemas - List
    TodoListInput,
    TodoListItemOutput,
    TodoListOutput,
    # Tool Schemas - Read
    TodoReadInput,
    TodoReadOutput,
    # Tool Schemas - Update
    TodoUpdateInput,
    TodoUpdateOutput,
    # Tool Schemas - Delete
    TodoDeleteInput,
    TodoDeleteOutput,
)

__all__ = [
    # Create
    "TodoCreateInput",
    "TodoCreateOutput",
    # List
    "TodoListInput",
    "TodoListItemOutput",
    "TodoListOutput",
    # Read
    "TodoReadInput",
    "TodoReadOutput",
    # Update
    "TodoUpdateInput",
    "TodoUpdateOutput",
    # Delete
    "TodoDeleteInput",
    "TodoDeleteOutput",
]
