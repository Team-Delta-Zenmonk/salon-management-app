import dayjs from "dayjs";
import { DAYS_MAP } from "../../my-profile/_components/constants/business-hours.constants";

export interface BookingTimingNotice {
  type: "midnight" | "overtime";
  message: string;
  endTimeFormatted: string;
  closingTimeFormatted?: string;
}

const formatMinutesTo12Hour = (totalM: number): string => {
  const h = Math.floor(totalM / 60) % 24;
  const m = totalM % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

export function evaluateBookingTiming(
  bookingDateStr: string | undefined,
  startTimeStr: string | undefined,
  totalDurationMinutes: number,
  businessHours?: Record<string, any>
): BookingTimingNotice | null {
  if (!bookingDateStr || !startTimeStr || totalDurationMinutes <= 0) return null;

  const [sh, sm] = startTimeStr.split(":").map(Number);
  if (isNaN(sh) || isNaN(sm)) return null;

  const startMinutes = sh * 60 + sm;
  const endMinutes = startMinutes + totalDurationMinutes;
  const endTimeFormatted = formatMinutesTo12Hour(endMinutes);

  if (endMinutes > 1440) {
    return {
      type: "midnight",
      message: `Appointment ends at ${endTimeFormatted} next day. Bookings cannot cross midnight into the next date.`,
      endTimeFormatted,
    };
  }

  if (businessHours) {
    const d = dayjs(bookingDateStr, "DD-MM-YYYY").isValid()
      ? dayjs(bookingDateStr, "DD-MM-YYYY")
      : dayjs(bookingDateStr);
    const dayOfWeek = d.isValid() ? d.day() : -1;
    const dayName = DAYS_MAP[String(dayOfWeek)];

    const daySchedule =
      businessHours[dayOfWeek] ||
      businessHours[String(dayOfWeek)] ||
      (dayName ? businessHours[dayName] : null);

    if (daySchedule?.end_time) {
      const [ch, cm] = daySchedule.end_time.split(":").map(Number);
      if (!isNaN(ch) && !isNaN(cm)) {
        const closingMinutes = ch * 60 + cm;
        if (endMinutes > closingMinutes) {
          const overtimeMins = endMinutes - closingMinutes;
          const otH = Math.floor(overtimeMins / 60);
          const otM = overtimeMins % 60;
          const otStr =
            otH > 0 && otM > 0
              ? `${otH}h ${otM}m`
              : otH > 0
              ? `${otH} hour${otH > 1 ? "s" : ""}`
              : `${otM} mins`;
          const closingTimeFormatted = formatMinutesTo12Hour(closingMinutes);
          return {
            type: "overtime",
            message: `Appointment ends at ${endTimeFormatted} (${otStr} after salon closing time of ${closingTimeFormatted}). Will be booked as overtime.`,
            endTimeFormatted,
            closingTimeFormatted,
          };
        }
      }
    }
  }

  return null;
}
