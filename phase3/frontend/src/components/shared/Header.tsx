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
    <header className="border-b border-gradient-to-r from-blue-500/30 via-cyan-500/30 to-indigo-500/30 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo and Title Section */}
        <div className="flex items-center gap-4">
          <Link
            href="/welcome"
            className="text-4xl hover:scale-110 transition-transform duration-200 hover:rotate-12 cursor-pointer"
          >
            ✅
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Task Master
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/50">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-xs font-semibold text-blue-300">
                  {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Home Link + Logout Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/welcome"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-200 hover:text-white border-2 border-gray-500/40 hover:border-blue-400/70 rounded-lg transition-all duration-200 hover:bg-blue-500/15 hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
          >
            <span>🏠</span>
            <span>Home</span>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
