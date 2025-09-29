import { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../redux/store'
import { addAttachedImage } from '../redux/conversationSlice'

export const useImageDragAndDrop = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++

    // Check if the dragged items contain files
    const hasFiles =
      e.dataTransfer.types && e.dataTransfer.types.includes('Files')
    if (hasFiles) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Keep the drag effect active
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounterRef.current = 0

    const files = e.dataTransfer.files
    if (!files || files.length === 0) {
      // Reset drag state even if no files
      setIsDragging(false)
      dragCounterRef.current = 0
      return
    }

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const preview = event.target?.result as string
          const id = `${Date.now()}-${Math.random()}`
          // Only store serializable data in Redux (no File object)
          dispatch(
            addAttachedImage({
              id,
              preview,
              name: file.name,
              size: file.size,
              type: file.type,
            })
          )
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // Safety effect to reset drag state if it gets stuck
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setIsDragging(false)
      dragCounterRef.current = 0
    }

    const handleGlobalDrop = () => {
      setIsDragging(false)
      dragCounterRef.current = 0
    }

    window.addEventListener('dragend', handleGlobalDragEnd)
    window.addEventListener('drop', handleGlobalDrop)

    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd)
      window.removeEventListener('drop', handleGlobalDrop)
    }
  }, [])

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  }
}
