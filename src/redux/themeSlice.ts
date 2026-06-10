import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

export const THEME_NAMES = [
  'default',
  'amber-minimal',
  'amethyst-haze',
  'bold-tech',
  'bubblegum',
  'caffeine',
  'cyberpunk',
  'ember',
  'midnight',
  'mono',
  'ocean-breeze',
  'rose',
  'sunset-horizon',
  't3-chat',
  'twitter',
] as const

export type ThemeName = (typeof THEME_NAMES)[number]
export type ThemeMode = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'dare-theme-name'
export const MODE_STORAGE_KEY = 'dare-theme-mode'
const LEGACY_STORAGE_KEY = 'dare-theme'

interface ThemeState {
  theme: ThemeName
  mode: ThemeMode
  /* Mirrors the matchMedia('(prefers-color-scheme: dark)') result so that
     'system' mode resolves reactively; kept in sync by ThemeProvider. */
  systemPrefersDark: boolean
}

const isThemeName = (value: string | null): value is ThemeName =>
  THEME_NAMES.includes(value as ThemeName)

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system'

const systemPrefersDark = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches

const loadInitialState = (): ThemeState => {
  let theme: ThemeName = 'default'
  let mode: ThemeMode = 'light'
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    const storedMode = localStorage.getItem(MODE_STORAGE_KEY)
    // Migration: the pre-multi-theme implementation stored 'light' | 'dark'
    // under 'dare-theme' — honor it so existing users keep their preference.
    const legacyMode = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (isThemeName(storedTheme)) theme = storedTheme
    if (isThemeMode(storedMode)) mode = storedMode
    else if (isThemeMode(legacyMode)) mode = legacyMode
  } catch {
    // localStorage unavailable — fall back to defaults
  }
  return { theme, mode, systemPrefersDark: systemPrefersDark() }
}

const resolve = (state: ThemeState): 'light' | 'dark' =>
  state.mode === 'system'
    ? state.systemPrefersDark
      ? 'dark'
      : 'light'
    : state.mode

const themeSlice = createSlice({
  name: 'theme',
  initialState: loadInitialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeName>) => {
      state.theme = action.payload
    },
    setMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
    },
    toggleMode: (state) => {
      state.mode = resolve(state) === 'dark' ? 'light' : 'dark'
    },
    setSystemPrefersDark: (state, action: PayloadAction<boolean>) => {
      state.systemPrefersDark = action.payload
    },
  },
})

export const { setTheme, setMode, toggleMode, setSystemPrefersDark } =
  themeSlice.actions

export const selectTheme = (state: RootState): ThemeName => state.theme.theme
export const selectMode = (state: RootState): ThemeMode => state.theme.mode
export const selectResolvedMode = (state: RootState): 'light' | 'dark' =>
  resolve(state.theme)

export default themeSlice.reducer
