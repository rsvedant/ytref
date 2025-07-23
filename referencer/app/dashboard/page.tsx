"use client"

import { useSession, signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default function DashboardPage() {
  const { data: session } = useSession()

  // Redirect to auth if not authenticated
  if (!session) {
    redirect("/auth")
  }

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/auth"
        }
      }
    })
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
                Welcome, {session.user.name}
              </span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign out
              </Button>
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
