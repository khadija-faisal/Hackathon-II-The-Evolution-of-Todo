// [Task]: T-053, T-054, T-055, T-056, T-057, T-058, T-059
// [From]: tasks.md §T-053-T-059, plan.md §4.4: Task Form
// [Reference]: Constitution §VI (Error Handling), FR-001 (Create), FR-006 (Update)

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiPost, apiPut } from "@/lib/api"
import type { TaskResponse } from "@/lib/types"
import Link from "next/link"

interface TaskFormProps {
  mode: "create" | "edit"
  task?: TaskResponse
}

/**
 * TaskForm - Client Component for creating/editing tasks
 *
 * Features:
 * - Create mode: empty form, POST to /api/v1/tasks (T-055)
 * - Edit mode: pre-populated, PUT to /api/v1/tasks/{id} (T-056)
 * - Form validation: title required, ≤255 chars (T-054)
 * - Unsaved changes detection (T-057)
 * - Styling with Tailwind (T-058)
 * - Accessibility: labels, required fields, ARIA (T-059)
 *
 * User Interactions:
 * - Save: validates and submits form
 * - Cancel: shows confirmation if unsaved changes
 * - Back button: navigates back with confirmation
 *
 * Constitution Compliance:
 * - Principle VI: Comprehensive error handling
 * - Client Component for form interactivity
 */
export default function TaskForm({ mode, task }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const router = useRouter()

  // T-057: Track unsaved changes
  useEffect(() => {
    if (mode === "edit" && task) {
      // In edit mode, compare to original task
      const hasChanges =
        title !== task.title || description !== (task.description || "")
      setIsDirty(hasChanges)
    } else {
      // In create mode, any content = dirty
      const hasContent = title.trim() !== "" || description.trim() !== ""
      setIsDirty(hasContent)
    }
  }, [title, description, mode, task])

  // T-054: Validation
  const validateForm = (): string | null => {
    if (!title.trim()) {
      return "Title is required"
    }
    if (title.length > 255) {
      return "Title must be 255 characters or less"
    }
    if (description.length > 4000) {
      return "Description must be 4000 characters or less"
    }
    return null
  }

  // T-055 & T-056: Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      if (mode === "create") {
        // T-055: Create new task
        await apiPost("/api/v1/tasks", {
          title,
          description: description || undefined,
        })
        // Success - redirect to dashboard and refresh data
        router.push("/dashboard")
        router.refresh()
      } else {
        // T-056: Update existing task
        await apiPut(`/api/v1/tasks/${task!.id}`, {
          title,
          description: description || undefined,
          completed: task!.completed,
        })
        // Success - redirect to dashboard and refresh data
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.status === 403
          ? "You don't have permission to edit this task"
          : err?.response?.status === 404
            ? "Task not found"
            : err?.message || "Failed to save task. Please try again."

      setError(errorMessage)
      setIsLoading(false)
    }
  }

  // T-057: Handle cancel with unsaved changes confirmation
  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardModal(true)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <>
      {/* Form Container */}
      <div className="rounded-lg sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-8 shadow-lg">
        {/* Header with Back Button */}
        <div className="mb-4 sm:mb-8 flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="text-gray-600 hover:text-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg sm:text-2xl flex-shrink-0"
            aria-label="Back to dashboard"
          >
            ← Back
          </button>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#1A1A1A]">
            {mode === "create" ? "Create New Task" : "Edit Task"}
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-4 sm:mb-6 rounded-lg bg-red-50 p-3 sm:p-4 text-xs sm:text-sm text-red-800 border border-red-200"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-xs sm:text-sm font-bold text-[#1A1A1A] mb-2">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border-2 border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-[#1A1A1A] placeholder-gray-500 focus:border-[#F3A03F] focus:outline-none focus:ring-2 focus:ring-[#F3A03F]/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
              placeholder="What needs to be done?"
              aria-describedby="title-help"
            />
            <p id="title-help" className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
              {title.length}/255 characters
            </p>
          </div>

          {/* Description Textarea */}
          <div>
            <label htmlFor="description" className="block text-xs sm:text-sm font-bold text-[#1A1A1A] mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={4000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border-2 border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-[#1A1A1A] placeholder-gray-500 focus:border-[#F3A03F] focus:outline-none focus:ring-2 focus:ring-[#F3A03F]/20 disabled:opacity-50 disabled:cursor-not-allowed transition resize-none"
              placeholder="Add more details (optional)"
              aria-describedby="description-help"
            />
            <p id="description-help" className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
              {description.length}/4000 characters
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-[#F3A03F] px-4 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#E08F2C] focus:outline-none focus:ring-2 focus:ring-[#F3A03F]/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create Task"
                  : "Save Task"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="rounded-lg border-2 border-gray-300 px-4 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold text-[#1A1A1A] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Discard Changes Confirmation Modal */}
      {showDiscardModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-modal-title"
        >
          <div className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-2xl p-4 sm:p-8 max-w-sm w-full shadow-2xl">
            <h2 id="discard-modal-title" className="text-lg sm:text-2xl font-black text-[#1A1A1A] mb-3 sm:mb-4">
              Discard unsaved changes?
            </h2>
            <p className="text-xs sm:text-base text-gray-700 mb-4 sm:mb-6">
              Your changes will be lost if you leave without saving.
            </p>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="rounded-lg border-2 border-gray-300 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-[#1A1A1A] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300/50 transition"
              >
                Keep editing
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-lg bg-red-600 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
