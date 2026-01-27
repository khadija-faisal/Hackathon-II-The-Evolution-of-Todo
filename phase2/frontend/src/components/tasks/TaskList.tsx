// [Task]: T-044
// [From]: plan.md §4.3: Dashboard UI, tasks.md §T-044
// [Reference]: Constitution §III (Server Components), FR-004 (List Tasks)

"use client"

import Link from "next/link"
import type { TaskResponse } from "@/lib/types"
import TaskCard from "./TaskCard"
import { useTaskModal } from "@/context/TaskModalContext"

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
  const { openDeleteTaskId } = useTaskModal()
  const isModalOpen = openDeleteTaskId !== null

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className={`rounded-lg border border-dashed border-blue-500/30 bg-blue-500/5 py-16 text-center transition-all duration-300 ${isModalOpen ? "opacity-30 pointer-events-none" : ""}`}>
        <p className="text-gray-400 mb-8 text-lg">
          ✨ No tasks yet. Create one to get started!
        </p>
        <Link
          href="/dashboard/tasks/new"
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105"
        >
          <span>➕</span> New Task
        </Link>
      </div>
    )
  }

  // Task list with header and new task button
  return (
    <div className={`space-y-6 transition-all duration-300 ${isModalOpen ? "opacity-30 pointer-events-none" : ""}`}>
      {/* New Task Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Your Tasks</h2>
        <Link
          href="/dashboard/tasks/new"
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105"
        >
          <span>➕</span> New Task
        </Link>
      </div>

      {/* Task List */}
      <ul
        className="space-y-3"
        role="list"
        aria-label="Task list"
      >
        {tasks.map((task, index) => (
          <li key={task.id} className="animate-slideIn" style={{ animationDelay: `${index * 50}ms` }}>
            <TaskCard task={task} />
          </li>
        ))}
      </ul>

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
