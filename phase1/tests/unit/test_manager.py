# [Task]: T-009, T-013, T-017, T-020, T-022
# [From]: spec.md (US-1, US-2, US-3, US-4, US-5), speckit.plan §4.2
# Implements: M-002 (US-1, US-2), M-003 (US-3), M-004 (US-4, US-5)

"""Unit tests for TaskManager CRUD operations."""

import pytest
import tempfile
import os
from pathlib import Path
from todo_app.manager import TaskManager
from todo_app.models import Task
from todo_app import storage


@pytest.fixture
def temp_todo_dir(monkeypatch):
    """Create a temporary directory for testing and mock the todo directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        monkeypatch.setenv("HOME", tmpdir)
        yield Path(tmpdir) / ".todo"


@pytest.fixture(autouse=True)
def cleanup_todo(monkeypatch):
    """Clean up test tasks.json after each test."""
    with tempfile.TemporaryDirectory() as tmpdir:
        monkeypatch.setenv("HOME", tmpdir)
        yield
        # Cleanup happens automatically with tempfile


class TestAddTask:
    """Tests for TaskManager.add_task()."""

    def test_add_task_with_valid_title(self, temp_todo_dir):
        """Test adding a task with a valid title."""
        task = TaskManager.add_task("Buy groceries")

        assert task.id == 1
        assert task.title == "Buy groceries"
        assert task.status == "pending"

    def test_add_task_creates_file(self, temp_todo_dir):
        """Test that add_task creates tasks.json file."""
        TaskManager.add_task("Test task")

        tasks_file = storage.get_tasks_file()
        assert tasks_file.exists()

    def test_add_multiple_tasks_increments_id(self, temp_todo_dir):
        """Test that multiple tasks get sequential IDs."""
        task1 = TaskManager.add_task("First task")
        task2 = TaskManager.add_task("Second task")
        task3 = TaskManager.add_task("Third task")

        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3

    def test_add_task_persists_to_file(self, temp_todo_dir):
        """Test that added task is persisted to JSON file."""
        TaskManager.add_task("Persistent task")

        tasks = storage.load_tasks()
        assert len(tasks) == 1
        assert tasks[0].title == "Persistent task"

    def test_add_task_with_empty_title_raises_error(self, temp_todo_dir):
        """Test that adding task with empty title raises ValueError."""
        with pytest.raises(ValueError, match="Task title cannot be empty"):
            TaskManager.add_task("")

    def test_add_task_with_whitespace_only_title_raises_error(self, temp_todo_dir):
        """Test that adding task with whitespace-only title raises ValueError."""
        with pytest.raises(ValueError, match="Task title cannot be empty"):
            TaskManager.add_task("   ")

    def test_add_task_with_very_long_title_raises_error(self, temp_todo_dir):
        """Test that adding task with title > 255 chars raises ValueError."""
        long_title = "x" * 256
        with pytest.raises(ValueError, match="Task title must be 255 characters or fewer"):
            TaskManager.add_task(long_title)

    def test_add_task_with_max_length_title(self, temp_todo_dir):
        """Test that adding task with exactly 255 char title succeeds."""
        max_title = "x" * 255
        task = TaskManager.add_task(max_title)

        assert len(task.title) == 255
        assert task.title == max_title


class TestListTasks:
    """Tests for TaskManager.list_tasks()."""

    def test_list_tasks_empty(self, temp_todo_dir):
        """Test listing tasks when no tasks exist."""
        tasks = TaskManager.list_tasks()

        assert tasks == []

    def test_list_tasks_returns_all_tasks(self, temp_todo_dir):
        """Test that list_tasks returns all created tasks."""
        TaskManager.add_task("Task 1")
        TaskManager.add_task("Task 2")
        TaskManager.add_task("Task 3")

        tasks = TaskManager.list_tasks()

        assert len(tasks) == 3

    def test_list_tasks_returns_tasks_in_id_order(self, temp_todo_dir):
        """Test that list_tasks returns tasks sorted by ID."""
        t3 = TaskManager.add_task("Third")
        t1 = TaskManager.add_task("First")
        t2 = TaskManager.add_task("Second")

        tasks = TaskManager.list_tasks()

        assert tasks[0].id == 1
        assert tasks[1].id == 2
        assert tasks[2].id == 3

    def test_list_tasks_preserves_all_fields(self, temp_todo_dir):
        """Test that list_tasks preserves all task fields."""
        TaskManager.add_task("Test task")

        tasks = TaskManager.list_tasks()

        assert len(tasks) == 1
        task = tasks[0]
        assert hasattr(task, "id")
        assert hasattr(task, "title")
        assert hasattr(task, "status")
        assert hasattr(task, "created_at")


class TestCompleteTask:
    """Tests for TaskManager.complete_task()."""

    def test_complete_task_pending_status(self, temp_todo_dir):
        """Test completing a pending task."""
        TaskManager.add_task("Test task")

        task = TaskManager.complete_task(1)

        assert task.status == "completed"

    def test_complete_task_persists_to_file(self, temp_todo_dir):
        """Test that completed task status is persisted."""
        TaskManager.add_task("Test task")
        TaskManager.complete_task(1)

        tasks = storage.load_tasks()
        assert tasks[0].status == "completed"

    def test_complete_already_completed_task_no_change(self, temp_todo_dir):
        """Test completing an already completed task doesn't change it."""
        TaskManager.add_task("Test task")
        TaskManager.complete_task(1)

        task = TaskManager.complete_task(1)

        assert task.status == "completed"

    def test_complete_task_with_invalid_id_raises_error(self, temp_todo_dir):
        """Test completing non-existent task raises ValueError."""
        with pytest.raises(ValueError, match="Task ID 999 not found"):
            TaskManager.complete_task(999)

    def test_complete_task_with_non_integer_id_raises_error(self, temp_todo_dir):
        """Test completing task with non-integer ID raises ValueError."""
        with pytest.raises(ValueError, match="Task ID must be a positive number"):
            TaskManager.complete_task(-1)

    def test_complete_task_with_zero_id_raises_error(self, temp_todo_dir):
        """Test completing task with ID 0 raises ValueError."""
        with pytest.raises(ValueError, match="Task ID must be a positive number"):
            TaskManager.complete_task(0)


