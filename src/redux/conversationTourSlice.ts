import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const CONVERSATION_TOUR_COMPLETED_KEY =
  'dare_conversation_tour_completed'

export const TOUR_COMPLETED_PREFIX = 'dare_tour_completed_'

/** Known tour page keys — used for localStorage and step lookup */
export type TourPageKey =
  | 'conversation'
  | 'dashboard'
  | 'files'
  | 'prompts'
  | 'workflows'
  | 'agents'
  | 'settings'
  | 'help'
  | 'billing'

interface ConversationTourState {
  showTour: boolean
  /** Which page the tour is currently running for */
  activePage: TourPageKey | null
}

const initialState: ConversationTourState = {
  showTour: false,
  activePage: null,
}

const conversationTourSlice = createSlice({
  name: 'conversationTour',
  initialState,
  reducers: {
    /** Legacy — opens the conversation tour specifically */
    openConversationTour(state) {
      state.showTour = true
      state.activePage = 'conversation'
    },
    /** Generic — opens the tour for any page */
    openPageTour(state, action: PayloadAction<TourPageKey>) {
      state.showTour = true
      state.activePage = action.payload
    },
    closeConversationTour(state) {
      const page = state.activePage
      state.showTour = false
      state.activePage = null
      // Mark completed in localStorage
      if (page === 'conversation') {
        localStorage.setItem(CONVERSATION_TOUR_COMPLETED_KEY, 'true')
      }
      if (page) {
        localStorage.setItem(`${TOUR_COMPLETED_PREFIX}${page}`, 'true')
      }
    },
  },
})

export const { openConversationTour, openPageTour, closeConversationTour } =
  conversationTourSlice.actions

export default conversationTourSlice.reducer
