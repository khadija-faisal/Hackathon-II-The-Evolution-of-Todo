// [Task]: T-045, T-046, T-047, T-048, T-050
// [From]: plan.md §4.3: Dashboard UI, tasks.md §T-045-T-050
// [Reference]: Constitution §VI (Error Handling), FR-005 (Read), FR-006 (Update), FR-008 (Delete)

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiPatch, apiDelete } from "@/lib/api"
import type { TaskResponse } from "@/lib/types"
import Link from "next/link"

interface TaskCardProps {
  task: TaskResponse
}

/**
 * TaskCard - Client Component for displaying a single task
 *
 * Features:
 * - Checkbox toggle to mark complete/incomplete (T-046)
 * - Edit button to navigate to edit form
 * - Delete button with confirmation modal (T-047)
 * - Styling with Tailwind (T-048)
 * - Accessibility: labels, ARIA, keyboard nav (T-050)
 *
 * Interactions:
 * - Checkbox: optimistic UI, calls PATCH /api/v1/tasks/{id}/complete
 * - Delete: confirmation modal, calls DELETE /api/v1/tasks/{id}
 * - Edit: navigates to /dashboard/tasks/{id}/edit
 *
 * Constitution Compliance:
 * - Principle VI: Error handling with user feedback
 * - Client Component for interactivity
 */
export default function TaskCard({ task }: TaskCardProps) {
  const [completed, setCompleted] = useState(task.completed)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingCompletion, setIsTogglingCompletion] = useState(false)
  const router = useRouter()

  /**
   * T-046: Handle checkbox toggle
   * Optimistically updates UI, then calls API
   * Reverts on error
   */
  const handleToggleCompletion = async () => {
    const previousState = completed
    const newState = !completed

    // Optimistic UI update
    setCompleted(newState)
    setIsTogglingCompletion(true)

    try {
      await apiPatch(`/api/v1/tasks/${task.id}/complete`, {
        completed: newState,
      })
    } catch (error) {
      // Revert on error
      setCompleted(previousState)
      alert("Failed to update task. Please try again.")
    } finally {
      setIsTogglingCompletion(false)
    }
  }

  /**
   * T-047: Handle task deletion
   * Shows confirmation modal, then calls delete API
   */
  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await apiDelete(`/api/v1/tasks/${task.id}`)
      // Refresh the page to update task list
      router.refresh()
    } catch (error) {
      alert("Failed to delete task. Please try again.")
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      {/* Task Card (T-048: Tailwind Styling) */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          {/* T-046: Checkbox for completion toggle */}
          <input
            type="checkbox"
            checked={completed}
            onChange={handleToggleCompletion}
            disabled={isTogglingCompletion}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Mark "${task.title}" as ${completed ? "incomplete" : "complete"}`}
          />

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className={`text-base font-semibold break-words ${
                completed ? "line-through text-gray-500" : "text-gray-900"
              }`}
            >
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p className="mt-2 text-sm text-gray-600 break-words">
                {task.description}
              </p>
            )}

            {/* Metadata */}
            <p className="mt-2 text-xs text-gray-500">
              Created {new Date(task.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons (T-050: Accessibility) */}
          <div className="flex flex-shrink-0 gap-2">
            {/* Edit Button */}
            <Link
              href={`/dashboard/tasks/${task.id}/edit`}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label={`Edit task: ${task.title}`}
            >
              Edit
            </Link>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="rounded-md border border-red-300 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={`Delete task: ${task.title}`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* T-047: Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <h2 id="delete-modal-title" className="text-lg font-semibold text-gray-900 mb-2">
              Delete task?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be
              undone.
            </p>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
