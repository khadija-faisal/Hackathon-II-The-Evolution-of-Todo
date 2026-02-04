// Dashboard Navbar Component
// Professional navigation bar with logo and links

"use client"

import Link from "next/link"
import { useState } from "react"

interface NavbarProps {
  onMenuClick?: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between h-auto sm:h-16">
          {/* Left: Logo and Home Link */}
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Menu Button (Mobile) */}
            <button
              onClick={onMenuClick}
              className="md:hidden text-[#1A1A1A] hover:text-[#F3A03F] transition text-2xl"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-lg sm:text-2xl font-black text-[#1A1A1A] group-hover:text-[#F3A03F] transition">
                🚀
              </span>
              <span className="hidden sm:inline text-lg sm:text-xl font-black text-[#1A1A1A] group-hover:text-[#F3A03F] transition">
                Tasktrox
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#F3A03F] hover:bg-[#F3A03F]/5 rounded-lg transition"
            >
              🏠 Home
            </Link>
            <Link
              href="/dashboard"
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[#F3A03F] bg-[#F3A03F]/10 rounded-lg border border-[#F3A03F]/30 transition"
            >
              📋 Dashboard
            </Link>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* New Task Button (Desktop) */}
            <Link
              href="/dashboard/tasks/new"
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#F3A03F] text-white font-semibold text-xs sm:text-sm rounded-lg hover:bg-[#E08F2C] transition"
            >
              ➕ <span className="hidden md:inline">New Task</span>
            </Link>

            {/* Mobile New Task Button */}
            <Link
              href="/dashboard/tasks/new"
              className="sm:hidden px-3 py-2 bg-[#F3A03F] text-white font-semibold text-sm rounded-lg hover:bg-[#E08F2C] transition"
              aria-label="New task"
            >
              ➕
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
