// Dashboard Layout - Responsive Fixed Sidebar + Main Content Area
// [Task]: T-042, T-043
// [Reference]: Constitution §III (Server Components), responsive design

"use client"

import Link from "next/link"
import LogoutButton from "@/components/shared/LogoutButton"
import { ReactNode, useState, useEffect } from "react"

interface DashboardLayoutProps {
  children: ReactNode
  totalTasks: number
}

export default function DashboardLayout({ children, totalTasks }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detect if device is mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - Desktop Fixed / Mobile Overlay */}
      <aside
        className={`fixed md:relative w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto transition-transform duration-300 z-40 ${
          isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <Link
            href="/dashboard"
            className="text-xl sm:text-2xl font-black text-[#1A1A1A] block"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            Tasktrox
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 sm:px-4 py-6 sm:py-8 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-[#F3A03F]/10 text-[#F3A03F] font-semibold border border-[#F3A03F]/30 text-sm sm:text-base transition"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <span className="text-lg sm:text-xl">📋</span>
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>

          <Link
            href="/dashboard/tasks/new"
            className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-[#1A1A1A] hover:bg-gray-50 transition text-sm sm:text-base"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <span className="text-lg sm:text-xl">➕</span>
            <span>New Task</span>
          </Link>

          <div className="pt-4 border-t border-gray-200 mt-4">
            <h3 className="px-3 sm:px-4 py-2 text-xs font-bold text-gray-500 uppercase">
              Categories
            </h3>
            <button
              disabled
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-[#1A1A1A] hover:bg-gray-50 transition text-sm sm:text-base"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <span className="text-lg">⚡</span>
              <span className="text-xs sm:text-sm">High Priority</span>
            </button>
            <button
              disabled
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-[#1A1A1A] hover:bg-gray-50 transition text-sm sm:text-base"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <span className="text-lg">👥</span>
              <span className="text-xs sm:text-sm">Team Tasks</span>
            </button>
            <button
              disabled
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-[#1A1A1A] hover:bg-gray-50 transition text-sm sm:text-base"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <span className="text-lg">✅</span>
              <span className="text-xs sm:text-sm">Completed</span>
            </button>
          </div>
        </nav>

        {/* Task Stats */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs font-bold text-gray-600 uppercase mb-3">
            Task Stats
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Total Tasks</span>
              <span className="text-base sm:text-lg font-bold text-[#1A1A1A]">{totalTasks}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F3A03F] to-[#8E7CFF]"
                style={{ width: "65%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-8 z-30 flex-shrink-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-[#1A1A1A] hover:text-[#F3A03F] transition text-2xl"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          {/* Welcome Message */}
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-gray-600">
              Welcome back! 👋
            </p>
          </div>

          {/* Date */}
          <div className="text-right">
            <p className="text-xs sm:text-sm font-semibold text-[#1A1A1A]">
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
