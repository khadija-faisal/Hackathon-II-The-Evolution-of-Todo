# [Task]: T-M2-006
# [From]: .specify/plans/ai-chatbot.md §3.3 (MCP Server Initialization), specs/002-ai-chatbot-specs/checklists/requirements.md §MCP Server
# [Phase]: III (MCP Server Setup & Tool Registration)
# [Reference]: Constitution §VI (Tool Naming Convention), Constitution §XII (Stateless)

"""MCP Server initialization and Tool registration.

Exposes CRUD Tools (todo_create, todo_list, todo_read, todo_update, todo_delete)
to OpenAI Agents. All Tools enforce user_id isolation from JWT context.
Stateless: no global state maintained. Results recorded in messages table.
"""

from typing import Dict, Any
from sqlmodel import Session

from backend.mcp.schemas import (
    TodoCreateInput,
    TodoCreateOutput,
    TodoListInput,
    TodoListOutput,
    TodoReadInput,
    TodoReadOutput,
    TodoUpdateInput,
    TodoUpdateOutput,
    TodoDeleteInput,
    TodoDeleteOutput,
)
from backend.mcp.tools import (
    todo_create,
    todo_list,
    todo_read,
    todo_update,
    todo_delete,
)


# ============================================================================
# MCP Tool Definitions (Schema + Metadata)
# ============================================================================

TOOLS_DEFINITIONS = {
    "todo_create": {
        "name": "todo_create",
        "description": """Create a new task for the authenticated user.

Allows user to add a new todo item. Task starts as incomplete and is associated
with the authenticated user. Title is required (1-255 characters), description
is optional (max 4000 characters).

Example: "Create a task called Buy groceries with description Milk, eggs, bread"

Tool will return the created task ID and details on success.""",
        "input_schema": TodoCreateInput,
        "output_schema": TodoCreateOutput,
        "function": todo_create,
    },
    "todo_list": {
        "name": "todo_list",
        "description": """Fetch all tasks for the authenticated user with optional filtering.

Retrieves a paginated list of the user's tasks, ordered by creation date (newest first).
Supports filtering by completion status (completed, incomplete, or all).

Examples:
- "Show my tasks"
- "List incomplete tasks"
- "What do I need to do?"
- "Show completed tasks"

Returns task details including title, description, completion status, and timestamps.
Supports pagination with limit and offset parameters.""",
        "input_schema": TodoListInput,
        "output_schema": TodoListOutput,
        "function": todo_list,
    },
    "todo_read": {
        "name": "todo_read",
        "description": """Fetch details of a specific task by ID.

Retrieves full details of a single task including title, description, completion status,
and timestamps. Requires the task ID (usually obtained from todo_list or conversation context).

Example: "Tell me about task [UUID]"

Returns 404 if task doesn't exist or user doesn't own it.""",
        "input_schema": TodoReadInput,
        "output_schema": TodoReadOutput,
        "function": todo_read,
    },
    "todo_update": {
        "name": "todo_update",
        "description": """Update a specific task (PATCH semantics - all fields optional).

Modify one or more fields of an existing task:
- title: Change task name (1-255 characters)
- description: Change task details (max 4000 characters)
- completed: Mark as complete or incomplete (boolean)

Examples:
- "Mark task [UUID] as complete"
- "Change task [UUID] title to New Title"
- "Update task [UUID]: title=New Name, completed=true"

Only provided fields are updated; omitted fields remain unchanged.
Returns 404 if task doesn't exist or user doesn't own it.""",
        "input_schema": TodoUpdateInput,
        "output_schema": TodoUpdateOutput,
        "function": todo_update,
    },
    "todo_delete": {
        "name": "todo_delete",
        "description": """Delete a task permanently.

Removes a task from the user's task list. This is a permanent action with no recovery.
Requires the task ID.

Example: "Delete task [UUID]"

Returns 404 if task doesn't exist or user doesn't own it.""",
        "input_schema": TodoDeleteInput,
        "output_schema": TodoDeleteOutput,
        "function": todo_delete,
    },
}


# ============================================================================
# Tool Registration & Discovery
# ============================================================================

class MCPServer:
    """Stateless MCP Server for Tool registration and execution.

    Registers CRUD Tools, validates input against schemas, executes with user_id scope,
    and handles Tool output/errors. Discovered by OpenAI Agent Framework at initialization.
    """

    def __init__(self):
        """Initialize MCP Server with Tool registry. Stateless initialization."""
        self.tools = TOOLS_DEFINITIONS

    def get_tools(self) -> list[Dict[str, Any]]:
        """Get available Tools in OpenAI function definition format.

        Returns list of Tool definitions with name, description, and JSON schemas.
        Called by OpenAI Agent Framework during initialization for Tool discovery.
        """
        tools_list = []
        for tool_name, tool_def in self.tools.items():
            # Convert Pydantic schema to OpenAI function definition format
            input_schema = tool_def["input_schema"]
            tools_list.append({
                "type": "function",
                "function": {
                    "name": tool_def["name"],
                    "description": tool_def["description"],
                    "parameters": input_schema.model_json_schema(),
                }
            })
        return tools_list

    def get_tool(self, tool_name: str) -> Dict[str, Any]:
        """Get Tool definition by name. Raises KeyError if not found."""
        return self.tools[tool_name]

    def execute_tool(
        self,
        tool_name: str,
        user_id: str,  # UUID as string from JWT
        input_data: Dict[str, Any],
        session: Session,
    ) -> Dict[str, Any]:
        """Execute a Tool with user_id scope.

        Validates input against schema, executes Tool function, returns output dict.
        user_id is mandatory (from JWT, never from input). Tool validates ownership.
        Returns user-friendly error messages (no stack traces).
        """
        try:
            # Get Tool definition
            tool_def = self.get_tool(tool_name)

            # Validate input against schema
            input_schema = tool_def["input_schema"]
            validated_input = input_schema(**input_data)

            # Execute Tool function with user_id scope
            tool_func = tool_def["function"]
            result = tool_func(
                session=session,
                user_id=user_id,
                input_data=validated_input,
            )

            # Convert output to dict (if it's a Pydantic model)
            if hasattr(result, "model_dump"):
                return result.model_dump()
            return result

        except ValueError as e:
            # Schema validation failed
            return {
                "success": False,
                "error": f"Invalid input: {str(e)}",
            }
        except KeyError:
            # Tool doesn't exist
            return {
                "success": False,
                "error": f"Tool '{tool_name}' not found",
            }
        except Exception as e:
            # Unexpected error (don't expose internals)
            return {
                "success": False,
                "error": "Tool execution failed. Please try again.",
            }


# ============================================================================
# Singleton Instance (Lazy Initialization)
# ============================================================================

_mcp_server_instance = None


def get_mcp_server() -> MCPServer:
    """Get or create MCP Server singleton (lazy initialization).

    Stateless: same instance reused for all Tool calls. Created on first use.
    """
    global _mcp_server_instance
    if _mcp_server_instance is None:
        _mcp_server_instance = MCPServer()
    return _mcp_server_instance
