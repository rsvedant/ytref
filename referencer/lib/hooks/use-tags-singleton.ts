import { useState, useEffect, useCallback } from 'react'

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

// Global state for tags to prevent multiple API calls
let globalTags: Tag[] = []
let globalLoading = false
let globalError: string | null = null
let globalHasInitialized = false
let globalListeners: Set<() => void> = new Set()

const notifyListeners = () => {
  globalListeners.forEach(listener => listener())
}

const fetchTagsGlobal = async () => {
  if (globalLoading || globalHasInitialized) return
  
  globalLoading = true
  globalError = null
  notifyListeners()
  
  try {
    const response = await fetch('/api/tags')
    if (!response.ok) {
      throw new Error('Failed to fetch tags')
    }
    const data = await response.json()
    globalTags = data.tags
    globalHasInitialized = true
  } catch (err) {
    globalError = err instanceof Error ? err.message : 'Failed to fetch tags'
  } finally {
    globalLoading = false
    notifyListeners()
  }
}

export const useTagsSingleton = () => {
  const [, forceUpdate] = useState(0)
  
  const rerender = useCallback(() => {
    forceUpdate(prev => prev + 1)
  }, [])
  
  useEffect(() => {
    globalListeners.add(rerender)
    
    // Initialize tags if not already done
    if (!globalHasInitialized && !globalLoading) {
      fetchTagsGlobal()
    }
    
    return () => {
      globalListeners.delete(rerender)
    }
  }, [rerender])

  // Create a new tag
  const createTag = useCallback(async (name: string): Promise<Tag | null> => {
    globalError = null
    notifyListeners()
    
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create tag')
      }
      
      const newTag = await response.json()
      globalTags = [...globalTags, newTag]
      notifyListeners()
      return newTag
    } catch (err) {
      globalError = err instanceof Error ? err.message : 'Failed to create tag'
      notifyListeners()
      return null
    }
  }, [])

  // Update a tag
  const updateTag = useCallback(async (id: string, name: string): Promise<boolean> => {
    globalError = null
    notifyListeners()
    
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update tag')
      }
      
      const { tag: updatedTag } = await response.json()
      globalTags = globalTags.map(tag => tag.id === id ? updatedTag : tag)
      notifyListeners()
      return true
    } catch (err) {
      globalError = err instanceof Error ? err.message : 'Failed to update tag'
      notifyListeners()
      return false
    }
  }, [])

  // Delete a tag
  const deleteTag = useCallback(async (id: string): Promise<boolean> => {
    globalError = null
    notifyListeners()
    
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete tag')
      }
      
      globalTags = globalTags.filter(tag => tag.id !== id)
      notifyListeners()
      return true
    } catch (err) {
      globalError = err instanceof Error ? err.message : 'Failed to delete tag'
      notifyListeners()
      return false
    }
  }, [])

  return {
    tags: globalTags,
    loading: globalLoading,
    error: globalError,
    createTag,
    updateTag,
    deleteTag,
  }
}
