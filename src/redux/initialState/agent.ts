import { AgentState } from '../types/agent'

export const initialState: AgentState = {
  agents: [],
  selectedAgent: null,
  loading: false,
  error: null,
}
