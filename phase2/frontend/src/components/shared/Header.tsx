// [Task]: T-043, T-049
// [From]: plan.md §4.3: Dashboard UI, tasks.md §T-043, T-049
// [Reference]: Constitution §III (Server Components), pages.md §Page 2: Header

import LogoutButton from "./LogoutButton"

interface HeaderProps {
  totalTasks: number
}

/**
 * Header - Server Component with Logo, Title, and Logout Button
 *
 * Displays:
 * - App title "My Tasks"
 * - Total task counter
 * - Logout button (T-049 Client Component)
 *
 * Constitution Compliance:
 * - Principle III: Server Component (data fetching, layout)
 * - Logout button is separate Client Component for interactivity
 */
export default function Header({ totalTasks }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Title and Task Counter */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            My Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
          </p>
        </div>

        {/* Logout Button (Client Component) */}
        <LogoutButton />
      </div>
    </header>
  )
}
