export interface RevenueChartPoint {
  name: string;
  revenue: number;
}

export interface TopBookedService {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface DashboardStatsViewModel {
  totalRevenue: number;
  completedBookings: number;
  uniqueClients: number;
  walkInClients: number;
  onlineClients: number;
  avgTicketSize: number;
}

export interface DashboardViewModel {
  chartData: RevenueChartPoint[];
  stats: DashboardStatsViewModel;
  topServices: TopBookedService[];
}

export const getDashboardQueryDateRange = (
  timeRange: "7d" | "30d"
): { startDateStr: string; endDateStr: string; daysList: Array<{ dateStr: string; label: string }> } => {
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

  return { startDateStr, endDateStr, daysList };
};

export const composeDashboardViewModel = (
  rawBookings: any[],
  timeRange: "7d" | "30d"
): DashboardViewModel => {
  const { startDateStr, endDateStr, daysList } = getDashboardQueryDateRange(timeRange);

  const revenueMap: Record<string, number> = {};
  daysList.forEach((d) => {
    revenueMap[d.dateStr] = 0;
  });

  let totalRevenue = 0;
  let completedBookings = 0;
  let walkInClients = 0;
  let onlineClients = 0;
  const clientKeys = new Set<string>();
  const serviceStatsMap: Record<string, { name: string; count: number; revenue: number }> = {};
  let totalServicesCount = 0;

  const validBookings = (rawBookings || []).filter(
    (b: any) => b.status !== "cancelled" && b.status !== "expired"
  );

  validBookings.forEach((b: any) => {
    const bookingDateStr = b.booking_date ? String(b.booking_date).slice(0, 10) : "";
    const isInPeriod = bookingDateStr >= startDateStr && bookingDateStr <= endDateStr;

    if (isInPeriod) {
      const bookingPrice = Number(b.total_price) || 0;
      totalRevenue += bookingPrice;

      if (revenueMap[bookingDateStr] !== undefined) {
        revenueMap[bookingDateStr] += bookingPrice;
      }

      // All active appointments in the selected historical period count as completed
      completedBookings += 1;

      const isWalkIn =
        b.created_by === "ADMIN" ||
        b.created_by === "admin" ||
        Boolean(b.admin_booking) ||
        Boolean(b.is_walk_in);

      if (isWalkIn) {
        walkInClients += 1;
      } else {
        onlineClients += 1;
      }

      if (b.customer?.email) {
        clientKeys.add(`email_${b.customer.email.toLowerCase().trim()}`);
      } else if (b.customer?.name) {
        clientKeys.add(`cname_${b.customer.name.toLowerCase().trim()}`);
      } else if (b.admin_booking?.phone) {
        clientKeys.add(`phone_${b.admin_booking.phone.trim()}`);
      } else if (b.admin_booking?.name) {
        clientKeys.add(`aname_${b.admin_booking.name.toLowerCase().trim()}`);
      } else if (b.customer_id) {
        clientKeys.add(`cid_${b.customer_id}`);
      }

      const services = b.booking_services || [];
      services.forEach((bs: any) => {
        const serviceName = bs.service?.name?.trim() || "Standard Service";
        if (!serviceStatsMap[serviceName]) {
          serviceStatsMap[serviceName] = { name: serviceName, count: 0, revenue: 0 };
        }
        serviceStatsMap[serviceName].count += 1;
        serviceStatsMap[serviceName].revenue += Number(bs.price) || 0;
        totalServicesCount += 1;
      });
    }
  });

  const chartData: RevenueChartPoint[] = daysList.map((d) => ({
    name: d.label,
    revenue: revenueMap[d.dateStr] || 0,
  }));

  const topServices: TopBookedService[] = Object.values(serviceStatsMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((s) => ({
      name: s.name,
      count: s.count,
      revenue: s.revenue,
      percentage: totalServicesCount > 0 ? Math.round((s.count / totalServicesCount) * 100) : 0,
    }));

  const avgTicketSize = completedBookings > 0 ? Math.round(totalRevenue / completedBookings) : 0;

  return {
    chartData,
    stats: {
      totalRevenue,
      completedBookings,
      uniqueClients: clientKeys.size,
      walkInClients,
      onlineClients,
      avgTicketSize,
    },
    topServices,
  };
};

export const INITIAL_DASHBOARD_VIEW_MODEL: DashboardViewModel = {
  chartData: [],
  stats: {
    totalRevenue: 0,
    completedBookings: 0,
    uniqueClients: 0,
    walkInClients: 0,
    onlineClients: 0,
    avgTicketSize: 0,
  },
  topServices: [],
};

