import { createSlice } from "@reduxjs/toolkit";
import type { ServiceGender } from "../../common/enums/service-gender.enum";
import { listStaffAction } from "./list-staff/list-staff.action";
import { updateStaffAction } from "./update-staff/update-staff.action";
import type { CloudinaryFile } from "../../common/cloudinary.schema";

export type StaffAddress = Record<string, any>;
export type StaffEmergencyContact = Record<string, any>;
export type StaffActiveHours = Record<string, any>;

export interface Staff {
  id: number;
  uuid: string;
  first_name: string;
  last_name?: string | null;
  email: string;
  photos: string;
  phone_number: string;
  additional_phone_number?: string | null;
  dob: string;
  title: string;
  joining_date: string;
  end_date?: string | null;
  address: string;
  emergency_contact: StaffEmergencyContact;
  gender: ServiceGender;
  active_hours?: StaffActiveHours | null;
  created_at: string;
  updated_at: string;
}

export interface StaffState {
  staffs: Staff[];
}

const initialState: StaffState = {
  staffs: [],
};

export const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    clearStaff(state) {
      state.staffs = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listStaffAction.fulfilled, (state, { payload }) => {
      state.staffs = Array.isArray(payload) ? payload : [];
    });
    builder.addCase(updateStaffAction.fulfilled, (state, { payload }) => {
      const index = state.staffs.findIndex((s) => s.uuid === payload.uuid);
      if (index !== -1) {
        state.staffs[index] = { ...state.staffs[index], ...payload.body };
      }
    });
  },
});

export const { clearStaff } = staffSlice.actions;
export default staffSlice.reducer;
