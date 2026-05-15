import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

const TOKEN_KEY = 'vt_token';
const USER_KEY = 'vt_user';

const readInitial = (): AuthState => {
  try {
    return {
      token: localStorage.getItem(TOKEN_KEY),
      user: JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'),
    };
  } catch {
    return { token: null, user: null };
  }
};

const slice = createSlice({
  name: 'auth',
  initialState: readInitial(),
  reducers: {
    setCredentials: (
      state,
      { payload }: PayloadAction<{ user: AuthUser; token: string }>,
    ) => {
      state.user = payload.user;
      state.token = payload.token;
      localStorage.setItem(TOKEN_KEY, payload.token);
      localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, clearCredentials } = slice.actions;
export default slice.reducer;
