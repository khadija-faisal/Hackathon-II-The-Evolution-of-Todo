// [Task]: T-M3-007
// [From]: plan.md §Part 6 M3-T7, Part 5.2; requirements.md §ChatKit UI Integration
// [Phase]: II/III (Shared Navigation with Chat Toggle)

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavbarProps {
  onMenuClick?: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")
  const isChat = pathname?.startsWith("/chat")

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex items-center justify-between min-h-16 gap-4">
          {/* Left: Logo Section */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Menu Button (Mobile) */}
            <button
              onClick={onMenuClick}
              className="md:hidden text-[#1A1A1A] hover:text-[#F3A03F] transition-colors text-xl font-bold"
              aria-label="Toggle sidebar"
              title="Toggle menu"
            >
              ≡
            </button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 group flex-shrink-0">
              <span className="text-xl sm:text-2xl font-black text-[#1A1A1A] group-hover:text-[#F3A03F] transition-colors">
                ▲
              </span>
              <span className="hidden sm:inline text-base sm:text-lg font-black text-[#1A1A1A] group-hover:text-[#F3A03F] transition-colors">
                Tasktrox
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/welcome"
              className="px-3 py-2 text-xs lg:text-sm font-semibold text-gray-600 hover:text-[#F3A03F] hover:bg-[#F3A03F]/5 rounded-lg transition-colors"
              title="Home"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className={`px-3 py-2 text-xs lg:text-sm font-semibold rounded-lg transition-colors ${
                isDashboard
                  ? "text-[#F3A03F] bg-[#F3A03F]/10 border border-[#F3A03F]/30"
                  : "text-gray-600 hover:text-[#F3A03F] hover:bg-[#F3A03F]/5"
              }`}
              title="Task Dashboard"
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className={`px-3 py-2 text-xs lg:text-sm font-semibold rounded-lg transition-colors ${
                isChat
                  ? "text-[#F3A03F] bg-[#F3A03F]/10 border border-[#F3A03F]/30"
                  : "text-gray-600 hover:text-[#F3A03F] hover:bg-[#F3A03F]/5"
              }`}
              title="Chat with AI"
            >
              Chat
            </Link>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* New Task Button (Desktop) */}
            <Link
              href="/dashboard/tasks/new"
              className="hidden sm:flex items-center gap-1 px-2 sm:px-4 py-2 bg-[#F3A03F] text-white font-bold text-xs sm:text-sm rounded-lg hover:bg-[#E08F2C] transition-colors"
              title="Create new task"
            >
              <span className="text-base">+</span>
              <span className="hidden lg:inline">New Task</span>
            </Link>

            {/* Mobile New Task Button */}
            <Link
              href="/dashboard/tasks/new"
              className="sm:hidden px-2 py-2 bg-[#F3A03F] text-white font-bold text-base rounded-lg hover:bg-[#E08F2C] transition-colors"
              aria-label="New task"
              title="New task"
            >
              +
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
