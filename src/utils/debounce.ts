import { useEffect, useCallback } from 'react'

/**
 * Custom hook that debounces a callback function
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @param deps - Dependencies array for the callback
 */
export const useDebounce = (
  callback: () => void,
  delay: number,
  deps: React.DependencyList
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCallback = useCallback(callback, deps)

  useEffect(() => {
    const timer = setTimeout(debouncedCallback, delay)
    return () => clearTimeout(timer)
  }, [debouncedCallback, delay])
}
