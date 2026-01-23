// [Task]: T-052
// [From]: tasks.md §T-052
// [Reference]: Constitution §III (Server Components), FR-006 (Update Task)

import { apiGet } from "@/lib/api"
import { notFound } from "next/navigation"
import type { TaskResponse } from "@/lib/types"
import TaskForm from "@/components/tasks/TaskForm"

/**
 * Edit Task Page - Server Component
 *
 * Fetches task data and renders TaskForm in "edit" mode
 * - Pre-populates form with existing task data
 * - Submits to PUT /api/v1/tasks/{id}
 * - Returns 404 if task not found or user doesn't own it
 *
 * Data Fetching:
 * - Server-side fetch via apiGet<TaskResponse>
 * - Backend enforces ownership check (returns 404 if not owned)
 *
 * Constitution Compliance:
 * - Principle III: Server Component for data fetching
 * - Principle V: Backend enforces user isolation
 */
export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    // Fetch task data server-side
    const task = await apiGet<TaskResponse>(`/api/v1/tasks/${id}`)

    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <TaskForm mode="edit" task={task} />
        </div>
      </main>
    )
  } catch (error: any) {
    // 404 if task not found or user doesn't own it
    if (error?.response?.status === 404) {
      notFound()
    }
    // Re-throw other errors
    throw error
  }
}
