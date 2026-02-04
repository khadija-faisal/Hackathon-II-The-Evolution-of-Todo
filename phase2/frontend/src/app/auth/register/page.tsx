// [Task]: T-040, T-041
// [From]: plan.md §4.2: Better Auth Integration, tasks.md §T-040, T-041
// [Reference]: Constitution §I (JWT Bridge), FR-009 (Register)

"use client"

import SignupForm from "@/components/auth/SignupForm"
import Footer from "@/components/shared/Footer"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
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

      {/* Header */}
      <header className="relative z-10 border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/" className="text-2xl font-black text-[#1A1A1A] hover:text-[#F3A03F] transition">
            Tasktrox
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-[#1A1A1A] mb-3">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join thousands of teams organizing their work
            </p>
          </div>

          {/* White Card Form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            <SignupForm />
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-[#F3A03F] hover:text-[#E08F2C]">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
