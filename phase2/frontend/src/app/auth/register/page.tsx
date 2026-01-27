// [Task]: T-040
// [From]: plan.md §4.2: Better Auth Integration, pages.md §Page 1 (Authentication Pages)
// [Reference]: FR-012 (User Registration), Constitution §III (Server Components Default)

import SignupForm from "@/components/auth/SignupForm"

/**
 * Register Page - Server Component for user registration
 *
 * Structure:
 * - Renders the page layout with centered form
 * - Includes heading and subheading
 * - Renders SignupForm client component
 * - Similar layout to login page for consistency
 *
 * Task: T-040
 * Reference: pages.md §Page 1 (future signup page)
 */
export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Join us to start managing your tasks
          </p>
        </div>

        {/* Signup Form */}
        <SignupForm />
      </div>
    </div>
  )
}
