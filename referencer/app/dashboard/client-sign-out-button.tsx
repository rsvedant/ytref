"use client"

import { Button } from "@/components/ui/button"
// import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function ClientSignOutButton() {
  
  const handleSignOut = async () => {
    /** await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/auth/sign-in"
        }
      }
    })
    */
    // Redirecting to sign-out route instead of using signOut function
    const router = useRouter()
    router.push("/auth/sign-out")
  }

  return (
    <Button onClick={handleSignOut} variant="outline" size="sm">
      Sign out
    </Button>
  )
}
