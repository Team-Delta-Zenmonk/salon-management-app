import { useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { onboardStripeAction } from "../../features/stripe/onboard-stripe/onboard-stripe.action";
import { getStripeDashboardLinkAction } from "../../features/stripe/get-dashboard-link/get-dashboard-link.action";
import { getSalonProfileAction } from "../../features/auth/profile/get-salon-profile/getSalonProfile.action";
import { listStaffAction } from "../../features/staff/list-staff/list-staff.action";
import { listServicesAction } from "../../features/service/list-services/list-service.action";
import { getDashboardAnalyticsAction } from "../../features/dashboard/dashboard.action";
import { setVerifyingStripe } from "../../features/dashboard/dashboard.slice";
import { BOOKING_SOURCE } from "../../common/enums/booking-source.enum";
import type { RootState } from "../../store/store";

import { DashboardHeader } from "./_components/dashboard-header";
import { StatsGrid } from "./_components/stats-grid";
import { RevenueChart } from "./_components/revenue-chart";
import { TodayBookingsSection, type TodayBookingItem } from "./_components/today-bookings";
import { ServiceDistribution } from "./_components/service-distribution";
import { StaffLeaderboard } from "./_components/staff-leaderboard";

import { containerVariants } from "./utils/dashboard.constants";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const { staffLoading, catalogServices, dashboardView, chartLoading, isInitialLoaded, isVerifyingStripe, timeRange, dashboardTodayBookings } =
    useAppSelector((state: RootState) => ({
      staffLoading: state.staff.loading,
      catalogServices: state.service.data,
      dashboardView: state.dashboard.viewModel,
      chartLoading: state.dashboard.loading,
      isInitialLoaded: state.dashboard.isInitialLoaded,
      isVerifyingStripe: state.dashboard.isVerifyingStripe,
      timeRange: state.dashboard.timeRange,
      dashboardTodayBookings: state.dashboard.todayBookings,
    }));
  const { data: staffList } = useAppSelector((state: RootState) => state.staff);
  const { isOnboarding: isConnecting } = useAppSelector((state: RootState) => state.stripe);

  const [searchParams, setSearchParams] = useSearchParams();

  const loadChartData = useCallback(
    (range: "7d" | "30d") => {
      dispatch(getDashboardAnalyticsAction(range));
    },
    [dispatch]
  );

  const loadStaffAndServices = useCallback(() => {
    dispatch(listStaffAction({ page: 1, limit: 10 }));
    dispatch(listServicesAction({ page: 1, limit: 10 }));
  }, [dispatch]);

  const checkStripeOnboarding = useCallback(() => {
    if (searchParams.get("stripe_onboarded") === "true" && salon?.uuid) {
      dispatch(setVerifyingStripe(true));
      dispatch(getSalonProfileAction(salon.uuid)).finally(() => {
        setTimeout(() => dispatch(setVerifyingStripe(false)), 5000);
      });
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("stripe_onboarded");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, salon?.uuid, dispatch, setSearchParams]);

  const handleTimeRangeChange = (range: "7d" | "30d") => {
    loadChartData(range);
  };

  const handleStripeConnect = async () => {
    try {
      const res = await dispatch(onboardStripeAction()).unwrap();
      if (res?.message?.url) {
        window.location.href = res.message.url;
      }
    } catch (error) {
      console.error("Failed to connect account:", error);
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
    if (isInitialLoaded) return;

    loadChartData("7d");
    loadStaffAndServices();
    checkStripeOnboarding();
  }, [dispatch, isInitialLoaded]);

  const todayBookings: TodayBookingItem[] = useMemo(() => {
    return dashboardTodayBookings.map((booking: any) => {
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
  }, [dashboardTodayBookings]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-full overflow-x-hidden min-w-0"
    >
      <DashboardHeader
        salonName={salon?.name}
        salonSlug={salon?.slug}
        isVerifying={isVerifyingStripe}
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
          <TodayBookingsSection todayBookings={todayBookings} bookingsLoading={chartLoading} />
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
            todayBookings={dashboardTodayBookings}
            loading={staffLoading}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
