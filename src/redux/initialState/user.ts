import { UserState } from "../types/user";

export const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  firebaseUid: "",
  temp_token: "",
  token: "",
  userLoading: true,
};
