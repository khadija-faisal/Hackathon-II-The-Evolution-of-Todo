// [Task]: T-045, T-046, T-047, T-048, T-050
// [From]: plan.md §4.3: Dashboard UI, tasks.md §T-045-T-050
// [Reference]: Constitution §VI (Error Handling), FR-005 (Read), FR-006 (Update), FR-008 (Delete)

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiPatch, apiDelete } from "@/lib/api"
import { useTaskModal } from "@/context/TaskModalContext"
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingCompletion, setIsTogglingCompletion] = useState(false)
  const router = useRouter()
  const { openDeleteTaskId, setOpenDeleteTaskId } = useTaskModal()

  // Check if this task's modal is open
  const showDeleteConfirm = openDeleteTaskId === task.id

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
      // Task deleted successfully
      setOpenDeleteTaskId(null) // Close modal globally
      // Refresh the dashboard to update task list
      // Small delay to ensure delete is processed
      setTimeout(() => {
        router.refresh()
      }, 300)
    } catch (error: any) {
      console.error("Delete error:", error)
      setIsDeleting(false)
      // Don't close modal on error - let user try again
      // Error will be shown but modal stays open
    }
  }

  return (
    <>
      {/* Task Card (T-048: Tailwind Styling) */}
      <div className="group rounded-lg border border-blue-500/20 bg-slate-800 p-5 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start gap-4">
          {/* T-046: Checkbox for completion toggle */}
          <input
            type="checkbox"
            checked={completed}
            onChange={handleToggleCompletion}
            disabled={isTogglingCompletion}
            className="mt-1 h-5 w-5 rounded border-blue-400 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label={`Mark "${task.title}" as ${completed ? "incomplete" : "complete"}`}
          />

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className={`text-base font-semibold break-words transition duration-300 ${
                completed
                  ? "line-through text-gray-500 group-hover:text-gray-600"
                  : "text-white group-hover:text-blue-200"
              }`}
            >
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p className="mt-2 text-sm text-gray-400 break-words group-hover:text-gray-300 transition duration-300">
                {task.description}
              </p>
            )}

            {/* Metadata */}
            <p className="mt-2 text-xs text-gray-500 group-hover:text-gray-400 transition duration-300">
              📅 {new Date(task.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons (T-050: Accessibility) */}
          <div className="flex flex-shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Edit Button */}
            <Link
              href={`/dashboard/tasks/${task.id}/edit`}
              className="rounded-md border border-blue-500/50 px-3 py-1 text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-slate-800 transition-all duration-200"
              aria-label={`Edit task: ${task.title}`}
            >
              ✏️ Edit
            </Link>

            {/* Delete Button */}
            <button
              onClick={() => setOpenDeleteTaskId(task.id)}
              disabled={isDeleting || openDeleteTaskId !== null}
              className="rounded-md border border-red-500/50 px-3 py-1 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label={`Delete task: ${task.title}`}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* T-047: Delete Confirmation Modal - Rendered at document root */}
      {showDeleteConfirm && (
        <>
          {/* Backdrop - Very Dark and Complete Coverage */}
          <div
            className="fixed inset-0 bg-black/98 z-[9998] animate-fadeIn"
            onClick={() => !isDeleting && setOpenDeleteTaskId(null)}
          ></div>

          {/* Modal Container */}
          <div
            className="fixed inset-0 flex items-center justify-center z-[9999] animate-fadeIn opacity-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onClick={() => !isDeleting && setOpenDeleteTaskId(null)}
            style={{ pointerEvents: "none" }}
          >
            {/* Modal Content - Click propagation stopped */}
            <div
              className="bg-slate-800 border-2 border-red-500/60 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl shadow-red-600/50 backdrop-blur-xl ring-1 ring-red-500/20 opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                e.currentTarget.style.pointerEvents = "auto"
              }}
              style={{ pointerEvents: "auto" }}
            >
            <h2 id="delete-modal-title" className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-3">
              <span className="text-3xl">🗑️</span> Delete Task?
            </h2>
            <p className="text-gray-300 mb-2 font-semibold">
              Are you sure you want to delete:
            </p>
            <p className="text-white mb-6 font-mono text-sm bg-slate-700/50 p-3 rounded border-l-4 border-red-500">
              &quot;{task.title}&quot;
            </p>
            <p className="text-red-300 text-sm mb-6 flex items-center gap-2">
              <span>⚠️</span> This action cannot be undone
            </p>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end mt-8">
              <button
                onClick={() => setOpenDeleteTaskId(null)}
                disabled={isDeleting}
                className="rounded-md border-2 border-gray-500 px-5 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:border-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 hover:bg-red-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-red-500/60 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-slate-800"
              >
                {isDeleting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>}
                {isDeleting ? "Deleting..." : "🗑️ Delete"}
              </button>
            </div>
          </div>
          </div>
        </>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
