// [Task]: T-043, T-049
// [From]: plan.md §4.3: Dashboard UI, tasks.md §T-043, T-049
// [Reference]: Constitution §III (Server Components), pages.md §Page 2: Header

import LogoutButton from "./LogoutButton"
import Link from "next/link"

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
    <header className="border-b border-blue-500/20 bg-slate-800 shadow-lg">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo and Title Section */}
        <div className="flex items-center gap-4">
          <Link href="/welcome" className="text-3xl hover:scale-110 transition-transform duration-200">
            📝
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              My Tasks
            </h1>
            <p className="mt-1 text-sm text-gray-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              {totalTasks} {totalTasks === 1 ? "task" : "tasks"} to manage
            </p>
          </div>
        </div>

        {/* Right Section - Home Link + Logout Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/welcome"
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-blue-400 border border-gray-500/30 hover:border-blue-400/50 rounded-md transition-all duration-200 hover:bg-blue-500/10"
          >
            🏠 Home
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
