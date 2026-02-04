// Dashboard Layout - Fixed Sidebar + Main Content Area

"use client"

import Link from "next/link"
import LogoutButton from "@/components/shared/LogoutButton"
import { ReactNode } from "react"

interface DashboardLayoutProps {
  children: ReactNode
  totalTasks: number
}

export default function DashboardLayout({ children, totalTasks }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 h-full overflow-y-auto z-40">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="text-2xl font-black text-[#1A1A1A]">
            Tasktrox
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F3A03F]/10 text-[#F3A03F] font-semibold border border-[#F3A03F]/30"
          >
            <span className="text-xl">📋</span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/tasks/new"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A1A] hover:bg-gray-50 transition"
          >
            <span className="text-xl">➕</span>
            <span>New Task</span>
          </Link>

          <div className="pt-4 border-t border-gray-200 mt-4">
            <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">
              Categories
            </h3>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A1A] hover:bg-gray-50 transition"
            >
              <span className="text-lg">⚡</span>
              <span className="text-sm">High Priority</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A1A] hover:bg-gray-50 transition"
            >
              <span className="text-lg">👥</span>
              <span className="text-sm">Team Tasks</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A1A] hover:bg-gray-50 transition"
            >
              <span className="text-lg">✅</span>
              <span className="text-sm">Completed</span>
            </Link>
          </div>
        </nav>

        {/* Task Stats */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs font-bold text-gray-600 uppercase mb-3">
            Task Stats
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Tasks</span>
              <span className="text-lg font-bold text-[#1A1A1A]">{totalTasks}</span>
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
        <div className="p-4 border-t border-gray-200">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="fixed top-0 right-0 left-64 bg-white/95 backdrop-blur-sm border-b border-gray-200 h-16 flex items-center px-8 z-30">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Welcome back! 👋
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </header>

        {/* Content with Top Margin for Header */}
        <div className="mt-16">
          {children}
        </div>
      </div>
    </div>
  )
}