class TestUpdateTask:
    """Tests for TaskManager.update_task()."""

    def test_update_task_title(self, temp_todo_dir):
        """Test updating a task's title."""
        TaskManager.add_task("Old title")

        task = TaskManager.update_task(1, "New title")

        assert task.title == "New title"
        assert task.id == 1
        assert task.status == "pending"

    def test_update_task_persists_to_file(self, temp_todo_dir):
        """Test that updated task is persisted."""
        TaskManager.add_task("Original")
        TaskManager.update_task(1, "Updated")

        tasks = storage.load_tasks()
        assert tasks[0].title == "Updated"

    def test_update_task_preserves_id_and_status(self, temp_todo_dir):
        """Test that update preserves ID and status."""
        TaskManager.add_task("Test")
        TaskManager.complete_task(1)

        task = TaskManager.update_task(1, "New title")

        assert task.id == 1
        assert task.status == "completed"

    def test_update_task_with_invalid_id_raises_error(self, temp_todo_dir):
        """Test updating non-existent task raises ValueError."""
        with pytest.raises(ValueError, match="Task ID 999 not found"):
            TaskManager.update_task(999, "New title")

    def test_update_task_with_empty_title_raises_error(self, temp_todo_dir):
        """Test updating with empty title raises ValueError."""
        TaskManager.add_task("Test")

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            TaskManager.update_task(1, "")

    def test_update_task_with_long_title_raises_error(self, temp_todo_dir):
        """Test updating with title > 255 chars raises ValueError."""
        TaskManager.add_task("Test")

        with pytest.raises(ValueError, match="Task title must be 255 characters or fewer"):
            TaskManager.update_task(1, "x" * 256)


class TestDeleteTask:
    """Tests for TaskManager.delete_task()."""

    def test_delete_task_removes_from_list(self, temp_todo_dir):
        """Test that deleting a task removes it from the list."""
        TaskManager.add_task("Task 1")
        TaskManager.add_task("Task 2")

        TaskManager.delete_task(1)

        tasks = TaskManager.list_tasks()
        assert len(tasks) == 1
        assert tasks[0].id == 2

    def test_delete_task_persists_to_file(self, temp_todo_dir):
        """Test that deletion is persisted."""
        TaskManager.add_task("Delete me")
        TaskManager.delete_task(1)

        tasks = storage.load_tasks()
        assert len(tasks) == 0

    def test_delete_task_preserves_remaining_ids(self, temp_todo_dir):
        """Test that deleting a task preserves remaining task IDs (gap allowed)."""
        TaskManager.add_task("Task 1")
        TaskManager.add_task("Task 2")
        TaskManager.add_task("Task 3")

        TaskManager.delete_task(2)

        tasks = TaskManager.list_tasks()
        assert len(tasks) == 2
        assert tasks[0].id == 1
        assert tasks[1].id == 3

    def test_delete_task_with_invalid_id_raises_error(self, temp_todo_dir):
        """Test deleting non-existent task raises ValueError."""
        with pytest.raises(ValueError, match="Task ID 999 not found"):
            TaskManager.delete_task(999)

    def test_delete_task_with_zero_id_raises_error(self, temp_todo_dir):
        """Test deleting task with ID 0 raises ValueError."""
        with pytest.raises(ValueError, match="Task ID must be a positive number"):
            TaskManager.delete_task(0)


class TestTaskManagerIntegration:
    """Integration tests for TaskManager operations."""

    def test_full_task_lifecycle(self, temp_todo_dir):
        """Test complete task lifecycle: add, list, complete, update, delete."""
        # Add
        task1 = TaskManager.add_task("Buy milk")
        task2 = TaskManager.add_task("Clean house")

        # List
        tasks = TaskManager.list_tasks()
        assert len(tasks) == 2

        # Complete
        TaskManager.complete_task(1)
        tasks = TaskManager.list_tasks()
        assert tasks[0].status == "completed"

        # Update
        TaskManager.update_task(2, "Clean house thoroughly")
        tasks = TaskManager.list_tasks()
        assert tasks[1].title == "Clean house thoroughly"

        # Delete
        TaskManager.delete_task(1)
        tasks = TaskManager.list_tasks()
        assert len(tasks) == 1
        assert tasks[0].id == 2

    def test_multiple_operations_consistency(self, temp_todo_dir):
        """Test that multiple operations maintain data consistency."""
        for i in range(5):
            TaskManager.add_task(f"Task {i+1}")

        # Complete odd-numbered tasks
        TaskManager.complete_task(1)
        TaskManager.complete_task(3)
        TaskManager.complete_task(5)

        # Verify
        tasks = TaskManager.list_tasks()
        completed = [t for t in tasks if t.status == "completed"]
        pending = [t for t in tasks if t.status == "pending"]

        assert len(completed) == 3
        assert len(pending) == 2
