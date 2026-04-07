import { createSlice } from '@reduxjs/toolkit'

export const CONVERSATION_TOUR_COMPLETED_KEY =
  'dare_conversation_tour_completed'

interface ConversationTourState {
  showTour: boolean
}

const initialState: ConversationTourState = {
  showTour: false,
}

const conversationTourSlice = createSlice({
  name: 'conversationTour',
  initialState,
  reducers: {
    openConversationTour(state) {
      state.showTour = true
    },
    closeConversationTour(state) {
      state.showTour = false
      localStorage.setItem(CONVERSATION_TOUR_COMPLETED_KEY, 'true')
    },
  },
})

export const { openConversationTour, closeConversationTour } =
  conversationTourSlice.actions

export default conversationTourSlice.reducer
