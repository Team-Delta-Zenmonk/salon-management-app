import { DaysList } from "../../../../../../common/enums/days.enum";


export const getDefaultActiveHours = () => {
  const obj: any = {};
  for (const d of DaysList) obj[d] = null;
  return obj;
};

export const createStaffDefaultPayload = () => ({
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
  gender: undefined as any,
  photos: null,
  active_hours: getDefaultActiveHours(),
});

export const updateStaffDefaultPayload = (staff: any) => ({
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
  gender: staff?.gender ?? undefined,
  photos: null,
  active_hours: staff?.active_hours ?? getDefaultActiveHours(),
});
