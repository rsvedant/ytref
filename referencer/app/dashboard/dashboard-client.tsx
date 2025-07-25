"use client"
import { useState } from "react"
import { ClipHoverEffect } from "@/components/ui/clip-cards"
import { ClipDetailsModal } from "@/components/ui/clip-details-modal"

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

interface DashboardClientProps {
  initialClips: Clip[]
}

export const DashboardClient = ({ initialClips }: DashboardClientProps) => {
  const [clips, setClips] = useState<Clip[]>(initialClips)
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewClip = async (clip: Clip) => {
    // Show modal immediately with skeleton for instant feel
    setSelectedClip(clip)
    setIsModalOpen(true)
    
    try {
      // Fetch the latest clip data in the background
      const response = await fetch(`/api/clips/${clip.id}`)
      if (response.ok) {
        const { clip: latestClip } = await response.json()
        setSelectedClip(latestClip)
      }
      // If fetch fails, we already have the clip data from the prop
    } catch (error) {
      console.error('Error fetching clip:', error)
      // We already have the clip data from the prop, so no need to handle error
    }
  }

  const handleUpdateClip = (updatedClip: Clip) => {
    setClips(prevClips => 
      prevClips.map(clip => 
        clip.id === updatedClip.id ? updatedClip : clip
      )
    )
  }

  const handleDeleteClip = (clipId: string) => {
    setClips(prevClips => prevClips.filter(clip => clip.id !== clipId))
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClip(null)
  }

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

          {clips.length === 0 ? (
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
            <ClipHoverEffect 
              clips={clips} 
              onViewClip={handleViewClip}
              onDeleteClip={handleDeleteClip}
            />
          )}
        </div>
      </main>

      <ClipDetailsModal
        clip={selectedClip}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleUpdateClip}
        onDelete={handleDeleteClip}
      />
    </div>
  )
}
