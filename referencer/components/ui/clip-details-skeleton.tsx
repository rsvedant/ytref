"use client"
import { motion } from "framer-motion"

export const ClipDetailsSkeleton = () => {
  return (
    <motion.div
      className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="h-6 bg-muted rounded animate-pulse w-24"></div>
        <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Video Preview Skeleton */}
        <div className="aspect-video bg-muted rounded-lg animate-pulse"></div>

        {/* Form Fields Skeleton */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <div className="h-4 bg-muted rounded w-12 mb-2 animate-pulse"></div>
            <div className="h-10 bg-muted rounded-lg animate-pulse"></div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <div className="h-4 bg-muted rounded w-20 mb-2 animate-pulse"></div>
            <div className="h-10 bg-muted rounded-lg animate-pulse"></div>
          </div>

          {/* Time inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="h-4 bg-muted rounded w-16 mb-2 animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <div className="h-10 bg-muted rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-2 animate-pulse"></div>
                <div className="h-10 bg-muted rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div>
              <div className="h-4 bg-muted rounded w-16 mb-2 animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <div className="h-10 bg-muted rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-2 animate-pulse"></div>
                <div className="h-10 bg-muted rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="h-4 bg-muted-foreground/20 rounded w-16 mb-2 animate-pulse"></div>
          <div className="space-y-1">
            <div className="h-3 bg-muted-foreground/20 rounded w-32 animate-pulse"></div>
            <div className="h-3 bg-muted-foreground/20 rounded w-28 animate-pulse"></div>
            <div className="h-3 bg-muted-foreground/20 rounded w-24 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className="h-9 bg-muted rounded w-32 animate-pulse"></div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="h-9 bg-muted rounded w-20 animate-pulse"></div>
          <div className="h-9 bg-muted rounded w-16 animate-pulse"></div>
          <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
        </div>
      </div>
    </motion.div>
  )
}
