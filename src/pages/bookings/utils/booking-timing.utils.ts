import dayjs from "dayjs";
import { DAYS_MAP } from "../../my-profile/_components/constants/business-hours.constants";

export interface BookingTimingNotice {
  type: "midnight" | "closed" | "outside_hours" | "overtime";
  isBlocking: boolean;
  message: string;
  endTimeFormatted: string;
  closingTimeFormatted?: string;
  openingTimeFormatted?: string;
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
      isBlocking: true,
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

    if (
      !daySchedule ||
      daySchedule.is_closed ||
      !daySchedule.start_time ||
      !daySchedule.end_time
    ) {
      return {
        type: "closed",
        isBlocking: true,
        message: "The salon is closed or has no operating hours set on this day.",
        endTimeFormatted,
      };
    }

    const [oh, om] = daySchedule.start_time.split(":").map(Number);
    const [ch, cm] = daySchedule.end_time.split(":").map(Number);

    if (isNaN(oh) || isNaN(om) || isNaN(ch) || isNaN(cm)) {
      return null;
    }

    const openingMinutes = oh * 60 + om;
    const closingMinutes = ch * 60 + cm;
    const openingTimeFormatted = formatMinutesTo12Hour(openingMinutes);
    const closingTimeFormatted = formatMinutesTo12Hour(closingMinutes);

    if (startMinutes < openingMinutes) {
      return {
        type: "outside_hours",
        isBlocking: true,
        message: `Appointment starts at ${formatMinutesTo12Hour(startMinutes)}, which is before the salon opens at ${openingTimeFormatted}.`,
        endTimeFormatted,
        openingTimeFormatted,
        closingTimeFormatted,
      };
    }

    if (endMinutes > closingMinutes) {
      return {
        type: "outside_hours",
        isBlocking: true,
        message: `Appointment ends at ${endTimeFormatted}, which is after the salon closes at ${closingTimeFormatted}.`,
        endTimeFormatted,
        openingTimeFormatted,
        closingTimeFormatted,
      };
    }
  }

  return null;
}
