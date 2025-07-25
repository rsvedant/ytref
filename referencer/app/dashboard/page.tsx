import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./dashboard-client"

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

  return <DashboardClient initialClips={serializedClips} />
}
