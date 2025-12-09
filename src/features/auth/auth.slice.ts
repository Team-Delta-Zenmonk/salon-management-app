import { createSlice } from "@reduxjs/toolkit";
import { loginSalonAction } from "./login/login.action";

export type AuthState = {
  salon: any | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  salon: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.salon = null;
      state.isAuthenticated = false;
    },
    setsalon(state, { payload }) {
      state.salon = payload;
      state.isAuthenticated = !!payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginSalonAction.fulfilled, (state, { payload }) => {
      state.salon = payload.salon;
      state.isAuthenticated = true;
    });
    builder.addCase(loginSalonAction.rejected, (state) => {
      state.isAuthenticated = false;
    });
  },
});

export const { logout, setsalon } = authSlice.actions;
export default authSlice.reducer;
