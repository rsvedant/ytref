import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ClientSignOutButton } from "./client-sign-out-button"

export default async function DashboardPage() {

  // Redirect to auth if not authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    console.log("No session found, redirecting to sign-in")
    redirect("/auth/sign-in")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                YT Referencer Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session?.user?.name}
              </span>
              <ClientSignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">
                Dashboard Placeholder
              </h2>
              <p className="text-gray-500">
                This is where your YT Referencer dashboard content will go.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
