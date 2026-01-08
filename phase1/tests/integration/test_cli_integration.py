# [Task]: T-012, T-016, T-019, T-021 (placeholder - integration)
# [From]: speckit.plan §7.2 Integration Tests
# Implements: M-002 (US-1, US-2), M-003 (US-3), M-004 (US-4, US-5)

"""Integration tests for CLI commands using the Manager directly."""

import pytest
import tempfile
from pathlib import Path
from todo_app.manager import TaskManager
from todo_app import storage


@pytest.fixture
def clean_todo_env(monkeypatch):
    """Create a clean todo environment for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        monkeypatch.setenv("HOME", tmpdir)
        yield Path(tmpdir) / ".todo"


class TestAddTaskIntegration:
    """Integration tests for add task functionality."""

    def test_add_task_end_to_end(self, clean_todo_env):
        """Test complete add task workflow."""
        # Add task
        task = TaskManager.add_task("Buy groceries")

        # Verify it was added
        assert task.id == 1
        assert task.title == "Buy groceries"
        assert task.status == "pending"

        # Verify it was persisted
        tasks = TaskManager.list_tasks()
        assert len(tasks) == 1
        assert tasks[0].title == "Buy groceries"

    def test_add_multiple_tasks_workflow(self, clean_todo_env):
        """Test adding multiple tasks in sequence."""
        TaskManager.add_task("Task 1")
        TaskManager.add_task("Task 2")
        TaskManager.add_task("Task 3")

        tasks = TaskManager.list_tasks()
        assert len(tasks) == 3
        assert tasks[0].id == 1
        assert tasks[1].id == 2
        assert tasks[2].id == 3


class TestListTasksIntegration:
    """Integration tests for list task functionality."""

    def test_list_empty_tasks(self, clean_todo_env):
        """Test listing when no tasks exist."""
        tasks = TaskManager.list_tasks()
        assert tasks == []

    def test_list_with_mixed_status(self, clean_todo_env):
        """Test listing tasks with mixed status."""
        TaskManager.add_task("Pending task")
        TaskManager.add_task("Task to complete")
        TaskManager.complete_task(2)

        tasks = TaskManager.list_tasks()
        assert len(tasks) == 2
        assert tasks[0].status == "pending"
        assert tasks[1].status == "completed"


class TestCompleteTaskIntegration:
    """Integration tests for complete task functionality."""

    def test_complete_task_workflow(self, clean_todo_env):
        """Test complete task end-to-end."""
        TaskManager.add_task("Test task")

        # Complete the task
        task = TaskManager.complete_task(1)
        assert task.status == "completed"

        # Verify persistence
        tasks = TaskManager.list_tasks()
        assert tasks[0].status == "completed"

    def test_cannot_complete_nonexistent_task(self, clean_todo_env):
        """Test that completing nonexistent task raises error."""
        with pytest.raises(ValueError):
            TaskManager.complete_task(999)


class TestUpdateTaskIntegration:
    """Integration tests for update task functionality."""

    def test_update_task_workflow(self, clean_todo_env):
        """Test update task end-to-end."""
        TaskManager.add_task("Original title")

        # Update the task
        task = TaskManager.update_task(1, "Updated title")
        assert task.title == "Updated title"

        # Verify persistence
        tasks = TaskManager.list_tasks()
        assert tasks[0].title == "Updated title"

    def test_update_preserves_status(self, clean_todo_env):
        """Test that update preserves task status."""
        TaskManager.add_task("Test")
        TaskManager.complete_task(1)

        task = TaskManager.update_task(1, "New title")
        assert task.status == "completed"


class TestDeleteTaskIntegration:
    """Integration tests for delete task functionality."""

    def test_delete_task_workflow(self, clean_todo_env):
        """Test delete task end-to-end."""
        TaskManager.add_task("Task to delete")

        # Delete the task
        TaskManager.delete_task(1)

        # Verify it's gone
        tasks = TaskManager.list_tasks()
        assert len(tasks) == 0

    def test_delete_with_remaining_tasks(self, clean_todo_env):
        """Test deleting one task leaves others intact."""
        TaskManager.add_task("Keep me")
        TaskManager.add_task("Delete me")
        TaskManager.add_task("Keep me too")

        TaskManager.delete_task(2)

        tasks = TaskManager.list_tasks()
        assert len(tasks) == 2
        assert tasks[0].id == 1
        assert tasks[1].id == 3


class TestCompleteWorkflow:
    """End-to-end workflow tests."""

    def test_full_task_lifecycle(self, clean_todo_env):
        """Test complete task lifecycle: create, view, complete, update, delete."""
        # Create
        task1 = TaskManager.add_task("Buy milk")
        task2 = TaskManager.add_task("Buy bread")

        # View
        tasks = TaskManager.list_tasks()
        assert len(tasks) == 2

        # Complete
        TaskManager.complete_task(1)
        task = TaskManager.list_tasks()[0]
        assert task.status == "completed"

        # Update
        TaskManager.update_task(2, "Buy whole grain bread")
        task = TaskManager.list_tasks()[1]
        assert task.title == "Buy whole grain bread"

        # Delete
        TaskManager.delete_task(1)
        tasks = TaskManager.list_tasks()
        assert len(tasks) == 1
        assert tasks[0].id == 2

    def test_persistence_across_operations(self, clean_todo_env):
        """Test that data persists across multiple operations."""
        # Create initial tasks
        TaskManager.add_task("Task 1")
        TaskManager.add_task("Task 2")
        TaskManager.add_task("Task 3")

        # Verify initial state
        tasks = TaskManager.list_tasks()
        assert len(tasks) == 3

        # Perform operations
        TaskManager.complete_task(1)
        TaskManager.update_task(2, "Updated Task 2")
        TaskManager.delete_task(3)

        # Verify final state
        tasks = TaskManager.list_tasks()
        assert len(tasks) == 2
        assert tasks[0].status == "completed"
        assert tasks[1].title == "Updated Task 2"

        # Verify file persistence
        file_tasks = storage.load_tasks()
        assert len(file_tasks) == 2

    def test_large_batch_operations(self, clean_todo_env):
        """Test handling many tasks."""
        # Create 100 tasks
        for i in range(100):
            TaskManager.add_task(f"Task {i+1}")

        tasks = TaskManager.list_tasks()
        assert len(tasks) == 100

        # Complete every other task
        for i in range(1, 101, 2):
            TaskManager.complete_task(i)

        # Verify
        tasks = TaskManager.list_tasks()
        completed = [t for t in tasks if t.status == "completed"]
        assert len(completed) == 50

        # Delete first 10
        for i in range(1, 11):
            TaskManager.delete_task(i)

        tasks = TaskManager.list_tasks()
        assert len(tasks) == 90
