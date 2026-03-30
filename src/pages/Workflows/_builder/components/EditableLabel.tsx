import { useState, useRef, useEffect, useCallback } from 'react'

interface EditableLabelProps {
  value: string
  onChange: (newValue: string) => void
  placeholder?: string
}

export function EditableLabel({
  value,
  onChange,
  placeholder = 'Name this node',
}: EditableLabelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync draft when value changes externally
  useEffect(() => {
    if (!isEditing) {
      setDraft(value)
    }
  }, [value, isEditing])

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const commit = useCallback(() => {
    setIsEditing(false)
    const trimmed = draft.trim()
    if (trimmed !== value) {
      onChange(trimmed)
    } else {
      setDraft(value)
    }
  }, [draft, value, onChange])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        commit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setDraft(value)
        setIsEditing(false)
      }
    },
    [commit, value]
  )

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        className='editable-label-input node-title'
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  return (
    <div className='editable-label node-title' onClick={handleClick}>
      {value || (
        <span className='editable-label-placeholder'>{placeholder}</span>
      )}
    </div>
  )
}
