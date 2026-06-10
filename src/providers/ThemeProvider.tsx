import { ReactNode, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/redux/store'
import {
  MODE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  selectMode,
  selectResolvedMode,
  selectTheme,
  setSystemPrefersDark,
} from '@/redux/themeSlice'

/**
 * Owns all theming side effects: applies the active theme + mode to
 * document.body, persists the selection, and tracks the OS color-scheme
 * preference while mode is 'system'. The slice itself stays pure.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const theme = useSelector(selectTheme)
  const mode = useSelector(selectMode)
  const resolvedMode = useSelector(selectResolvedMode)

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    document.body.classList.toggle('dark', resolvedMode === 'dark')
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
      localStorage.setItem(MODE_STORAGE_KEY, mode)
    } catch {
      // localStorage unavailable — theme just won't persist
    }
  }, [theme, mode, resolvedMode])

  useEffect(() => {
    if (mode !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      dispatch(setSystemPrefersDark(event.matches))
    }
    dispatch(setSystemPrefersDark(media.matches))
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [mode, dispatch])

  return <>{children}</>
}
