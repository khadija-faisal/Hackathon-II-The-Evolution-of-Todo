// [Task]: T-051
// [From]: tasks.md §T-051
// [Reference]: Constitution §III (Server Components), FR-001 (Create Task)

import TaskForm from "@/components/tasks/TaskForm"
import DashboardLayout from "@/components/dashboard/DashboardLayout"

/**
 * New Task Page - Server Component
 *
 * Renders TaskForm in "create" mode
 * - Empty form
 * - Submits to POST /api/v1/tasks
 * - Redirects to /dashboard on success
 *
 * Constitution Compliance:
 * - Principle III: Server Component for layout/rendering
 * - TaskForm is Client Component for interactivity
 */
export default function NewTaskPage() {
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
        <main className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl">
            <TaskForm mode="create" />
          </div>
        </main>
      </DashboardLayout>
    </div>
  )
}
