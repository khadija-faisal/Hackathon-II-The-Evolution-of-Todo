// [Task]: T-042
// [From]: plan.md §4.3: Dashboard UI, tasks.md §T-042
// [Reference]: Constitution §III (Server Components), Constitution §V (User Isolation), FR-004 (List Tasks)

import { apiGet } from "@/lib/api"
import type { TaskListResponse } from "@/lib/types"
import Header from "@/components/shared/Header"
import TaskList from "@/components/tasks/TaskList"

/**
 * Dashboard Page - Server Component
 *
 * Fetches user's tasks from backend API and renders:
 * - Header with task counter and logout button
 * - TaskList component with all user's tasks
 *
 * Data Fetching:
 * - Server-side fetch via apiGet<TaskListResponse>
 * - Includes Authorization header via api.ts
 * - Respects user isolation (backend filters by user_id)
 *
 * Constitution Compliance:
 * - Principle III: Server Component for data fetching
 * - Principle V: Backend enforces user isolation (WHERE user_id = :user_id)
 * - Server-side rendering ensures no token exposure
 */
export default async function DashboardPage() {
  // Fetch user's tasks with pagination
  const data = await apiGet<TaskListResponse>(
    "/api/v1/tasks?limit=100&offset=0"
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logout */}
      <Header totalTasks={data.total} />

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Task List */}
        <TaskList tasks={data.data} />
      </main>
    </div>
  )
}
