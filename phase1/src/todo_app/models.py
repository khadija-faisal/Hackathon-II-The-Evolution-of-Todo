# [Task]: T-005
# [From]: speckit.specify §122-124, speckit.plan §3 Data Model
# Implements: M-001 (Foundation & Setup)

"""Task dataclass and serialization.

Defines the Task entity with methods for JSON serialization/deserialization.
"""

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, Any


@dataclass
class Task:
    """Represents a single todo item.

    Attributes:
        id: Unique auto-incremented integer starting from 1.
        title: Task title (1-255 characters, non-empty).
        status: Task status, either "pending" or "completed".
        created_at: ISO 8601 UTC timestamp of task creation (immutable).

    Raises:
        ValueError: If title is empty or exceeds 255 characters.
    """

    id: int
    title: str
    status: str
    created_at: str

    def to_dict(self) -> Dict[str, Any]:
        """Convert Task object to JSON-compatible dictionary.

        Returns:
            Dictionary with keys: id, title, status, created_at.
        """
        return {
            "id": self.id,
            "title": self.title,
            "status": self.status,
            "created_at": self.created_at,
        }

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> "Task":
        """Create a Task object from a dictionary (e.g., from JSON).

        Args:
            data: Dictionary with keys: id, title, status, created_at.

        Returns:
            Task object reconstructed from the dictionary.

        Raises:
            KeyError: If required keys are missing.
            ValueError: If data types are invalid.
        """
        return Task(
            id=int(data["id"]),
            title=str(data["title"]),
            status=str(data["status"]),
            created_at=str(data["created_at"]),
        )

    @staticmethod
    def create(title: str, task_id: int) -> "Task":
        """Factory method to create a new Task with default values.

        Args:
            title: The task title (validation is caller's responsibility).
            task_id: The auto-incremented task ID.

        Returns:
            New Task object with status="pending" and current ISO 8601 timestamp.
        """
        now = datetime.now(timezone.utc).isoformat()
        return Task(
            id=task_id,
            title=title,
            status="pending",
            created_at=now,
        )
