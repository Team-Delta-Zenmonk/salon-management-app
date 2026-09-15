import { getBookingsService } from "../get-bookings/get-bookings.service";

export interface RevenueChartPoint {
  name: string;
  revenue: number;
}

export const getRevenueAnalyticsService = async (
  timeRange: "7d" | "30d"
): Promise<RevenueChartPoint[]> => {
  const daysCount = timeRange === "7d" ? 7 : 30;
  const today = new Date();
  const daysList: Array<{ dateStr: string; label: string }> = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const label =
      timeRange === "7d"
        ? d.toLocaleDateString("en-US", { weekday: "short" })
        : d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    daysList.push({ dateStr, label });
  }

  const startDateStr = daysList[0].dateStr;
  const endDateStr = daysList[daysList.length - 1].dateStr;

  const res: any = await getBookingsService({
    start_date: startDateStr,
    end_date: endDateStr,
    view: "calendar",
  });

  const rawBookings: any[] = Array.isArray(res) ? res : res?.data || [];

  const revenueMap: Record<string, number> = {};
  daysList.forEach((d) => {
    revenueMap[d.dateStr] = 0;
  });

  rawBookings.forEach((b: any) => {
    if (b.booking_date) {
      const dStr = String(b.booking_date).slice(0, 10);
      if (revenueMap[dStr] !== undefined) {
        revenueMap[dStr] += Number(b.total_price) || 0;
      }
    }
  });

  return daysList.map((d) => ({
    name: d.label,
    revenue: revenueMap[d.dateStr] || 0,
  }));
};
