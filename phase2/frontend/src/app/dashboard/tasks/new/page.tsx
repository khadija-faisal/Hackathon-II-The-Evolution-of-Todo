// [Task]: T-051
// [From]: tasks.md §T-051
// [Reference]: Constitution §III (Server Components), FR-001 (Create Task)

import TaskForm from "@/components/tasks/TaskForm"

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
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <TaskForm mode="create" />
      </div>
    </main>
  )
}
