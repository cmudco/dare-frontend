import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ThemeState {
  isDarkMode: boolean
}

const initialState: ThemeState = {
  isDarkMode: localStorage.getItem('dare-theme') === 'dark',
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode
      localStorage.setItem('dare-theme', state.isDarkMode ? 'dark' : 'light')

      // Apply theme to document
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload
      localStorage.setItem('dare-theme', state.isDarkMode ? 'dark' : 'light')

      // Apply theme to document
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    initializeTheme: (state) => {
      const savedTheme = localStorage.getItem('dare-theme')
      if (savedTheme) {
        state.isDarkMode = savedTheme === 'dark'
      } else {
        state.isDarkMode = false
      }
      // Apply theme to document
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
  },
})

export const { toggleDarkMode, setDarkMode, initializeTheme } =
  themeSlice.actions
export default themeSlice.reducer
