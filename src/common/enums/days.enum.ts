export const DAYS = {
  MONDAY: "monday",
  TUESDAY: "tuesday",
  WEDNESDAY: "wednesday",
  THURSDAY: "thursday",
  FRIDAY: "friday",
  SATURDAY: "saturday",
  SUNDAY: "sunday",
} as const;

export type DayKey = typeof DAYS[keyof typeof DAYS];

export const DayOptions: { label: string; value: DayKey }[] = [
  { label: "Monday", value: DAYS.MONDAY },
  { label: "Tuesday", value: DAYS.TUESDAY },
  { label: "Wednesday", value: DAYS.WEDNESDAY },
  { label: "Thursday", value: DAYS.THURSDAY },
  { label: "Friday", value: DAYS.FRIDAY },
  { label: "Saturday", value: DAYS.SATURDAY },
  { label: "Sunday", value: DAYS.SUNDAY },
];

export const DaysList: DayKey[] = [
  DAYS.MONDAY,
  DAYS.TUESDAY,
  DAYS.WEDNESDAY,
  DAYS.THURSDAY,
  DAYS.FRIDAY,
  DAYS.SATURDAY,
  DAYS.SUNDAY,
];
