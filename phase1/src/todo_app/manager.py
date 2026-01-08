# [Task]: T-008
# [From]: speckit.plan §3.3 Core Logic, speckit.plan §4.2 Module Responsibilities
# Implements: M-001 (Foundation & Setup) + M-002 (US-1, US-2) + M-003 (US-3) + M-004 (US-4, US-5)

"""Task manager with CRUD operations.

Orchestrates validation, persistence, and business logic for all task operations.
Each operation loads tasks, validates input, performs action, and persists.
"""

from typing import List, Optional
from .models import Task
from .storage import load_tasks, save_tasks
from .validation import validate_title, validate_task_id, validate_task_exists


class TaskManager:
    """Manages task CRUD operations with validation and persistence."""

    @staticmethod
    def add_task(title: str) -> Task:
        """Create and store a new task.

        [Task]: T-009
        [From]: spec.md §14-27 User Story 1, speckit.plan §3.2 ADD Command
        Implements: M-002 (US-1 Add Task)

        Args:
            title: The task title (1-255 characters).

        Returns:
            The newly created Task object.

        Raises:
            ValueError: If title is invalid.
        """
        validate_title(title)

        tasks = load_tasks()
        next_id = max([t.id for t in tasks], default=0) + 1
        new_task = Task.create(title, next_id)
        tasks.append(new_task)
        save_tasks(tasks)

        return new_task

    @staticmethod
    def list_tasks() -> List[Task]:
        """Retrieve all tasks in ID order.

        [Task]: T-013
        [From]: spec.md §30-42 User Story 2, speckit.plan §3.2 LIST Command
        Implements: M-002 (US-2 List Tasks)

        Returns:
            List of Task objects sorted by ID (ascending).
        """
        tasks = load_tasks()
        return sorted(tasks, key=lambda t: t.id)

    @staticmethod
    def complete_task(task_id: int) -> Task:
        """Mark a task as completed.

        [Task]: T-017
        [From]: spec.md §46-58 User Story 3, speckit.plan §3.2 COMPLETE Command
        Implements: M-003 (US-3 Mark Task Complete)

        Args:
            task_id: The ID of the task to mark as completed.

        Returns:
            The updated Task object.

        Raises:
            ValueError: If task_id is invalid or not found.
        """
        validate_task_id(task_id)

        tasks = load_tasks()
        task = validate_task_exists(tasks, task_id)

        if task.status == "completed":
            return task  # Already completed, no change

        task.status = "completed"
        save_tasks(tasks)

        return task

    @staticmethod
    def update_task(task_id: int, new_title: str) -> Task:
        """Update a task's title.

        [Task]: T-020
        [From]: spec.md §62-74 User Story 4, speckit.plan §3.2 UPDATE Command
        Implements: M-004 (US-4 Update Task)

        Args:
            task_id: The ID of the task to update.
            new_title: The new task title (1-255 characters).

        Returns:
            The updated Task object.

        Raises:
            ValueError: If task_id or title is invalid, or task not found.
        """
        validate_task_id(task_id)
        validate_title(new_title)

        tasks = load_tasks()
        task = validate_task_exists(tasks, task_id)

        task.title = new_title
        save_tasks(tasks)

        return task

    @staticmethod
    def delete_task(task_id: int) -> None:
        """Delete a task from the list.

        [Task]: T-022
        [From]: spec.md §78-90 User Story 5, speckit.plan §3.2 DELETE Command
        Implements: M-004 (US-5 Delete Task)

        Args:
            task_id: The ID of the task to delete.

        Raises:
            ValueError: If task_id is invalid or task not found.
        """
        validate_task_id(task_id)

        tasks = load_tasks()
        task = validate_task_exists(tasks, task_id)

        tasks = [t for t in tasks if t.id != task_id]
        save_tasks(tasks)
