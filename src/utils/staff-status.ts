import dayjs from "dayjs";

export function isStaffInactive(
  staff?: { end_date?: string | null; deleted_at?: string | null } | null
): boolean {
  if (!staff) return false;
  if (staff.deleted_at) return true;

  const endDate = staff.end_date;
  if (!endDate) return false;

  const todayStr = dayjs().format("YYYY-MM-DD");

  let endDateStr = endDate;
  if (/^\d{2}-\d{2}-\d{4}$/.test(endDate)) {
    const [d, m, y] = endDate.split("-");
    endDateStr = `${y}-${m}-${d}`;
  }

  return endDateStr <= todayStr;
}

