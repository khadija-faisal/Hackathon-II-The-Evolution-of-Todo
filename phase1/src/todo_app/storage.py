# [Task]: T-006
# [From]: speckit.specify §103-121 Requirements, speckit.plan §3.4 Storage
# Implements: M-001 (Foundation & Setup)

"""JSON file storage with atomic writes and corruption recovery.

Provides load_tasks() and save_tasks() with atomic writes to prevent
partial updates and automatic corruption recovery.
"""

import json
import os
from pathlib import Path
from typing import List
from .models import Task


def get_tasks_file() -> Path:
    """Get the path to the tasks.json file.

    Creates the ~/.todo/ directory if it doesn't exist.

    Returns:
        Path object pointing to ~/.todo/tasks.json.
    """
    todo_dir = Path.home() / ".todo"
    todo_dir.mkdir(parents=True, exist_ok=True)
    return todo_dir / "tasks.json"


def load_tasks() -> List[Task]:
    """Load tasks from ~/.todo/tasks.json.

    Automatically creates the file if it doesn't exist.
    Handles corrupted JSON by backing up the file and reinitializing
    with an empty task list.

    Returns:
        List of Task objects. Empty list if file doesn't exist or is corrupted.

    Raises:
        OSError: If unable to read or create the file.
    """
    tasks_file = get_tasks_file()

    if not tasks_file.exists():
        return []

    try:
        with open(tasks_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not isinstance(data, list):
            raise ValueError("tasks.json must contain a JSON array")

        return [Task.from_dict(item) for item in data]

    except (json.JSONDecodeError, ValueError) as e:
        # Corruption detected: backup and reinit
        backup_file = tasks_file.with_suffix(".json.bak")
        try:
            tasks_file.rename(backup_file)
            print(f"⚠️  Warning: Corrupted tasks.json backed up to {backup_file}")
        except OSError as rename_err:
            print(f"⚠️  Warning: Could not back up corrupted file: {rename_err}")

        return []


def save_tasks(tasks: List[Task]) -> None:
    """Save tasks to ~/.todo/tasks.json with atomic write.

    Uses a temporary file and atomic rename to prevent partial updates
    if the process is interrupted.

    Args:
        tasks: List of Task objects to persist.

    Raises:
        OSError: If unable to write to the file.
        json.JSONEncodeError: If a Task cannot be serialized to JSON.
    """
    tasks_file = get_tasks_file()

    # Serialize tasks
    data = [task.to_dict() for task in tasks]

    # Write to temporary file first (atomic write pattern)
    temp_file = tasks_file.with_suffix(".json.tmp")

    try:
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        # Atomic rename (replaces tasks.json)
        temp_file.replace(tasks_file)

    except OSError as e:
        # Clean up temp file if rename failed
        if temp_file.exists():
            try:
                temp_file.unlink()
            except OSError:
                pass
        raise OSError(f"Failed to save tasks: {e}") from e
