import { DaysList, type DayKey } from "../../../../../../common/enums/days.enum";
import type { Gender } from "../../../../../../common/enums/gender.enum";
import type { Staff } from "../../../../../../features/staff/staff.slice";
import type { StaffForm } from "../../../schema/staff.schema";

export const getDefaultActiveHours = (): Record<DayKey, { start_time: string; end_time: string } | null> => {
  const obj = {} as Record<DayKey, { start_time: string; end_time: string } | null>;
  for (const d of DaysList) obj[d] = { start_time: "09:00", end_time: "21:00" };
  return obj;
};

export const createStaffDefaultPayload = (): StaffForm => ({
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  additional_phone_number: "",
  dob: "",
  title: "",
  joining_date: "",
  end_date: "",
  address: "",
  emergency_contact: { name: "", phone: "" },
  gender: undefined as unknown as Gender,
  photos: null,
  staff_docs: [],
  active_hours: getDefaultActiveHours(),
});

export const updateStaffDefaultPayload = (staff: Staff): StaffForm => ({
  first_name: staff?.first_name ?? "",
  last_name: staff?.last_name ?? "",
  email: staff?.email ?? "",
  phone_number: staff?.phone_number ?? "",
  additional_phone_number: staff?.additional_phone_number ?? "",
  dob: staff?.dob ?? "",
  title: staff?.title ?? "",
  joining_date: staff?.joining_date ?? "",
  end_date: staff?.end_date ?? "",
  address: staff?.address ?? "",
  emergency_contact: staff?.emergency_contact ?? { name: "", phone: "" },
  gender: (staff?.gender as Gender) ?? undefined,
  photos: staff?.photos ?? null,
  staff_docs: staff?.staff_docs ?? [],
  active_hours: staff?.active_hours ?? getDefaultActiveHours(),
});
