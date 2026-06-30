import { useState, useEffect, useCallback } from 'react'

/**
 * Encapsulates the local-state-with-debounced-sync pattern used by node config
 * components. Keeps a local copy of a string field, syncs it back to Redux
 * after `delay` ms of inactivity.
 */
export function useDebouncedNodeField(
  currentValue: string,
  onUpdate: (value: string) => void,
  delay = 300
): [string, (value: string) => void] {
  const [localValue, setLocalValue] = useState(currentValue)

  // Sync from external (Redux) → local when the external value changes
  useEffect(() => {
    setLocalValue(currentValue)
  }, [currentValue])

  // Debounced sync from local → external
  useEffect(() => {
    if (localValue === currentValue) return

    const timeoutId = setTimeout(() => {
      onUpdate(localValue)
    }, delay)
    return () => clearTimeout(timeoutId)
  }, [localValue, currentValue, onUpdate, delay])

  // Stable setter to avoid unnecessary re-renders in consumers
  const setValue = useCallback((value: string) => {
    setLocalValue(value)
  }, [])

  return [localValue, setValue]
}
