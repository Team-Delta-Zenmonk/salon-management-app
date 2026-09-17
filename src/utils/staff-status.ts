import dayjs from "dayjs";

export function isStaffInactive(staff?: { end_date?: string | null } | null): boolean {
  if (!staff || !staff.end_date) return false;
  return !dayjs(staff.end_date, "DD-MM-YYYY").isAfter(dayjs());
}
