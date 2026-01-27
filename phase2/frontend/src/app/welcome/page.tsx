// Landing/Welcome page for unauthenticated users

import Link from "next/link"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-slate-800/80 backdrop-blur-md border-b border-blue-500/20 z-50">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-cyan-300 transition duration-300">
            📝 Todo App
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/#features"
              className="text-gray-300 font-medium hover:text-blue-400 transition duration-300 ease-in-out"
            >
              Features
            </Link>
            <Link
              href="/#about"
              className="text-gray-300 font-medium hover:text-blue-400 transition duration-300 ease-in-out"
            >
              About
            </Link>

            {/* Auth Buttons */}
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="px-6 py-2 text-blue-400 font-medium border-2 border-blue-400 rounded-lg hover:bg-blue-400/10 hover:border-blue-300 transition duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-blue-500/50 transition duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-screen pt-20">
        <div className="text-center max-w-3xl px-6 animate-fadeIn">
          {/* Animated Gradient Text */}
          <div className="mb-6 inline-block">
            <span className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              Stay Organized & Productive
            </span>
          </div>

          <p className="text-xl text-gray-300 mb-8 animate-slideUp opacity-90 hover:opacity-100 transition duration-500">
            A simple, fast, and secure way to manage your daily tasks. Never miss anything important again.
          </p>

          {/* Features Section */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-16">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 hover:border-blue-400/50 rounded-xl p-8 shadow-xl hover:shadow-blue-500/20 transition duration-300 hover:scale-105 transform">
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition duration-300">✨</div>
              <h3 className="font-semibold text-white mb-2">Easy to Use</h3>
              <p className="text-gray-300 text-sm">
                Create, edit, and manage tasks in seconds
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 hover:border-purple-400/50 rounded-xl p-8 shadow-xl hover:shadow-purple-500/20 transition duration-300 hover:scale-105 transform">
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition duration-300">🔒</div>
              <h3 className="font-semibold text-white mb-2">Secure</h3>
              <p className="text-gray-300 text-sm">
                Your data is encrypted and protected
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 hover:border-green-400/50 rounded-xl p-8 shadow-xl hover:shadow-green-500/20 transition duration-300 hover:scale-105 transform">
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition duration-300">⚡</div>
              <h3 className="font-semibold text-white mb-2">Fast</h3>
              <p className="text-gray-300 text-sm">
                Lightning-quick performance, always
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 animate-slideUp">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-blue-500/50 hover:from-blue-600 hover:to-cyan-600 transition duration-300 transform hover:scale-105"
            >
              Create Account
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 border-2 border-blue-400 text-blue-400 rounded-lg font-semibold hover:bg-blue-400/10 hover:border-blue-300 transition duration-300 transform hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* About Section */}
      <section id="about" className="py-20 border-t border-blue-500/20 bg-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-12 text-center">
            About Todo App
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 hover:border-blue-400/50 rounded-xl p-8 transition duration-300 hover:shadow-xl hover:shadow-blue-500/20">
              <h4 className="text-2xl font-semibold text-white mb-4">🎯 Our Mission</h4>
              <p className="text-gray-300">
                To help people stay organized and productive by providing a simple, intuitive task management solution that respects your privacy and keeps your data secure.
              </p>
            </div>

            {/* Built For You Card */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 hover:border-purple-400/50 rounded-xl p-8 transition duration-300 hover:shadow-xl hover:shadow-purple-500/20">
              <h4 className="text-2xl font-semibold text-white mb-4">💡 Built For You</h4>
              <p className="text-gray-300">
                Created with modern technology (Next.js, FastAPI, Neon PostgreSQL) to ensure fast performance, security, and reliability you can count on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-blue-500/20 py-8 mt-20">
        <div className="text-center text-gray-400 text-sm">
          <p className="mb-2">Built with <span className="text-cyan-400">Next.js 16</span> • <span className="text-blue-400">FastAPI</span> • <span className="text-green-400">Neon PostgreSQL</span></p>
          <p className="mt-4">© 2026 Todo App. All rights reserved.</p>
        </div>
      </footer>

      {/* Animated Background Elements */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 1s ease-out forwards;
          animation-delay: 0.3s;
        }

        .animate-slideUp {
          animation: slideUp 1s ease-out 0.3s forwards;
        }
      `}</style>
    </div>
  )
}
