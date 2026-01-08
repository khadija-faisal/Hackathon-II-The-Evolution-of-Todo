# [Task]: T-010, T-014, T-018, T-021, T-022
# [From]: speckit.plan §2.2 CLI Design, speckit.plan §4.1 Module Responsibilities
# Implements: M-002 (US-1, US-2), M-003 (US-3), M-004 (US-4, US-5)

"""CLI entry point with argparse subcommand routing.

Handles argument parsing, command dispatch, error handling, and output formatting.
"""

import argparse
import sys
from typing import Optional

from .manager import TaskManager


def format_table(headers: list, rows: list) -> str:
    """Format a simple ASCII table.

    Args:
        headers: List of column names.
        rows: List of row data (each row is a tuple).

    Returns:
        Formatted table as a string.
    """
    if not rows:
        return ""

    # Calculate column widths
    col_widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            col_widths[i] = max(col_widths[i], len(str(cell)))

    # Build table
    separator = " | ".join("-" * w for w in col_widths)
    header_row = " | ".join(
        h.ljust(w) for h, w in zip(headers, col_widths)
    )

    table_lines = [header_row, separator]
    for row in rows:
        row_str = " | ".join(
            str(cell).ljust(w) for cell, w in zip(row, col_widths)
        )
        table_lines.append(row_str)

    return "\n".join(table_lines)


def cmd_add(args: argparse.Namespace) -> None:
    """Handle 'add' command.

    [Task]: T-010
    [From]: spec.md §109 FR-001, speckit.plan §2.2 CLI Design
    Implements: M-002 (US-1 Add Task)
    """
    try:
        task = TaskManager.add_task(args.title)
        print(f"✓ Task \"{task.title}\" added with ID {task.id}.")
    except ValueError as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


def cmd_list(args: argparse.Namespace) -> None:
    """Handle 'list' command.

    [Task]: T-014
    [From]: spec.md §112 FR-004, speckit.plan §2.2 CLI Design
    Implements: M-002 (US-2 List Tasks)
    """
    tasks = TaskManager.list_tasks()

    if not tasks:
        print("No tasks found.")
        return

    headers = ["ID", "Title", "Status"]
    rows = [(task.id, task.title, task.status) for task in tasks]

    table = format_table(headers, rows)
    print(table)
    print("\nData stored at: ~/.todo/tasks.json")


def cmd_complete(args: argparse.Namespace) -> None:
    """Handle 'complete' command.

    [Task]: T-018
    [From]: spec.md §113 FR-005, speckit.plan §2.2 CLI Design
    Implements: M-003 (US-3 Mark Task Complete)
    """
    try:
        task = TaskManager.complete_task(args.id)
        if task.status == "completed":
            print(f"✓ Task {task.id} marked as complete.")
        else:
            print(f"Task {task.id} is already completed.")
    except ValueError as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


def cmd_update(args: argparse.Namespace) -> None:
    """Handle 'update' command.

    [Task]: T-021
    [From]: spec.md §114 FR-006, speckit.plan §2.2 CLI Design
    Implements: M-004 (US-4 Update Task)
    """
    try:
        task = TaskManager.update_task(args.id, args.title)
        print(f"✓ Task {task.id} updated.")
    except ValueError as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


def cmd_delete(args: argparse.Namespace) -> None:
    """Handle 'delete' command.

    [Task]: T-022
    [From]: spec.md §115 FR-007, speckit.plan §2.2 CLI Design
    Implements: M-004 (US-5 Delete Task)
    """
    try:
        TaskManager.delete_task(args.id)
        print(f"✓ Task {args.id} deleted.")
    except ValueError as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


def main() -> None:
    """Main CLI entry point with argparse subcommand routing.

    Usage:
        todo add "<title>"
        todo list
        todo complete <id>
        todo update <id> "<title>"
        todo delete <id>
    """
    parser = argparse.ArgumentParser(
        description="CLI Foundation - Python Todo Console App",
        prog="todo",
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # 'add' command
    add_parser = subparsers.add_parser("add", help="Create a new task")
    add_parser.add_argument("title", type=str, help="Task title (1-255 characters)")
    add_parser.set_defaults(func=cmd_add)

    # 'list' command
    list_parser = subparsers.add_parser("list", help="List all tasks")
    list_parser.set_defaults(func=cmd_list)

    # 'complete' command
    complete_parser = subparsers.add_parser(
        "complete", help="Mark a task as completed"
    )
    complete_parser.add_argument("id", type=int, help="Task ID")
    complete_parser.set_defaults(func=cmd_complete)

    # 'update' command
    update_parser = subparsers.add_parser("update", help="Update a task title")
    update_parser.add_argument("id", type=int, help="Task ID")
    update_parser.add_argument("title", type=str, help="New task title")
    update_parser.set_defaults(func=cmd_update)

    # 'delete' command
    delete_parser = subparsers.add_parser("delete", help="Delete a task")
    delete_parser.add_argument("id", type=int, help="Task ID")
    delete_parser.set_defaults(func=cmd_delete)

    args = parser.parse_args()

    if not hasattr(args, "func"):
        parser.print_help()
        sys.exit(0)

    args.func(args)


if __name__ == "__main__":
    main()
