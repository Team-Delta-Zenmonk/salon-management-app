const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatUTCTime(d: Date): string {
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatTimeRange(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);

  const date = `${WEEKDAY_SHORT[start.getUTCDay()]}, ${String(start.getUTCDate()).padStart(2, "0")} ${MONTH_SHORT[start.getUTCMonth()]} ${start.getUTCFullYear()}`;
  const startTime = formatUTCTime(start);
  const endTime = formatUTCTime(end);

  return { date, startTime, endTime };
}