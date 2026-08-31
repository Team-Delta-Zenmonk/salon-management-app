import { format } from "date-fns";

export function formatTimeRange(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);

  const date = format(start, "EEE, dd MMM yyyy");
  const startTime = format(start, "h:mm a");
  const endTime = format(end, "h:mm a");

  return { date, startTime, endTime };
}