import { createSlice } from "@reduxjs/toolkit";
import { loginSalonAction } from "./login/login.action";
import { verifySalonAction } from "./verify-salon/verify-salon.action";
import { getSalonProfileAction } from "./profile/get-salon-profile/getSalonProfile.action";
import type { SalonType } from "@/common/enums/salon-type.enum";
import type { SubscriptionPlan } from "@/common/enums/subscription-plan.enum";
import type { SubscriptionStatus } from "@/common/enums/subscription-status.enum";

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
  type?: SalonType;
  slug?: string;
  is_active?: boolean;
  trial_ends_at?: string;
  subscription_plan?: SubscriptionPlan;
  subscription_status?: SubscriptionStatus;
  subscription_expires_at?: string;
  is_onboarded: boolean;
  stripe_account_id?: string;
  photos?: any[];
  business_hours?: Record<string, any>;
  allowed_payment_policies?: string[];
  deposit_percentage?: number | null;
  storefront_theme_id?: number;
  storefrontTheme?: {
    id?: number;
    uuid?: string;
    code?: string;
    name?: string;
    preview_image?: string;
    preview_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export type AuthState = {
  salon: Salon | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  isLoadingProfile: boolean;
};

const initialState: AuthState = {
  salon: null,
  isAuthenticated: false,
  isOnboardingComplete: false,
  isLoadingProfile: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.salon = null;
      state.isAuthenticated = false;
      state.isLoadingProfile = false;
    },
    setsalon(state, { payload }) {
      state.salon = payload;
      state.isAuthenticated = !!payload;
      state.isLoadingProfile = false;
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
    builder.addCase(getSalonProfileAction.pending, (state) => {
      state.isLoadingProfile = true;
    });
    builder.addCase(getSalonProfileAction.fulfilled, (state, { payload }) => {
      state.salon = payload;
      state.isLoadingProfile = false;
    });
    builder.addCase(getSalonProfileAction.rejected, (state) => {
      state.isLoadingProfile = false;
    });
    builder.addMatcher(
      (action) => action.type === "persist/REHYDRATE",
      (state) => {
        state.isLoadingProfile = false;
      }
    );
  },
});

export const { logout, setsalon, completeOnboarding } = authSlice.actions;
export default authSlice.reducer;
