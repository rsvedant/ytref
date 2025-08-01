"use client"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save, Trash2, ExternalLink, Timer, Edit3, Clock } from "lucide-react"
import { ClipDetailsSkeleton } from "./clip-details-skeleton"
import { TagSelector } from "./tag-components"
import { useTagsSingleton } from "@/lib/hooks/use-tags-singleton"

interface ClipTag {
  id: string
  name: string
  rating: number
}

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

interface ClipDetailsModalProps {
  clip: Clip | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedClip: Clip) => void
  onDelete: (clipId: string) => void
  onTagsUpdated?: (clipId: string) => Promise<void>
}

export const ClipDetailsModal = ({ 
  clip, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete,
  onTagsUpdated
}: ClipDetailsModalProps) => {
  const [editedClip, setEditedClip] = useState<Clip | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSkeletonVisible, setIsSkeletonVisible] = useState(true)
  
  // Tags functionality  
  const { tags, createTag } = useTagsSingleton()
  const [clipTags, setClipTags] = useState<ClipTag[]>([])
  
  // Fetch tags for a specific clip
  const fetchClipTags = useCallback(async (clipId: string) => {
    try {
      const response = await fetch(`/api/clips/${clipId}/tags`)
      if (!response.ok) {
        throw new Error('Failed to fetch clip tags')
      }
      const data = await response.json()
      setClipTags(data.tags)
    } catch (err) {
      console.error('Error fetching clip tags:', err)
      setClipTags([])
    }
  }, [])

  // Add tag to clip
  const addTagToClip = useCallback(async (clipId: string, tagId: string, rating: number) => {
    try {
      const response = await fetch(`/api/clips/${clipId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagId, rating }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add tag to clip')
      }
      
      // Get the updated tag from the response instead of making another API call
      const result = await response.json()
      if (result.clipTag?.tag) {
        // Update local state with the new tag
        setClipTags(prev => {
          const newTag = {
            id: result.clipTag.tag.id,
            name: result.clipTag.tag.name,
            rating: result.clipTag.rating
          }
          return [...prev.filter(t => t.id !== tagId), newTag]
        })
      }
      
      // Notify parent component to update its cache
      if (onTagsUpdated) {
        await onTagsUpdated(clipId)
      }
    } catch (err) {
      console.error('Error adding tag to clip:', err)
    }
  }, [tags, onTagsUpdated])

  // Remove tag from clip
  const removeTagFromClip = useCallback(async (clipId: string, tagId: string) => {
    try {
      const response = await fetch(`/api/clips/${clipId}/tags`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagId }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove tag from clip')
      }
      
      // Update local state by removing the tag
      setClipTags(prev => prev.filter(t => t.id !== tagId))
      
      // Notify parent component to update its cache
      if (onTagsUpdated) {
        await onTagsUpdated(clipId)
      }
    } catch (err) {
      console.error('Error removing tag from clip:', err)
    }
  }, [onTagsUpdated])

  useEffect(() => {
    if (clip) {
      setEditedClip({ ...clip })
      // Only fetch tags if we don't already have them
      fetchClipTags(clip.id)
      // Show skeleton briefly for smooth loading feeling
      setIsSkeletonVisible(true)
      const timer = setTimeout(() => setIsSkeletonVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [clip?.id]) // Only depend on clip.id, not the entire clip object or fetchClipTags

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getYouTubeWatchUrl = (videoId: string, startTime: number) => {
    return `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(startTime)}s`
  }

  // Time handling logic from extension popup.tsx
  const handleMinutesChange = (field: 'startTime' | 'endTime', minutes: string) => {
    if (!editedClip) return
    
    const mins = Math.max(0, parseInt(minutes) || 0)
    const currentSeconds = field === 'startTime' 
      ? editedClip.startTime % 60 
      : editedClip.endTime % 60
    
    let totalSeconds = mins * 60 + currentSeconds
    
    // Validate and constrain the time values
    if (field === 'startTime') {
      totalSeconds = Math.max(0, Math.min(totalSeconds, editedClip.endTime - 1))
    } else if (field === 'endTime') {
      totalSeconds = Math.max(editedClip.startTime + 1, totalSeconds)
    }
    
    setEditedClip({ ...editedClip, [field]: totalSeconds })
  }

  const handleSecondsChange = (field: 'startTime' | 'endTime', seconds: string) => {
    if (!editedClip) return
    
    const secs = Math.max(0, Math.min(59, parseInt(seconds) || 0))
    const currentMinutes = Math.floor((field === 'startTime' ? editedClip.startTime : editedClip.endTime) / 60)
    
    let totalSeconds = currentMinutes * 60 + secs
    
    // Validate and constrain the time values
    if (field === 'startTime') {
      totalSeconds = Math.max(0, Math.min(totalSeconds, editedClip.endTime - 1))
    } else if (field === 'endTime') {
      totalSeconds = Math.max(editedClip.startTime + 1, totalSeconds)
    }
    
    setEditedClip({ ...editedClip, [field]: totalSeconds })
  }

  const handleSave = async () => {
    if (!editedClip || !clip) return

    setIsLoading(true)
    setError(null)

    try {
      // Validate time constraints
      if (editedClip.endTime <= editedClip.startTime) {
        throw new Error("End time must be greater than start time")
      }

      const response = await fetch(`/api/clips/${clip.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedClip.title,
          thumbnail: editedClip.thumbnail,
          startTime: editedClip.startTime,
          endTime: editedClip.endTime,
          isPublic: editedClip.isPublic,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update clip')
      }

      const { clip: updatedClip } = await response.json()
      onUpdate(updatedClip)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!clip) return

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/clips/${clip.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete clip')
      }

      onDelete(clip.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !clip || !editedClip) return null

  const clipDuration = editedClip ? editedClip.endTime - editedClip.startTime : 0

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {isSkeletonVisible ? (
          <ClipDetailsSkeleton />
        ) : (
          <motion.div
            className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-card-foreground">Edit Clip</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-card-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-destructive/20 border border-destructive text-destructive p-3 rounded">
                  {error}
                </div>
              )}

              {/* Video Preview */}
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={editedClip.thumbnail}
                  alt={editedClip.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <div className="flex items-center space-x-2 text-card-foreground mb-2">
                    <Edit3 className="w-4 h-4" />
                    <label className="text-sm font-medium">Title</label>
                  </div>
                  <input
                    type="text"
                    value={editedClip.title}
                    onChange={(e) => setEditedClip({ ...editedClip, title: e.target.value })}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-card-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>

                {/* Thumbnail URL */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={editedClip.thumbnail}
                    onChange={(e) => setEditedClip({ ...editedClip, thumbnail: e.target.value })}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-card-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>

                {/* Time controls matching extension style */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-green-500">
                      <Timer className="w-4 h-4" />
                      <label className="text-sm font-medium">Start Time</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={Math.floor(editedClip.startTime / 60)}
                        onChange={(e) => handleMinutesChange('startTime', e.target.value)}
                        className="bg-input border border-border text-card-foreground text-center focus:border-green-500 focus:ring-green-500/20 w-16 h-10 text-sm px-3 py-2 rounded"
                        placeholder="0"
                      />
                      <span className="text-muted-foreground text-sm font-medium">:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={Math.floor(editedClip.startTime % 60)}
                        onChange={(e) => handleSecondsChange('startTime', e.target.value)}
                        className="bg-input border border-border text-card-foreground text-center focus:border-green-500 focus:ring-green-500/20 w-16 h-10 text-sm px-3 py-2 rounded"
                        placeholder="00"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-red-500">
                      <Timer className="w-4 h-4" />
                      <label className="text-sm font-medium">End Time</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={Math.floor(editedClip.endTime / 60)}
                        onChange={(e) => handleMinutesChange('endTime', e.target.value)}
                        className="bg-input border border-border text-card-foreground text-center focus:border-red-500 focus:ring-red-500/20 w-16 h-10 text-sm px-3 py-2 rounded"
                        placeholder="0"
                      />
                      <span className="text-muted-foreground text-sm font-medium">:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={Math.floor(editedClip.endTime % 60)}
                        onChange={(e) => handleSecondsChange('endTime', e.target.value)}
                        className="bg-input border border-border text-card-foreground text-center focus:border-red-500 focus:ring-red-500/20 w-16 h-10 text-sm px-3 py-2 rounded"
                        placeholder="00"
                      />
                    </div>
                  </div>
                </div>

                {/* Clip Duration Display */}
                <div className="bg-muted border border-border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-card-foreground" />
                      <span className="text-card-foreground font-medium">Clip Duration</span>
                    </div>
                    <div className="text-card-foreground font-bold text-lg">
                      {formatTime(clipDuration)}
                    </div>
                  </div>
                </div>

                {/* Public checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={editedClip.isPublic}
                    onChange={(e) => setEditedClip({ ...editedClip, isPublic: e.target.checked })}
                    className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring"
                  />
                  <label htmlFor="isPublic" className="text-sm text-card-foreground">
                    Make clip public
                  </label>
                </div>

                {/* Tag Management */}
                <div className="border border-border rounded-lg p-4">
                  <TagSelector
                    availableTags={tags}
                    selectedTags={clipTags}
                    onTagAdd={async (tagId: string, rating: number) => {
                      if (clip) {
                        await addTagToClip(clip.id, tagId, rating)
                      }
                    }}
                    onTagRemove={async (tagId: string) => {
                      if (clip) {
                        await removeTagFromClip(clip.id, tagId)
                      }
                    }}
                    onCreateTag={createTag}
                  />
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-sm font-medium text-card-foreground mb-2">Metadata</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Video ID: {editedClip.videoId}</p>
                  <p>Created: {new Date(editedClip.createdAt).toLocaleString()}</p>
                  <p>Updated: {new Date(editedClip.updatedAt).toLocaleString()}</p>
                  {editedClip.shareSlug && <p>Share Slug: {editedClip.shareSlug}</p>}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border">
              <div className="flex items-center space-x-2">
                <a
                  href={getYouTubeWatchUrl(editedClip.videoId, editedClip.startTime)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Watch on YouTube
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center px-4 py-2 bg-destructive hover:bg-destructive/90 disabled:opacity-50 text-destructive-foreground text-sm rounded transition-colors"
                >
                  <Trash2 size={16} className="mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-sm rounded transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm rounded transition-colors"
                >
                  <Save size={16} className="mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
