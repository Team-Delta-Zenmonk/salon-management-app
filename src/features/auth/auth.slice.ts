import { createSlice } from "@reduxjs/toolkit";
import { loginSalonAction } from "./login/login.action";
import { verifySalonAction } from "./verify-salon/verify-salon.action";

export type AuthState = {
  salon: any | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
};

const initialState: AuthState = {
  salon: null,
  isAuthenticated: false,
  isOnboardingComplete: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.salon = null;
      state.isAuthenticated = false;
      state.isOnboardingComplete = false;
    },
    setsalon(state, { payload }) {
      state.salon = payload;
      state.isAuthenticated = !!payload;
      state.isOnboardingComplete = payload?.isOnboardingComplete || false;
    },
    completeOnboarding(state) {
      state.isOnboardingComplete = true;
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
    builder.addCase(verifySalonAction.fulfilled, (state, { payload }) => {
      state.salon = payload.salon;
      state.isAuthenticated = true;
    });
    builder.addCase(verifySalonAction.rejected, (state) => {
      state.isAuthenticated = false;
    });
  },
});

export const { logout, setsalon, completeOnboarding } = authSlice.actions;
export default authSlice.reducer;
