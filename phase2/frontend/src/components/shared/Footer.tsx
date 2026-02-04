// Footer Component
// Professional footer for all pages matching white theme

import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Content */}
        <div className="py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
            {/* Brand Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-black text-[#F3A03F]">▲</span>
                <h3 className="text-lg font-black text-[#1A1A1A]">Tasktrox</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Organize your tasks, boost your productivity, collaborate with your team.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-[#F3A03F]/10 text-[#F3A03F] hover:bg-[#F3A03F]/20 flex items-center justify-center transition text-xs font-bold"
                  aria-label="Twitter"
                  title="Twitter"
                >
                  𝕏
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-[#8E7CFF]/10 text-[#8E7CFF] hover:bg-[#8E7CFF]/20 flex items-center justify-center transition text-base font-bold"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  ◆
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-[#F3A03F]/10 text-[#F3A03F] hover:bg-[#F3A03F]/20 flex items-center justify-center transition text-base font-bold"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  ◈
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A] uppercase mb-4 text-gray-500">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#F3A03F] transition"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#F3A03F] transition"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#F3A03F] transition"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#F3A03F] transition"
                  >
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A] uppercase mb-4 text-gray-500">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#F3A03F] transition"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#F3A03F] transition"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#F3A03F] transition"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#F3A03F] transition"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A] uppercase mb-4 text-gray-500">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#F3A03F] transition"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#F3A03F] transition"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#F3A03F] transition"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#F3A03F] transition"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-6 sm:pt-8">
            {/* Bottom Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-xs sm:text-sm text-gray-600">
                © {currentYear} Tasktrox. All rights reserved. Built with ❤️ for productivity.
              </p>
              <div className="flex gap-4 text-xs sm:text-sm">
                <span className="text-gray-600">Made with Next.js</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600">Powered by FastAPI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
