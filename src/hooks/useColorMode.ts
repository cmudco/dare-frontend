import { useEffect, useState } from 'react'

type ColorMode = 'light' | 'dark'

/**
 * Observes the `dark` class on <html> (set by themeSlice) and returns
 * the matching color mode string. Keeps @uiw/react-md-editor and any
 * other color-mode-aware libraries in sync with the app theme.
 */
export function useColorMode(): ColorMode {
  const [colorMode, setColorMode] = useState<ColorMode>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setColorMode(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      )
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return colorMode
}
