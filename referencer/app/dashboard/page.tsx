import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ClipHoverEffect } from "@/components/ui/clip-cards"
import { ClientSignOutButton } from "./client-sign-out-button"

interface Clip {
  id: string
  videoId: string
  title: string
  thumbnail: string
  startTime: number
  endTime: number
  isPublic: boolean
  shareSlug: string | null
  createdAt: string
  updatedAt: string
}

export default async function DashboardPage() {
  // Redirect to auth if not authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    console.log("No session found, redirecting to sign-in")
    redirect("/auth/sign-in")
  }

  // Fetch clips for the authenticated user
  const clips = await prisma.clip.findMany({
    where: {
      userId: session.user.id
    },
    select: {
      id: true,
      videoId: true,
      title: true,
      thumbnail: true,
      startTime: true,
      endTime: true,
      isPublic: true,
      shareSlug: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Convert dates to strings for client component
  const serializedClips: Clip[] = clips.map(clip => ({
    ...clip,
    createdAt: clip.createdAt.toISOString(),
    updatedAt: clip.updatedAt.toISOString()
  }))

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-16">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Your YouTube Clips
            </h1>
            <p className="text-muted-foreground">
              Manage and watch your saved YouTube clips
            </p>
          </div>

          {serializedClips.length === 0 ? (
            <div className="border border-white/20 bg-white/10 backdrop-blur-md rounded-lg h-96 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <h2 className="text-2xl font-medium text-foreground mb-2">
                  No clips yet
                </h2>
                <p className="text-muted-foreground">
                  Start creating clips with the YouTube extension to see them here.
                </p>
              </div>
            </div>
          ) : (
            <ClipHoverEffect clips={serializedClips} />
          )}
        </div>
      </main>
    </div>
  )
}
