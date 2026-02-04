// [Task]: T-052
// [From]: tasks.md §T-052
// [Reference]: Constitution §III (Server Components), FR-006 (Update Task)

import { apiGet } from "@/lib/api"
import { notFound } from "next/navigation"
import type { TaskResponse } from "@/lib/types"
import TaskForm from "@/components/tasks/TaskForm"
import DashboardLayout from "@/components/dashboard/DashboardLayout"

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
      <div className="min-h-screen bg-white relative">
        {/* Grid Background Pattern */}
        <div className="fixed inset-0 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Dashboard Layout */}
        <DashboardLayout totalTasks={0}>
          <main className="relative z-10 p-8">
            <div className="max-w-2xl">
              <TaskForm mode="edit" task={task} />
            </div>
          </main>
        </DashboardLayout>
      </div>
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
