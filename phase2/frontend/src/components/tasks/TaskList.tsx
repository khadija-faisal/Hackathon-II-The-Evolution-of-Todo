// [Task]: T-044
// [From]: plan.md §4.3: Dashboard UI, tasks.md §T-044
// [Reference]: Constitution §III (Server Components), FR-004 (List Tasks)

import Link from "next/link"
import type { TaskResponse } from "@/lib/types"
import TaskCard from "./TaskCard"

interface TaskListProps {
  tasks: TaskResponse[]
}

/**
 * TaskList - Server Component
 *
 * Renders a list of tasks as TaskCard components
 * Shows empty state if no tasks exist
 * Provides "+ New Task" button for creating tasks
 *
 * Constitution Compliance:
 * - Principle III: Server Component (no interactivity)
 * - Renders TaskCard Client Components for interactions
 */
export default function TaskList({ tasks }: TaskListProps) {
  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center">
        <p className="text-gray-600 mb-6">
          No tasks yet. Create one to get started.
        </p>
        <Link
          href="/dashboard/tasks/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <span>+</span> New Task
        </Link>
      </div>
    )
  }

  // Task list with header and new task button
  return (
    <div className="space-y-6">
      {/* New Task Button */}
      <div className="flex justify-end">
        <Link
          href="/dashboard/tasks/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <span>+</span> New Task
        </Link>
      </div>

      {/* Task List */}
      <ul
        className="space-y-3 divide-y divide-gray-200"
        role="list"
        aria-label="Task list"
      >
        {tasks.map((task) => (
          <li key={task.id} className="pt-3 first:pt-0">
            <TaskCard task={task} />
          </li>
        ))}
      </ul>
    </div>
  )
}
