import { axiosInstance } from "../../../config/axios";
import type { Gender } from "../../../common/enums/gender.enum";
import type { StaffActiveHours, StaffEmergencyContact } from "../staff.slice";

export interface CreateStaffPayload {
  first_name: string;
  last_name?: string;
  email: string;
  phone_number: string;
  additional_phone_number?: string | null;
  dob: string;
  title: string;
  joining_date: string;
  end_date?: string | null;
  address: string;
  photos?: string;
  emergency_contact: StaffEmergencyContact;
  gender: Gender;
  active_hours?: StaffActiveHours | null;
}

export const createStaffService = async (payload: CreateStaffPayload) => {
  const res = await axiosInstance.post("/salons/staffs", payload);
  return res.data;
};
