# [Task]: T-007
# [From]: speckit.specify §94-100 Edge Cases, speckit.plan §3.5 Validation
# Implements: M-001 (Foundation & Setup)

"""Input validation with clear error messages.

Validates user input (titles, task IDs, etc.) and raises ValueError
with user-friendly, actionable error messages per Constitution §VI.
"""

from typing import List
from .models import Task


def validate_title(title: str) -> None:
    """Validate a task title.

    Args:
        title: The title to validate.

    Raises:
        ValueError: If title is empty or exceeds 255 characters.
    """
    if not title or not str(title).strip():
        raise ValueError("Task title cannot be empty")

    if len(str(title)) > 255:
        raise ValueError("Task title must be 255 characters or fewer")


def validate_task_id(task_id: int) -> None:
    """Validate a task ID.

    Args:
        task_id: The task ID to validate.

    Raises:
        ValueError: If task_id is not a positive integer.
    """
    try:
        task_id_int = int(task_id)
    except (ValueError, TypeError):
        raise ValueError("Task ID must be a positive number")

    if task_id_int <= 0:
        raise ValueError("Task ID must be a positive number")


def validate_task_exists(tasks: List[Task], task_id: int) -> Task:
    """Find a task by ID and validate it exists.

    Args:
        tasks: List of Task objects to search.
        task_id: The task ID to find.

    Returns:
        The Task object with the matching ID.

    Raises:
        ValueError: If task_id is not found in the task list.
    """
    validate_task_id(task_id)

    for task in tasks:
        if task.id == task_id:
            return task

    raise ValueError(
        f"Task ID {task_id} not found. Use 'todo list' to see available tasks"
    )
