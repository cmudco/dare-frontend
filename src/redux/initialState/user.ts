import { UserState } from '../types/user'

export const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  temp_token: '',
  token: '',
  userLoading: true,
  successMessage: null,
  stats: null,
  chunkSettings: null,
}
