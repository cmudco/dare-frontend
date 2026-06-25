import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Encapsulates the local-state-with-debounced-sync pattern used by node config
 * components. Keeps a local copy of a string field, syncs it back to Redux
 * after `delay` ms of inactivity.
 *
 * Hardened so an in-progress edit is never clobbered: while the user is typing
 * (a debounced commit is pending), external value changes (e.g. an autosave
 * round-trip replacing the node) are ignored instead of overwriting the field.
 */
export function useDebouncedNodeField(
  currentValue: string,
  onUpdate: (value: string) => void,
  delay = 300
): [string, (value: string) => void] {
  const [localValue, setLocalValue] = useState(currentValue)

  // Track whether the user has an uncommitted edit pending.
  const dirtyRef = useRef(false)
  // Keep the latest onUpdate without making it a dependency of the debounce
  // effect (an inline callback would otherwise reset the timer every render and
  // could prevent the commit from ever firing).
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  // Sync from external (Redux) → local, but only when there's no pending local
  // edit — otherwise an autosave reload would wipe what the user is typing.
  useEffect(() => {
    if (!dirtyRef.current) {
      setLocalValue(currentValue)
    }
  }, [currentValue])

  // Debounced sync from local → external.
  useEffect(() => {
    if (localValue === currentValue) {
      dirtyRef.current = false
      return
    }
    dirtyRef.current = true
    const timeoutId = setTimeout(() => {
      onUpdateRef.current(localValue)
      dirtyRef.current = false
    }, delay)
    return () => clearTimeout(timeoutId)
  }, [localValue, currentValue, delay])

  // Stable setter to avoid unnecessary re-renders in consumers
  const setValue = useCallback((value: string) => {
    setLocalValue(value)
  }, [])

  return [localValue, setValue]
}
