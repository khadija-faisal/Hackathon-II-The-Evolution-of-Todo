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

export default function TaskCard({ task }: TaskCardProps) {
  const [completed, setCompleted] = useState(task.completed)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingCompletion, setIsTogglingCompletion] = useState(false)
  const router = useRouter()
  const { openDeleteTaskId, setOpenDeleteTaskId } = useTaskModal()

  const showDeleteConfirm = openDeleteTaskId === task.id

  const handleToggleCompletion = async () => {
    const previousState = completed
    const newState = !completed

    setCompleted(newState)
    setIsTogglingCompletion(true)

    try {
      await apiPatch(`/api/v1/tasks/${task.id}/complete`, {
        completed: newState,
      })
    } catch (error) {
      setCompleted(previousState)
      alert("Failed to update task. Please try again.")
    } finally {
      setIsTogglingCompletion(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await apiDelete(`/api/v1/tasks/${task.id}`)
      setOpenDeleteTaskId(null)
      setTimeout(() => {
        router.refresh()
      }, 300)
    } catch (error: any) {
      console.error("Delete error:", error)
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Task Card */}
      <div className={`p-3 sm:p-6 rounded-lg sm:rounded-xl border-2 bg-white transition transform hover:shadow-lg ${
        completed
          ? "border-green-200 bg-green-50/30"
          : "border-gray-200 hover:border-[#F3A03F]/50"
      }`}>
        {/* Checkbox + Title */}
        <div className="flex items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              checked={completed}
              onChange={handleToggleCompletion}
              disabled={isTogglingCompletion}
              className="w-4 sm:w-5 h-4 sm:h-5 rounded border-2 border-gray-300 text-[#F3A03F] accent-[#F3A03F] focus:ring-2 focus:ring-[#F3A03F]/30 cursor-pointer disabled:opacity-50"
              aria-label={`Mark "${task.title}" as ${completed ? "incomplete" : "complete"}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm sm:text-lg mb-1 break-words ${
              completed
                ? "line-through text-gray-400"
                : "text-[#1A1A1A]"
            }`}>
              {task.title}
            </h3>

            {task.description && (
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Date Badge */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <span className="text-xs bg-gray-100 text-gray-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium">
                📅 {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              {completed && (
                <span className="text-xs bg-green-100 text-green-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium">
                  ✓ Done
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4 border-t border-gray-200">
          <Link
            href={`/dashboard/tasks/${task.id}/edit`}
            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#8E7CFF] hover:bg-purple-50 border border-[#8E7CFF]/30 rounded-lg transition text-center"
            aria-label={`Edit task: ${task.title}`}
          >
            ✏️ Edit
          </Link>

          <button
            onClick={() => setOpenDeleteTaskId(task.id)}
            disabled={isDeleting || openDeleteTaskId !== null}
            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-center"
            aria-label={`Delete task: ${task.title}`}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[9998] animate-fadeIn"
            onClick={() => !isDeleting && setOpenDeleteTaskId(null)}
          ></div>

          <div
            className="fixed inset-0 flex items-center justify-center z-[9999] animate-fadeIn p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onClick={() => !isDeleting && setOpenDeleteTaskId(null)}
            style={{ pointerEvents: "none" }}
          >
            <div
              className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-8 max-w-md w-full shadow-2xl border border-red-200"
              onClick={(e) => {
                e.stopPropagation()
                e.currentTarget.style.pointerEvents = "auto"
              }}
              style={{ pointerEvents: "auto" }}
            >
              <h2 id="delete-modal-title" className="text-lg sm:text-2xl font-black text-[#1A1A1A] mb-3 sm:mb-4">
                Delete Task?
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 mb-2 font-medium">
                Are you sure you want to delete:
              </p>
              <p className="text-xs sm:text-base text-[#1A1A1A] font-bold mb-4 sm:mb-6 bg-gray-100 p-2 sm:p-3 rounded-lg border-l-4 border-[#F3A03F] break-words">
                "{task.title}"
              </p>
              <p className="text-red-600 text-xs sm:text-sm mb-4 sm:mb-6 font-semibold">
                ⚠️ This action cannot be undone
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                <button
                  onClick={() => setOpenDeleteTaskId(null)}
                  disabled={isDeleting}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold transition flex items-center justify-center gap-2"
                >
                  {isDeleting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>}
                  {isDeleting ? "Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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
