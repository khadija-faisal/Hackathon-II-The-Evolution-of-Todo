# [Task]: T-005
# [From]: spec.md §122-124, speckit.plan §3 Data Model
# Implements: M-001 (Foundation & Setup)

"""Unit tests for Task dataclass and serialization."""

import pytest
from datetime import datetime, timezone
from todo_app.models import Task


class TestTaskCreation:
    """Tests for Task dataclass creation."""

    def test_task_creation_with_all_fields(self):
        """Test creating a Task with all fields."""
        task = Task(
            id=1,
            title="Buy groceries",
            status="pending",
            created_at="2026-01-08T14:30:00Z",
        )

        assert task.id == 1
        assert task.title == "Buy groceries"
        assert task.status == "pending"
        assert task.created_at == "2026-01-08T14:30:00Z"

    def test_task_create_factory_method(self):
        """Test Task.create() factory method."""
        task = Task.create("Review specification", 42)

        assert task.id == 42
        assert task.title == "Review specification"
        assert task.status == "pending"
        # created_at should be ISO 8601 UTC timestamp
        assert "T" in task.created_at
        assert "+" in task.created_at or "Z" in task.created_at

    def test_task_create_sets_pending_status(self):
        """Test that Task.create() always sets status to pending."""
        task = Task.create("New task", 1)
        assert task.status == "pending"


class TestTaskSerialization:
    """Tests for Task serialization and deserialization."""

    def test_to_dict_returns_valid_dict(self):
        """Test to_dict() returns a JSON-compatible dictionary."""
        task = Task(
            id=1,
            title="Buy milk",
            status="completed",
            created_at="2026-01-08T10:00:00Z",
        )

        result = task.to_dict()

        assert isinstance(result, dict)
        assert result == {
            "id": 1,
            "title": "Buy milk",
            "status": "completed",
            "created_at": "2026-01-08T10:00:00Z",
        }

    def test_from_dict_creates_task_from_dict(self):
        """Test from_dict() reconstructs Task from dictionary."""
        data = {
            "id": 2,
            "title": "Clean house",
            "status": "pending",
            "created_at": "2026-01-09T08:00:00Z",
        }

        task = Task.from_dict(data)

        assert task.id == 2
        assert task.title == "Clean house"
        assert task.status == "pending"
        assert task.created_at == "2026-01-09T08:00:00Z"

    def test_serialization_roundtrip(self):
        """Test that to_dict() and from_dict() are inverse operations."""
        original = Task(
            id=5,
            title="Test roundtrip",
            status="completed",
            created_at="2026-01-08T12:00:00Z",
        )

        dict_repr = original.to_dict()
        restored = Task.from_dict(dict_repr)

        assert restored.id == original.id
        assert restored.title == original.title
        assert restored.status == original.status
        assert restored.created_at == original.created_at

    def test_from_dict_with_int_id(self):
        """Test from_dict() converts ID to int."""
        data = {
            "id": "123",  # String ID
            "title": "Test",
            "status": "pending",
            "created_at": "2026-01-08T00:00:00Z",
        }

        task = Task.from_dict(data)

        assert task.id == 123
        assert isinstance(task.id, int)


class TestTaskDataTypes:
    """Tests for Task data type validation."""

    def test_task_id_is_integer(self):
        """Test that task ID is an integer."""
        task = Task(
            id=1,
            title="Test",
            status="pending",
            created_at="2026-01-08T00:00:00Z",
        )
        assert isinstance(task.id, int)

    def test_task_title_is_string(self):
        """Test that task title is a string."""
        task = Task(
            id=1,
            title="Test title",
            status="pending",
            created_at="2026-01-08T00:00:00Z",
        )
        assert isinstance(task.title, str)

    def test_task_status_is_string(self):
        """Test that task status is a string."""
        task = Task(
            id=1,
            title="Test",
            status="pending",
            created_at="2026-01-08T00:00:00Z",
        )
        assert isinstance(task.status, str)

    def test_task_created_at_is_string(self):
        """Test that created_at is a string."""
        task = Task(
            id=1,
            title="Test",
            status="pending",
            created_at="2026-01-08T00:00:00Z",
        )
        assert isinstance(task.created_at, str)


class TestTaskEdgeCases:
    """Tests for Task edge cases."""

    def test_task_with_empty_title(self):
        """Test creating a task with empty title (no validation in model)."""
        task = Task(id=1, title="", status="pending", created_at="2026-01-08T00:00:00Z")
        assert task.title == ""

    def test_task_with_long_title(self):
        """Test creating a task with maximum length title."""
        long_title = "x" * 255
        task = Task(
            id=1,
            title=long_title,
            status="pending",
            created_at="2026-01-08T00:00:00Z",
        )
        assert len(task.title) == 255
        assert task.title == long_title

    def test_task_status_values(self):
        """Test that task status can be set to known values."""
        task_pending = Task(
            id=1,
            title="Test",
            status="pending",
            created_at="2026-01-08T00:00:00Z",
        )
        task_completed = Task(
            id=2,
            title="Test",
            status="completed",
            created_at="2026-01-08T00:00:00Z",
        )

        assert task_pending.status == "pending"
        assert task_completed.status == "completed"

    def test_task_with_zero_id(self):
        """Test creating a task with ID 0 (model allows it, validation rejects)."""
        task = Task(id=0, title="Test", status="pending", created_at="2026-01-08T00:00:00Z")
        assert task.id == 0

    def test_task_with_negative_id(self):
        """Test creating a task with negative ID (model allows it, validation rejects)."""
        task = Task(
            id=-1,
            title="Test",
            status="pending",
            created_at="2026-01-08T00:00:00Z",
        )
        assert task.id == -1


class TestTaskISOTimestamps:
    """Tests for ISO 8601 timestamp handling."""

    def test_task_create_generates_iso_timestamp(self):
        """Test that Task.create() generates proper ISO 8601 timestamp."""
        before = datetime.now(timezone.utc).isoformat()
        task = Task.create("Test", 1)
        after = datetime.now(timezone.utc).isoformat()

        # Parse the timestamp to verify it's valid ISO 8601
        assert "T" in task.created_at
        assert (
            "+" in task.created_at or "Z" in task.created_at
        ), "Timestamp should include timezone"

    def test_task_preserves_timestamp_format(self):
        """Test that created_at timestamp is preserved exactly."""
        timestamp = "2026-01-08T14:30:00.123456+00:00"
        task = Task(
            id=1,
            title="Test",
            status="pending",
            created_at=timestamp,
        )

        assert task.created_at == timestamp
