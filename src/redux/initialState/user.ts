import { UserState } from "../types/user";

export const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  firebaseUid: "",
  temp_token: "",
  token: "",
};
