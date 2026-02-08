// Welcome/Landing Page - White Background, Grid Pattern, Professional Design
"use client"

import Link from "next/link"
import Footer from "@/components/shared/Footer"
import { motion } from "framer-motion"
import { useState } from "react"

export default function WelcomePage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
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

      {/* Fixed Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#1A1A1A]">
            <span className="font-black">Tasktrox</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-gray-700 font-medium hover:text-[#1A1A1A] transition">
              Home
            </Link>
            <Link href="#features" className="text-gray-700 font-medium hover:text-[#1A1A1A] transition">
              Features
            </Link>
            <Link href="#solutions" className="text-gray-700 font-medium hover:text-[#1A1A1A] transition">
              Solutions
            </Link>
            <Link href="#" className="text-gray-700 font-medium hover:text-[#1A1A1A] transition">
              Pricing
            </Link>
            <Link href="#" className="text-gray-700 font-medium hover:text-[#1A1A1A] transition">
              Resources
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-6 py-2 text-[#1A1A1A] font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 bg-[#F3A03F] text-white font-semibold rounded-lg hover:bg-[#E08F2C] transition"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-black text-[#1A1A1A] mb-6 leading-tight">
                Your Daily Tasks Organized Effortlessly
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Tasktrox brings clarity to chaos. Organize, prioritize, and collaborate with your team in a visual workspace designed for productivity.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/auth/register"
                  className="px-8 py-3 bg-[#1A1A1A] text-white font-bold rounded-lg hover:bg-[#333] transition"
                >
                  Start Free Now
                </Link>
                <Link
                  href="#"
                  className="px-8 py-3 border-2 border-[#1A1A1A] text-[#1A1A1A] font-bold rounded-lg hover:bg-gray-50 transition"
                >
                  See Demo
                </Link>
              </div>
            </motion.div>

            {/* Right: Interactive Visual Flow */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-96 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-8 flex items-center justify-center"
            >
              {/* Visual Node Flow */}
              <svg className="absolute inset-0 w-full h-full" style={{ padding: "32px" }}>
                {/* Connection lines */}
                <line x1="50%" y1="20%" x2="50%" y2="50%" stroke="#e5e7eb" strokeWidth="2" />
                <line x1="50%" y1="50%" x2="80%" y2="70%" stroke="#F3A03F" strokeWidth="2" strokeDasharray="5,5" />
              </svg>

              {/* Card Nodes */}
              <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
                {/* Top Card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="absolute top-0 bg-white rounded-lg shadow-lg p-4 w-40 border border-gray-200 cursor-pointer"
                >
                  <div className="text-sm font-bold text-[#1A1A1A]">Redesign Dashboard</div>
                  <div className="text-xs text-gray-600 mt-1">Due: Feb 10</div>
                </motion.div>

                {/* Bottom Right - Add Member Popup */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="absolute bottom-8 right-8 bg-white rounded-lg shadow-lg p-4 w-44 border border-[#8E7CFF]"
                >
                  <div className="text-sm font-bold text-[#1A1A1A] mb-3">Add Member</div>
                  <input
                    type="email"
                    placeholder="member@team.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs mb-2"
                    readOnly
                  />
                  <button className="w-full bg-[#8E7CFF] text-white text-xs font-bold py-2 rounded hover:bg-[#7B6EE6] transition">
                    Invite
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-black text-[#1A1A1A] text-center mb-16">
              Powerful Features Built for Teams
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1: Smart Prioritization */}
              <motion.div
                whileHover={{ y: -5 }}
                onMouseEnter={() => setHoveredCard("priority")}
                onMouseLeave={() => setHoveredCard(null)}
                className={`p-8 rounded-xl border-2 transition ${
                  hoveredCard === "priority"
                    ? "border-[#F3A03F] bg-orange-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="text-4xl mb-4 font-bold text-[#F3A03F]">▲</div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  Smart Task Prioritization
                </h3>
                <p className="text-gray-600 mb-4">
                  Automatically rank tasks by urgency, deadline, and team dependencies. Stay focused on what matters most.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center gap-2"><span className="text-[#F3A03F] font-bold">✓</span> AI-powered prioritization</li>
                  <li className="flex items-center gap-2"><span className="text-[#F3A03F] font-bold">✓</span> Deadline tracking</li>
                  <li className="flex items-center gap-2"><span className="text-[#F3A03F] font-bold">✓</span> Dependency mapping</li>
                </ul>
              </motion.div>

              {/* Feature 2: Real-time Collaboration */}
              <motion.div
                whileHover={{ y: -5 }}
                onMouseEnter={() => setHoveredCard("collab")}
                onMouseLeave={() => setHoveredCard(null)}
                className={`p-8 rounded-xl border-2 transition ${
                  hoveredCard === "collab"
                    ? "border-[#8E7CFF] bg-purple-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="text-4xl mb-4 font-bold text-[#8E7CFF]">◆</div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  Real-time Collaboration
                </h3>
                <p className="text-gray-600 mb-4">
                  Invite team members, assign tasks, and see live updates. Everyone stays on the same page.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center gap-2"><span className="text-[#8E7CFF] font-bold">✓</span> Instant notifications</li>
                  <li className="flex items-center gap-2"><span className="text-[#8E7CFF] font-bold">✓</span> Team avatars & mentions</li>
                  <li className="flex items-center gap-2"><span className="text-[#8E7CFF] font-bold">✓</span> Activity timeline</li>
                </ul>
              </motion.div>

              {/* Feature 3: Progress Tracking */}
              <motion.div
                whileHover={{ y: -5 }}
                onMouseEnter={() => setHoveredCard("progress")}
                onMouseLeave={() => setHoveredCard(null)}
                className={`p-8 rounded-xl border-2 transition ${
                  hoveredCard === "progress"
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="text-4xl mb-4 font-bold text-blue-400">◈</div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  Visual Progress Tracking
                </h3>
                <p className="text-gray-600 mb-4">
                  See project progress at a glance with beautiful dashboards and detailed analytics.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center gap-2"><span className="text-blue-400 font-bold">✓</span> Real-time dashboards</li>
                  <li className="flex items-center gap-2"><span className="text-blue-400 font-bold">✓</span> Completion metrics</li>
                  <li className="flex items-center gap-2"><span className="text-blue-400 font-bold">✓</span> Team performance insights</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-20 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black text-[#1A1A1A] mb-12">
              Built for Every Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Product Teams", desc: "Manage sprints, features, and releases effortlessly" },
                { title: "Design Teams", desc: "Organize design tasks, reviews, and handoffs" },
                { title: "Marketing Teams", desc: "Campaign planning, content calendar, and launches" }
              ].map((solution, idx) => (
                <div key={idx} className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition">
                  <h3 className="font-bold text-[#1A1A1A] mb-2">{solution.title}</h3>
                  <p className="text-gray-600 text-sm">{solution.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black text-[#1A1A1A] mb-6">
              Ready to Boost Productivity?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of teams organizing their work with Tasktrox.
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-10 py-4 bg-[#F3A03F] text-white font-bold rounded-lg hover:bg-[#E08F2C] transition text-lg"
            >
              Get Started Free
            </Link>
          </div>
        </section>

        {/* Footer Component */}
        <Footer />
      </main>
    </div>
  )
}
