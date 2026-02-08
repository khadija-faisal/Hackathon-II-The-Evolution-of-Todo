#!/usr/bin/env python3
"""
MCP Server for Spec-KitPlus Commands
Reads markdown command files from .claude/commands/ and exposes them as MCP prompts
"""

import os
import sys
import json
from pathlib import Path
from typing import Optional
import yaml
import logging

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    ListPromptsRequest,
    GetPromptRequest,
    Prompt,
    PromptArgument,
    TextContent,
)

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create MCP Server
server = Server("spec-kit-plus")

# Global storage for loaded commands
COMMANDS = {}


def load_commands():
    """Load all command markdown files from .claude/commands/"""
    commands_dir = Path(".claude/commands")

    if not commands_dir.exists():
        logger.warning(f"Commands directory not found: {commands_dir}")
        return

    for md_file in sorted(commands_dir.glob("*.md")):
        try:
            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()

            # Parse YAML frontmatter
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    frontmatter_text = parts[1]
                    body = parts[2].strip()

                    frontmatter = yaml.safe_load(frontmatter_text)

                    command_name = md_file.stem  # filename without .md
                    description = frontmatter.get("description", "No description available")

                    COMMANDS[command_name] = {
                        "name": command_name,
                        "description": description,
                        "file": str(md_file),
                        "content": content,
                        "body": body,
                        "frontmatter": frontmatter,
                    }
                    logger.info(f"Loaded command: {command_name}")

        except Exception as e:
            logger.error(f"Error loading {md_file}: {e}")


@server.list_prompts()
async def handle_list_prompts(request: ListPromptsRequest):
    """List all available Spec-KitPlus commands as prompts"""
    prompts = []

    for command_name, command_data in COMMANDS.items():
        prompt = Prompt(
            name=command_name,
            description=command_data["description"],
            arguments=[
                PromptArgument(
                    name="input",
                    description="Optional input or arguments for the command",
                    required=False,
                )
            ],
        )
        prompts.append(prompt)

    return prompts


@server.get_prompt()
async def handle_get_prompt(request: GetPromptRequest):
    """Get the full content of a specific command prompt"""
    command_name = request.name

    if command_name not in COMMANDS:
        return Prompt(
            name=command_name,
            description=f"Command '{command_name}' not found",
        )

    command_data = COMMANDS[command_name]

    # Build the prompt content with full markdown
    prompt_content = f"""# {command_name}

**Description**: {command_data['description']}

**File**: {command_data['file']}

## Full Command Content

{command_data['content']}
"""

    # Handle optional input argument
    messages = [TextContent(type="text", text=prompt_content)]

    if request.arguments:
        for arg_name, arg_value in request.arguments.items():
            if arg_name == "input" and arg_value:
                messages.append(
                    TextContent(
                        type="text",
                        text=f"\n## User Input:\n{arg_value}"
                    )
                )

    return Prompt(
        name=command_name,
        description=command_data["description"],
        messages=messages,
    )


async def main():
    """Main entry point - run the MCP server"""
    load_commands()

    if not COMMANDS:
        logger.warning("No commands loaded!")
    else:
        logger.info(f"Loaded {len(COMMANDS)} commands")

    # Run server on stdio
    logger.info("Spec-KitPlus MCP Server running on stdio")
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    import asyncio
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server shutting down...")
        sys.exit(0)
