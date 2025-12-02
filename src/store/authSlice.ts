import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  status: 'idle' | 'checking' | 'authenticated' | 'unauthenticated';
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  status: 'idle',
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.status = 'authenticated';
    },
    setStatus(state, action: PayloadAction<AuthState['status']>) {
      state.status = action.payload;
    },
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.status = 'unauthenticated';
    },
  },
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;
