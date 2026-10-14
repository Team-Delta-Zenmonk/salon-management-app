import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { onboardStripeAction } from "../../features/stripe/onboard-stripe/onboard-stripe.action";
import { getStripeDashboardLinkAction } from "../../features/stripe/get-dashboard-link/get-dashboard-link.action";
import { getSalonProfileAction } from "../../features/auth/profile/get-salon-profile/getSalonProfile.action";
import { listBookingsAction } from "../../features/booking/get-bookings/get-bookings.action";
import { listStaffAction } from "../../features/staff/list-staff/list-staff.action";
import { listServicesAction } from "../../features/service/list-services/list-service.action";
import { BOOKING_FILTER } from "../../common/enums/booking-filter.enum";
import { BOOKING_SOURCE } from "../../common/enums/booking-source.enum";
import type { RootState } from "../../store/store";

import { getBookingsService } from "../../features/booking/get-bookings/get-bookings.service";
import { DashboardHeader } from "./_components/dashboard-header";
import { StatsGrid } from "./_components/stats-grid";
import { RevenueChart } from "./_components/revenue-chart";
import { TodayBookingsSection, type TodayBookingItem } from "./_components/today-bookings";
import { ServiceDistribution } from "./_components/service-distribution";
import { StaffLeaderboard } from "./_components/staff-leaderboard";

import {
  composeDashboardViewModel,
  getDashboardQueryDateRange,
  INITIAL_DASHBOARD_VIEW_MODEL,
  type DashboardViewModel,
} from "./utils/dashboard-view.model";
import { containerVariants, getTodayFormattedDate } from "./utils/dashboard.constants";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const { data: reduxBookings, loading: bookingsLoading } = useAppSelector((state: RootState) => state.booking);
  const { data: staffList, loading: staffLoading } = useAppSelector((state: RootState) => state.staff);
  const { data: catalogServices } = useAppSelector((state: RootState) => state.service);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [dashboardView, setDashboardView] = useState<DashboardViewModel>(INITIAL_DASHBOARD_VIEW_MODEL);

  const loadChartData = useCallback(async (range: "7d" | "30d") => {
    setChartLoading(true);
    try {
      const { startDateStr, endDateStr } = getDashboardQueryDateRange(range);
      const res: any = await getBookingsService({
        start_date: startDateStr,
        end_date: endDateStr,
        view: "calendar",
      });
      const rawBookings: any[] = Array.isArray(res) ? res : res?.data || [];
      const viewModel = composeDashboardViewModel(rawBookings, range);
      setDashboardView(viewModel);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setDashboardView(INITIAL_DASHBOARD_VIEW_MODEL);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const loadTodayBookings = useCallback(() => {
    const todayStr = getTodayFormattedDate();
    dispatch(
      listBookingsAction({
        filter: BOOKING_FILTER.DAY,
        start_date: todayStr,
        end_date: todayStr,
        page: 1,
        limit: 50,
        view: "calendar",
      })
    );
  }, [dispatch]);

  const loadStaffAndServices = useCallback(() => {
    dispatch(listStaffAction({ page: 1, limit: 50 }));
    dispatch(listServicesAction({ page: 1, limit: 50 }));
  }, [dispatch]);

  const checkStripeOnboarding = useCallback(() => {
    if (searchParams.get("stripe_onboarded") === "true" && salon?.uuid) {
      setIsVerifying(true);
      dispatch(getSalonProfileAction(salon.uuid)).finally(() => {
        setTimeout(() => setIsVerifying(false), 5000);
      });
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("stripe_onboarded");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, salon?.uuid, dispatch, setSearchParams]);

  const handleTimeRangeChange = (range: "7d" | "30d") => {
    setTimeRange(range);
    loadChartData(range);
  };

  const handleStripeConnect = async () => {
    try {
      setIsConnecting(true);
      const res = await dispatch(onboardStripeAction()).unwrap();
      if (res?.message?.url) {
        window.location.href = res.message.url;
      }
    } catch (error) {
      console.error("Failed to connect stripe:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleViewDashboard = async () => {
    try {
      const res = await dispatch(getStripeDashboardLinkAction()).unwrap();
      if (res?.message?.url) {
        window.open(res.message.url, "_blank");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard link:", error);
    }
  };

  useEffect(() => {
    loadChartData("7d");
    loadTodayBookings();
    loadStaffAndServices();
    checkStripeOnboarding();
  }, [loadChartData, loadTodayBookings, loadStaffAndServices, checkStripeOnboarding]);

  const todayBookings: TodayBookingItem[] = useMemo(() => {
    return reduxBookings.map((booking) => {
      const bookingServices = booking.booking_services ?? [];
      const isCustomerBooking = booking.created_by === BOOKING_SOURCE.CUSTOMER;
      const customerName = isCustomerBooking
        ? booking.customer?.name || "Registered Customer"
        : booking.admin_booking?.name || "Walk-in Customer";
      const initials = customerName
        .split(" ")
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();
      const serviceNames = bookingServices.map((bs: any) => bs.service?.name).filter(Boolean);
      const startTime = booking.booking_start_time
        ? new Date(
            booking.booking_start_time.endsWith("Z")
              ? booking.booking_start_time.slice(0, -1)
              : booking.booking_start_time
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";
      return {
        id: booking.id,
        uuid: booking.uuid,
        customer: customerName,
        service: serviceNames.length > 0 ? serviceNames.join(", ") : "Service",
        time: startTime,
        status: booking.status,
        initials,
      };
    });
  }, [reduxBookings]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-full overflow-x-hidden min-w-0"
    >
      <DashboardHeader
        salonName={salon?.name}
        salonSlug={salon?.slug}
        isVerifying={isVerifying}
        stripeAccountId={salon?.stripe_account_id}
        isConnecting={isConnecting}
        onStripeConnect={handleStripeConnect}
        onViewDashboard={handleViewDashboard}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
        <StatsGrid
          loading={chartLoading}
          totalRevenue={dashboardView.stats.totalRevenue}
          completedBookings={dashboardView.stats.completedBookings}
          uniqueClients={dashboardView.stats.uniqueClients}
          walkInClients={dashboardView.stats.walkInClients}
          onlineClients={dashboardView.stats.onlineClients}
          avgTicketSize={dashboardView.stats.avgTicketSize}
          timeRange={timeRange}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <RevenueChart
            timeRange={timeRange}
            revenueChartData={dashboardView.chartData}
            chartLoading={chartLoading}
            onTimeRangeChange={handleTimeRangeChange}
          />
          <TodayBookingsSection todayBookings={todayBookings} bookingsLoading={bookingsLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ServiceDistribution
            topServices={dashboardView.topServices}
            catalogServices={catalogServices}
            loading={chartLoading}
            timeRange={timeRange}
          />
          <StaffLeaderboard
            staffList={staffList}
            todayBookings={reduxBookings}
            loading={staffLoading}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
