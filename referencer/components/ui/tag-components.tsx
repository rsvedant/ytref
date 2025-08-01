"use client"
import React, { useState } from 'react'
import { X, Plus, Star, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface Tag {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface ClipTag {
  id: string
  name: string
  rating: number
}

// Simple Input Component
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
)

// Simple Badge Component
const Badge = ({ 
  children, 
  variant = 'default', 
  className,
  ...props 
}: {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'outline'
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) => {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
  const variantStyles = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80", 
    outline: "text-foreground border-border"
  }
  
  return (
    <div 
      className={cn(baseStyles, variantStyles[variant], className)} 
      {...props}
    >
      {children}
    </div>
  )
}

// Tag Badge Component
export const TagBadge = ({ 
  tag, 
  rating, 
  onRemove, 
  showRating = true,
  variant = 'default',
  onClick,
  className
}: {
  tag: { id: string; name: string }
  rating?: number
  onRemove?: () => void
  showRating?: boolean
  variant?: 'default' | 'secondary' | 'outline'
  onClick?: () => void
  className?: string
}) => (
  <Badge 
    variant={variant}
    className={cn(
      "flex items-center gap-1 px-2 py-1",
      onRemove && "pr-1",
      onClick && "cursor-pointer hover:opacity-80",
      className
    )}
    onClick={onClick}
  >
    <span>{tag.name}</span>
    {showRating && rating !== undefined && (
      <div className="flex items-center gap-0.5">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        <span className="text-xs">{rating}</span>
      </div>
    )}
    {onRemove && (
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        <X className="w-3 h-3" />
      </Button>
    )}
  </Badge>
)

// Tag Manager Component
export const TagManager = ({
  tags,
  onUpdateTag,
  onDeleteTag,
  onCreateTag,
  className
}: {
  tags: Tag[]
  onUpdateTag: (id: string, name: string) => Promise<boolean>
  onDeleteTag: (id: string) => Promise<boolean>
  onCreateTag: (name: string) => Promise<Tag | null>
  className?: string
}) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const handleStartEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setEditingName(tag.name)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return
    
    setLoading(editingId)
    try {
      const success = await onUpdateTag(editingId, editingName.trim())
      if (success) {
        setEditingId(null)
        setEditingName('')
      }
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(id)
    try {
      await onDeleteTag(id)
    } finally {
      setLoading(null)
    }
  }

  const handleCreate = async () => {
    if (!newTagName.trim()) return
    
    setLoading('create')
    try {
      const newTag = await onCreateTag(newTagName.trim())
      if (newTag) {
        setNewTagName('')
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-2">
        <Input
          placeholder="Create new tag..."
          value={newTagName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTagName(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleCreate()}
          className="flex-1"
        />
        <Button
          onClick={handleCreate}
          disabled={!newTagName.trim() || loading === 'create'}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create
        </Button>
      </div>

      <div className="space-y-2">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card"
          >
            {editingId === tag.id ? (
              <>
                <Input
                  value={editingName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingName(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') handleSaveEdit()
                    if (e.key === 'Escape') {
                      setEditingId(null)
                      setEditingName('')
                    }
                  }}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editingName.trim() || loading === tag.id}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null)
                    setEditingName('')
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 font-medium">{tag.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleStartEdit(tag)}
                  disabled={loading === tag.id}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(tag.id)}
                  disabled={loading === tag.id}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No tags yet. Create your first tag above!</p>
        </div>
      )}
    </div>
  )
}

// Tag Filter Component
export const TagFilter = ({
  tags,
  selectedTags,
  onTagToggle,
  minRating,
  onMinRatingChange,
  className
}: {
  tags: Tag[]
  selectedTags: string[]
  onTagToggle: (tagId: string) => void
  minRating: number
  onMinRatingChange: (rating: number) => void
  className?: string
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Filter by Tags</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
              showRating={false}
              onClick={() => onTagToggle(tag.id)}
              className="cursor-pointer hover:opacity-80"
            />
          ))}
        </div>
        {tags.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No tags available. Create tags first to filter clips.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Minimum Rating</h4>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <Select
            value={minRating.toString()}
            onValueChange={(value) => onMinRatingChange(Number(value))}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">and above</span>
        </div>
      </div>
    </div>
  )
}

