"use client"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { Eye, Trash2, Star } from "lucide-react"
import { TagBadge } from "./tag-components"

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

export const ClipHoverEffect = ({
  clips,
  clipTags,
  className,
  onViewClip,
  onDeleteClip,
}: {
  clips: Clip[]
  clipTags: Record<string, ClipTag[]>
  className?: string
  onViewClip?: (clip: Clip) => void
  onDeleteClip?: (clipId: string) => void
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-10",
        className
      )}
    >
      {clips.map((clip, idx) => (
        <div
          key={clip.id}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <ClipCard 
            clip={clip} 
            clipTags={clipTags[clip.id] || []}
            onViewClip={onViewClip} 
            onDeleteClip={onDeleteClip} 
          />
        </div>
      ))}
    </div>
  )
}

export const ClipCard = ({
  clip,
  clipTags,
  className,
  onViewClip,
  onDeleteClip,
}: {
  clip: Clip
  clipTags: ClipTag[]
  className?: string
  onViewClip?: (clip: Clip) => void
  onDeleteClip?: (clipId: string) => void
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getYouTubeEmbedUrl = (videoId: string, startTime: number, endTime: number) => {
    return `https://www.youtube.com/embed/${videoId}?start=${Math.floor(startTime)}&end=${Math.floor(endTime)}&autoplay=1`
  }

  const getYouTubeWatchUrl = (videoId: string, startTime: number) => {
    return `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(startTime)}s`
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onDeleteClip || isDeleting) return

    if (confirm('Are you sure you want to delete this clip?')) {
      setIsDeleting(true)
      try {
        const response = await fetch(`/api/clips/${clip.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete clip')
        }

        onDeleteClip(clip.id)
      } catch (error) {
        console.error('Error deleting clip:', error)
        alert('Failed to delete clip. Please try again.')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full overflow-hidden bg-black border border-transparent dark:border-white/[0.2] group-hover:border-slate-700 relative z-20",
        className
      )}
    >
      <div className="relative z-50">
        {/* Video Player or Thumbnail */}
        <div className="relative aspect-video bg-gray-900">
          {isPlaying ? (
            <iframe
              src={getYouTubeEmbedUrl(clip.videoId, clip.startTime, clip.endTime)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              className="relative w-full h-full cursor-pointer group"
              onClick={() => setIsPlaying(true)}
            >
              <img
                src={clip.thumbnail}
                alt={clip.title}
                className="w-full h-full object-cover"
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <motion.div
                  className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="w-8 h-8 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              </div>
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {formatTime(clip.endTime - clip.startTime)}
              </div>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4">
          <ClipTitle>{clip.title}</ClipTitle>
          
          {/* Tags */}
          {clipTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {clipTags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  rating={tag.rating}
                  variant="secondary"
                  showRating={true}
                  className="text-xs"
                />
              ))}
            </div>
          )}
          
          <ClipDuration>
            {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
          </ClipDuration>
          <ClipMetadata>
            Created: {new Date(clip.createdAt).toLocaleDateString()}
            {clip.isPublic && (
              <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                Public
              </span>
            )}
          </ClipMetadata>
          
          {/* Action Buttons */}
          <div className="mt-4 flex gap-2 items-center">
            <motion.a
              href={getYouTubeWatchUrl(clip.videoId, clip.startTime)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Watch on YouTube
            </motion.a>
            
            {onViewClip && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  onViewClip(clip)
                }}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="View/Edit Clip"
              >
                <Eye size={16} />
              </motion.button>
            )}
            
            {onDeleteClip && (
              <motion.button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Delete Clip"
              >
                <Trash2 size={16} />
              </motion.button>
            )}
            
            {clip.shareSlug && (
              <motion.button
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/share/${clip.shareSlug}`)
                }}
              >
                Copy Share Link
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const ClipTitle = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <h4 className={cn("text-zinc-100 font-bold tracking-wide text-lg overflow-hidden", className)}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
        }}>
      {children}
    </h4>
  )
}

export const ClipDuration = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <p
      className={cn(
        "mt-2 text-zinc-300 font-medium tracking-wide text-sm",
        className
      )}
    >
      {children}
    </p>
  )
}

export const ClipMetadata = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <p
      className={cn(
        "mt-2 text-zinc-400 tracking-wide text-xs flex items-center",
        className
      )}
    >
      {children}
    </p>
  )
}
