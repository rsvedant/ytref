"use client"
import { useState, useMemo, useCallback, useEffect } from "react"
import { ClipHoverEffect } from "@/components/ui/clip-cards"
import { ClipDetailsModal } from "@/components/ui/clip-details-modal"
import { TagFilterSelect, RatingFilterSelect, TagManagerSelect } from "@/components/ui/tag-components"
import { Button } from "@/components/ui/button"
import { useTagsSingleton } from "@/lib/hooks/use-tags-singleton"

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

interface ClipTag {
  id: string
  name: string
  rating: number
}

interface DashboardClientProps {
  initialClips: Clip[]
}

export const DashboardClient = ({ initialClips }: DashboardClientProps) => {
  const [clips, setClips] = useState<Clip[]>(initialClips)
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Tag filtering state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [minRating, setMinRating] = useState(1)
  const [clipTags, setClipTags] = useState<Record<string, ClipTag[]>>({})

  const { 
    tags, 
    loading: tagsLoading, 
    error: tagsError,
    createTag, 
    updateTag, 
    deleteTag 
  } = useTagsSingleton()

  // Load all clip tags on component mount for filtering
  useEffect(() => {
    const loadAllClipTags = async () => {
      try {
        // Only fetch tags for clips that don't have cached tags
        const clipsNeedingTags = clips.filter(clip => !clipTags[clip.id])
        
        if (clipsNeedingTags.length === 0) return

        const clipTagPromises = clipsNeedingTags.map(async (clip) => {
          const response = await fetch(`/api/clips/${clip.id}/tags`)
          if (response.ok) {
            const data = await response.json()
            return { clipId: clip.id, tags: data.tags }
          }
          return { clipId: clip.id, tags: [] }
        })

        const results = await Promise.all(clipTagPromises)
        const newClipTags: Record<string, ClipTag[]> = {}
        
        results.forEach(({ clipId, tags }) => {
          newClipTags[clipId] = tags
        })

        if (Object.keys(newClipTags).length > 0) {
          setClipTags(prev => ({ ...prev, ...newClipTags }))
        }
      } catch (error) {
        console.error('Error loading clip tags:', error)
      }
    }

    if (clips.length > 0) {
      loadAllClipTags()
    }
  }, [clips.length]) // Only depend on clips length, not the full clips array

  // Memoized function to fetch clip tags with caching
  const fetchClipTagsWithCache = useCallback(async (clipId: string): Promise<ClipTag[]> => {
    // Return cached tags if available
    if (clipTags[clipId]) {
      return clipTags[clipId]
    }

    try {
      const response = await fetch(`/api/clips/${clipId}/tags`)
      if (!response.ok) {
        throw new Error('Failed to fetch clip tags')
      }
      const data = await response.json()
      
      // Cache the tags
      setClipTags(prev => ({
        ...prev,
        [clipId]: data.tags
      }))
      
      return data.tags
    } catch (error) {
      console.error('Error fetching clip tags:', error)
      return []
    }
  }, [clipTags])

  // Filter clips based on selected tags and rating
  const filteredClips = useMemo(() => {
    if (selectedTagIds.length === 0) return clips

    return clips.filter(clip => {
      const tags = clipTags[clip.id] || []
      
      // Check if clip has any of the selected tags
      const hasSelectedTag = selectedTagIds.some(tagId => 
        tags.some(tag => tag.id === tagId)
      )
      
      if (!hasSelectedTag) return false
      
      // Check minimum rating for selected tags
      const relevantTags = tags.filter(tag => selectedTagIds.includes(tag.id))
      return relevantTags.some(tag => tag.rating >= minRating)
    })
  }, [clips, selectedTagIds, minRating, clipTags])

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
      
      // Fetch clip tags if not already cached
      if (!clipTags[clip.id]) {
        const tags = await fetchClipTagsWithCache(clip.id)
        // Tags are already cached by fetchClipTagsWithCache
      }
    } catch (error) {
      console.error('Error fetching clip:', error)
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
    // Remove from clipTags cache
    setClipTags(prev => {
      const newTags = { ...prev }
      delete newTags[clipId]
      return newTags
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClip(null)
  }

  // Callback to refresh clip tags from the modal
  const refreshClipTags = useCallback(async (clipId: string) => {
    try {
      const response = await fetch(`/api/clips/${clipId}/tags`)
      if (response.ok) {
        const data = await response.json()
        setClipTags(prev => ({
          ...prev,
          [clipId]: data.tags
        }))
      }
    } catch (error) {
      console.error('Error refreshing clip tags:', error)
    }
  }, [])

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const clearFilters = () => {
    setSelectedTagIds([])
    setMinRating(1)
  }

  const hasActiveFilters = selectedTagIds.length > 0 || minRating > 1

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-16">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Your YouTube Clips
              </h1>
              <p className="text-muted-foreground">
                Manage and watch your saved YouTube clips
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Tag Filter Select */}
              <TagFilterSelect
                tags={tags}
                selectedTags={selectedTagIds}
                onTagToggle={handleTagToggle}
              />
              
              {/* Rating Filter Select */}
              <RatingFilterSelect
                minRating={minRating}
                onMinRatingChange={setMinRating}
              />
              
              {/* Tag Manager Select */}
              <TagManagerSelect
                tags={tags}
                onCreateTag={createTag}
                onUpdateTag={updateTag}
                onDeleteTag={deleteTag}
              />
              
              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Filter Status */}
          {hasActiveFilters && (
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredClips.length} of {clips.length} clips
              {selectedTagIds.length > 0 && (
                <span> • Filtered by {selectedTagIds.length} tag{selectedTagIds.length === 1 ? '' : 's'}</span>
              )}
              {minRating > 1 && (
                <span> • {minRating}+ star rating</span>
              )}
            </div>
          )}

          {/* Clips Grid */}
          {filteredClips.length === 0 ? (
            <div className="border border-white/20 bg-white/10 backdrop-blur-md rounded-lg h-96 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <h2 className="text-2xl font-medium text-foreground mb-2">
                  {clips.length === 0 ? "No clips yet" : "No clips match your filters"}
                </h2>
                <p className="text-muted-foreground">
                  {clips.length === 0 
                    ? "Start creating clips with the YouTube extension to see them here."
                    : "Try adjusting your tag filters or minimum rating."
                  }
                </p>
                {hasActiveFilters && clips.length > 0 && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <ClipHoverEffect 
              clips={filteredClips} 
              clipTags={clipTags}
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
        onTagsUpdated={refreshClipTags}
      />
    </div>
  )
}
