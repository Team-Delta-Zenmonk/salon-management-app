import { createSlice } from "@reduxjs/toolkit";
import { listStaffAction } from "./list-staff/list-staff.action";
import { updateStaffAction } from "./update-staff/update-staff.action";
import type { CloudinaryFile } from "../../common/cloudinary.schema";

export type StaffAddress = Record<string, any>;
export interface StaffEmergencyContact {
  name: string;
  phone: string;
}
export type StaffActiveHours = Record<string, any>;
export interface Staff {
  id: number;
  uuid: string;
  first_name: string;
  last_name?: string | null;
  email: string;
  photos: CloudinaryFile;
  phone_number: string;
  additional_phone_number?: string | null;
  dob: string;
  title: string;
  joining_date: string;
  end_date?: string | null;
  address: string;
  emergency_contact: StaffEmergencyContact;
  gender: string;
  active_hours?: StaffActiveHours | null;
  created_at: string;
  updated_at: string;
}
export interface StaffState {
  data: Staff[];
  total: number;
  page: number;
  limit: number;
}

const initialState: StaffState = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
};

export const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    resetStaff(state) {
      state.data = [];
      state.total = 0;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listStaffAction.fulfilled, (state, action) => {
      const { data, total, page, limit } = action.payload;

      if (page === 1) {
        state.data = data;
      } else {
        state.data = [...state.data, ...data];
      }

      state.total = total;
      state.page = page;
      state.limit = limit;
    });

    builder.addCase(updateStaffAction.fulfilled, (state, { payload }) => {
      const index = state.data.findIndex((s) => s.uuid === payload.uuid);
      if (index !== -1) {
        state.data[index] = {
          ...state.data[index],
          ...payload.body,
        };
      }
    });
  },
});

export const { resetStaff } = staffSlice.actions;
export default staffSlice.reducer;
