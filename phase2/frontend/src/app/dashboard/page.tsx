// [Task]: T-042
// [From]: plan.md §4.3: Dashboard UI, tasks.md §T-042
// [Reference]: Constitution §III (Server Components), Constitution §V (User Isolation), FR-004 (List Tasks)

import { apiGet } from "@/lib/api"
import type { TaskListResponse } from "@/lib/types"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import TaskList from "@/components/tasks/TaskList"

export default async function DashboardPage() {
  const data = await apiGet<TaskListResponse>(
    "/api/v1/tasks?limit=100&offset=0"
  )

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

      {/* Sidebar + Main Layout */}
      <DashboardLayout totalTasks={data.total}>
        <main className="relative z-10 p-8">
          <div className="max-w-6xl">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-black text-[#1A1A1A] mb-2">
                Your Tasks
              </h1>
              <p className="text-gray-600">
                {data.total} task{data.total !== 1 ? 's' : ''} in progress
              </p>
            </div>

            {/* Task List */}
            <div className="animate-fadeIn">
              <TaskList tasks={data.data} />
            </div>
          </div>
        </main>
      </DashboardLayout>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
