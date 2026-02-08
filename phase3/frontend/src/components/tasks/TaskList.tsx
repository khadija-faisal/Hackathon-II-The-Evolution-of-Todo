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

export default function TaskList({ tasks }: TaskListProps) {
  const { openDeleteTaskId } = useTaskModal()

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-2xl border-2 border-dashed border-gray-300 px-4">
        <div className="text-3xl sm:text-5xl mb-3 sm:mb-4">📭</div>
        <p className="text-xs sm:text-base text-gray-600 mb-4 sm:mb-6 font-medium">
          No tasks yet. Create one to get started!
        </p>
        <Link
          href="/dashboard/tasks/new"
          className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-[#F3A03F] text-white font-bold text-xs sm:text-sm rounded-lg hover:bg-[#E08F2C] transition"
        >
          ➕ New Task
        </Link>
      </div>
    )
  }

  return (
    <div className={`transition-opacity duration-300 ${openDeleteTaskId ? "opacity-50 pointer-events-none" : ""}`}>
      {/* List Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-[#1A1A1A]">
          All Tasks ({tasks.length})
        </h2>
        <Link
          href="/dashboard/tasks/new"
          className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-[#F3A03F] text-white font-semibold rounded-lg hover:bg-[#E08F2C] transition text-center"
        >
          ➕ New Task
        </Link>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
