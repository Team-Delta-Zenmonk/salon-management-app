import { createSlice } from "@reduxjs/toolkit";
import { loginSalonAction } from "./login/login.action";
import { verifySalonAction } from "./verify-salon/verify-salon.action";

export interface Salon {
  id: number;
  uuid: string;
  name?: string;
  email: string;
  owner_name?: string;
  phone?: string;
  latitude?: string;
  longitude?: string;
  address?: string;
  map_link?: string;
  about?: string;
  logo?: string;
  type?: string;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

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
    },
    setsalon(state, { payload }) {
      state.salon = payload;
      state.isAuthenticated = !!payload;
    },
    completeOnboarding(state, { payload }) {
      if (state.salon) {
        state.salon = { ...state.salon, ...payload, is_onboarded: true };
      }
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