// Compact Tag Filter Select Component
export const TagFilterSelect = ({
  tags,
  selectedTags,
  onTagToggle,
  className
}: {
  tags: Tag[]
  selectedTags: string[]
  onTagToggle: (tagId: string) => void
  className?: string
}) => {
  const selectedTagNames = tags
    .filter(tag => selectedTags.includes(tag.id))
    .map(tag => tag.name)
    .join(', ')

  return (
    <Select
      value=""
      onValueChange={(tagId) => {
        if (tagId) onTagToggle(tagId)
      }}
    >
      <SelectTrigger className={cn("w-48", className)}>
        <SelectValue 
          placeholder={
            selectedTags.length > 0 
              ? `${selectedTags.length} tag${selectedTags.length === 1 ? '' : 's'} selected`
              : "Filter by tags..."
          } 
        />
      </SelectTrigger>
      <SelectContent>
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id)
          return (
            <SelectItem 
              key={tag.id} 
              value={tag.id}
              className={cn(
                "flex items-center justify-between",
                isSelected && "bg-accent"
              )}
            >
              <span className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 border rounded",
                  isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                )}>
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center text-primary-foreground text-xs">
                      ✓
                    </div>
                  )}
                </div>
                {tag.name}
              </span>
            </SelectItem>
          )
        })}
        {tags.length === 0 && (
          <SelectItem value="no-tags" disabled>
            No tags available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}

// Compact Rating Filter Select Component
export const RatingFilterSelect = ({
  minRating,
  onMinRatingChange,
  className
}: {
  minRating: number
  onMinRatingChange: (rating: number) => void
  className?: string
}) => {
  return (
    <Select
      value={minRating.toString()}
      onValueChange={(value) => onMinRatingChange(Number(value))}
    >
      <SelectTrigger className={cn("w-32", className)}>
        <SelectValue>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{minRating}+ stars</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>1+ stars</span>
          </div>
        </SelectItem>
        <SelectItem value="2">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>2+ stars</span>
          </div>
        </SelectItem>
        <SelectItem value="3">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>3+ stars</span>
          </div>
        </SelectItem>
        <SelectItem value="4">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>4+ stars</span>
          </div>
        </SelectItem>
        <SelectItem value="5">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>5 stars</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

// Compact Tag Manager Select Component  
export const TagManagerSelect = ({
  tags,
  onUpdateTag,
  onDeleteTag,
  onCreateTag,
  className
}: {
  tags: Tag[]
  onUpdateTag: (id: string, name: string) => Promise<boolean>
  onDeleteTag: (id: string) => Promise<boolean>
  onCreateTag: (name: string) => Promise<Tag | null>
  className?: string
}) => {
  const [selectedAction, setSelectedAction] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAction = (value: string) => {
    if (value === 'create') {
      setIsCreating(true)
      setNewTagName('')
    } else if (value.startsWith('edit:')) {
      const tagId = value.replace('edit:', '')
      const tag = tags.find(t => t.id === tagId)
      if (tag) {
        setIsEditing(tagId)
        setEditingName(tag.name)
      }
    } else if (value.startsWith('delete:')) {
      const tagId = value.replace('delete:', '')
      handleDelete(tagId)
    }
    setSelectedAction('')
  }

  const handleCreate = async () => {
    if (!newTagName.trim()) return
    
    setLoading(true)
    try {
      await onCreateTag(newTagName.trim())
      setIsCreating(false)
      setNewTagName('')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!isEditing || !editingName.trim()) return
    
    setLoading(true)
    try {
      await onUpdateTag(isEditing, editingName.trim())
      setIsEditing(null)
      setEditingName('')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await onDeleteTag(id)
    } finally {
      setLoading(false)
    }
  }

  if (isCreating) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Input
          placeholder="Tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          className="w-48"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate()
            if (e.key === 'Escape') setIsCreating(false)
          }}
        />
        <Button size="sm" onClick={handleCreate} disabled={!newTagName.trim() || loading}>
          Add
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
          Cancel
        </Button>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Input
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          className="w-48"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEdit()
            if (e.key === 'Escape') setIsEditing(null)
          }}
        />
        <Button size="sm" onClick={handleEdit} disabled={!editingName.trim() || loading}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(null)}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Select value={selectedAction} onValueChange={handleAction}>
      <SelectTrigger className={cn("w-48", className)}>
        <SelectValue placeholder="Manage tags..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="create">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create new tag
          </div>
        </SelectItem>
        {tags.length > 0 && (
          <>
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Edit Tags
            </div>
            {tags.map((tag) => (
              <div key={tag.id}>
                <SelectItem value={`edit:${tag.id}`}>
                  <div className="flex items-center gap-2">
                    <Edit2 className="w-3 h-3" />
                    Edit "{tag.name}"
                  </div>
                </SelectItem>
                <SelectItem value={`delete:${tag.id}`} className="text-destructive">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-3 h-3" />
                    Delete "{tag.name}"
                  </div>
                </SelectItem>
              </div>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  )
}

// Tag Selector Component for clip modal
export const TagSelector = ({
  availableTags,
  selectedTags,
  onTagAdd,
  onTagRemove,
  onCreateTag,
  className
}: {
  availableTags: Tag[]
  selectedTags: ClipTag[]
  onTagAdd: (tagId: string, rating: number) => Promise<void>
  onTagRemove: (tagId: string) => Promise<void>
  onCreateTag?: (name: string) => Promise<Tag | null>
  className?: string
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedTagId, setSelectedTagId] = useState('')
  const [rating, setRating] = useState(3)
  const [loading, setLoading] = useState(false)

  const selectedTagIds = selectedTags.map(t => t.id)
  const unselectedTags = availableTags.filter(tag => !selectedTagIds.includes(tag.id))

  const handleAddTag = async () => {
    if (!selectedTagId) return
    
    setLoading(true)
    try {
      await onTagAdd(selectedTagId, rating)
      setSelectedTagId('')
      setRating(3)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAndAdd = async () => {
    if (!newTagName.trim() || !onCreateTag) return
    
    setLoading(true)
    try {
      const newTag = await onCreateTag(newTagName.trim())
      if (newTag) {
        await onTagAdd(newTag.id, rating)
        setNewTagName('')
        setRating(3)
        setIsAdding(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                rating={tag.rating}
                onRemove={() => onTagRemove(tag.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Tag Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Add Tags</h4>
          {onCreateTag && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="h-7 px-2"
            >
              <Plus className="w-3 h-3 mr-1" />
              New
            </Button>
          )}
        </div>

        {/* Create New Tag */}
        {isAdding && onCreateTag && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTagName(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <Select
                value={rating.toString()}
                onValueChange={(value) => setRating(Number(value))}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              onClick={handleCreateAndAdd}
              disabled={!newTagName.trim() || loading}
              className="h-8"
            >
              Add
            </Button>
          </div>
        )}

        {/* Select Existing Tag */}
        {unselectedTags.length > 0 && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Select
                value={selectedTagId}
                onValueChange={setSelectedTagId}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select a tag..." />
                </SelectTrigger>
                <SelectContent>
                  {unselectedTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <Select
                value={rating.toString()}
                onValueChange={(value) => setRating(Number(value))}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              onClick={handleAddTag}
              disabled={!selectedTagId || loading}
              className="h-8"
            >
              Add
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
