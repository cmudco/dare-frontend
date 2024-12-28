export interface User {
  username: string;
  email: string;

}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  firebaseUid?: string;
  temp_token: string;
  token:  string;
  userLoading: boolean;
}