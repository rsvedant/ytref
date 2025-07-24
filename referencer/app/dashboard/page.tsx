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
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-16">
        <div className="px-4 py-6 sm:px-0">
          <div className="border border-white/20 bg-white/10 backdrop-blur-md rounded-lg h-96 flex items-center justify-center shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-foreground mb-2">
                Dashboard Placeholder
              </h2>
              <p className="text-muted-foreground">
                This is where your YT Referencer dashboard content will go.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
