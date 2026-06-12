import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ContentCutOutlinedIcon from "@mui/icons-material/ContentCutOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, Typography, Button, CircularProgress, Chip, IconButton, Popover, Select, MenuItem } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { onboardStripeAction } from "../../features/stripe/onboard-stripe/onboard-stripe.action";
import { getStripeDashboardLinkAction } from "../../features/stripe/get-dashboard-link/get-dashboard-link.action";
import { listBookingsAction } from "../../features/booking/get-bookings/get-bookings.action";
import { listStaffAction } from "../../features/staff/list-staff/list-staff.action";
import { listServicesAction } from "../../features/service/list-services/list-service.action";
import type { RootState } from "../../store/store";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getSalonProfileAction } from "../../features/auth/profile/get-salon-profile/getSalonProfile.action";
import dayjs from "dayjs";

import { DashCard } from "./_components/dash-card";
import { DashCardHeader } from "./_components/dash-card-header";
import { EmptyState } from "./_components/empty-state";
import { MiniChart } from "./_components/mini-chart";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const bookingState = useAppSelector((state: RootState) => state.booking);
  const staffState = useAppSelector((state: RootState) => state.staff);
  const serviceState = useAppSelector((state: RootState) => state.service);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState<7 | 30>(7);
  const [pendingPeriod, setPendingPeriod] = useState<7 | 30>(7);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);


  useEffect(() => {
    dispatch(listBookingsAction({
      view: "calendar",
      start_date: dayjs().subtract(30, "day").startOf("day").toISOString(),
      end_date: dayjs().endOf("month").toISOString(),
    }));
    dispatch(listStaffAction({ page: 1, limit: 100 }));
    dispatch(listServicesAction({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (searchParams.get("stripe_onboarded") === "true" && salon?.uuid) {
      setIsVerifying(true);
      dispatch(getSalonProfileAction(salon.uuid)).finally(() => {
        setTimeout(() => setIsVerifying(false), 5000);
      });
      searchParams.delete("stripe_onboarded");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, dispatch, setSearchParams, salon?.uuid]);

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
      console.error("Failed to fetch dashboard:", error);
    }
  };

  const bookings = bookingState?.data ?? [];

  const getBookingDate = (b: any) => b.booking_date || b.booking_start_time || b.start_time;

  const todayBookings = useMemo(() =>
    bookings.filter((b) => {
      const d = getBookingDate(b);
      return d && dayjs(d).isSame(dayjs(), "day");
    }),
    [bookings]
  );

  const thisMonthBookings = useMemo(() =>
    bookings.filter((b) => {
      const d = getBookingDate(b);
      return d && dayjs(d).isSame(dayjs(), "month");
    }),
    [bookings]
  );

  const totalRevenue = useMemo(() =>
    bookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0),
    [bookings]
  );

  /* Filtered bookings for chart based on selected period */
  const periodBookings = useMemo(() => {
    const cutoff = dayjs().subtract(salesPeriod, "day").format("YYYY-MM-DD");
    const todayStr = dayjs().format("YYYY-MM-DD");
    return bookings.filter((b) => {
      const dVal = getBookingDate(b);
      if (!dVal) return false;
      const d = dayjs(dVal).format("YYYY-MM-DD");
      return d >= cutoff && d <= todayStr;
    });
  }, [bookings, salesPeriod]);

  const periodRevenue = useMemo(() =>
    periodBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0),
    [periodBookings]
  );

  /* Chart data: sales per day across selected period */
  const { chartData, BookingData, chartLabels } = useMemo(() => {
    const numDays = salesPeriod;
    const days = Array.from({ length: numDays }, (_, i) =>
      dayjs().subtract(numDays - 1 - i, "day")
    );

    if (numDays <= 7) {
      /* 7-day view: one point per day */
      const chartData: number[] = [];
      const BookingData: number[] = [];
      days.forEach((day) => {
        const dayStr = day.format("YYYY-MM-DD");
        const dayBookings = periodBookings.filter((b) => {
          const dVal = getBookingDate(b);
          return dVal && dayjs(dVal).format("YYYY-MM-DD") === dayStr;
        });
        chartData.push(dayBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0));
        BookingData.push(dayBookings.length);
      });
      return { chartData, BookingData, chartLabels: days.map((d) => d.format("ddd D")) };
    } else {
      /* 30-day view: group into ~10 buckets (3 days each) */
      const bucketCount = 10;
      const bucketSize = Math.ceil(numDays / bucketCount);
      const buckets: { start: string; end: string; label: string }[] = [];
      for (let i = 0; i < bucketCount; i++) {
        const bStart = days[i * bucketSize] || days[days.length - 1];
        const bEnd = days[Math.min((i + 1) * bucketSize - 1, days.length - 1)];
        buckets.push({
          start: bStart.format("YYYY-MM-DD"),
          end: bEnd.format("YYYY-MM-DD"),
          label: bStart.format("DD/MM"),
        });
      }
      const chartData: number[] = [];
      const BookingData: number[] = [];
      buckets.forEach((bucket) => {
        const bucketBookings = periodBookings.filter((b) => {
          const dVal = getBookingDate(b);
          if (!dVal) return false;
          const d = dayjs(dVal).format("YYYY-MM-DD");
          return d >= bucket.start && d <= bucket.end;
        });
        chartData.push(bucketBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0));
        BookingData.push(bucketBookings.length);
      });
      return { chartData, BookingData, chartLabels: buckets.map((b) => b.label) };
    }
  }, [periodBookings, salesPeriod]);

  const staffCount = staffState?.data?.length ?? 0;
  const serviceCount = serviceState?.data?.length ?? 0;

  return (
    <Box className="flex flex-col flex-1 gap-6">
      {/* ── Stripe Badge (compact) ── */}
      {isVerifying ? (
        <Box className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm">
          <CircularProgress size={18} color="inherit" className="text-[var(--text-muted)]" />
          <Box className="flex-1 min-w-0">
            <Typography fontWeight={600} className="text-[var(--text-primary)] text-sm">Verifying Payouts Setup</Typography>
            <Typography className="text-[var(--text-muted)] text-xs">Stripe is verifying your account. This may take a few moments.</Typography>
          </Box>
        </Box>
      ) : !salon?.stripe_account_id ? (
        <Box className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm">
          <ErrorOutlineIcon style={{ fontSize: 20 }} className="text-[var(--warning-500)] shrink-0" />
          <Box className="flex-1 min-w-0">
            <Typography fontWeight={600} className="text-[var(--text-primary)] text-sm">Setup Payouts</Typography>
            <Typography className="text-[var(--text-muted)] text-xs">Your salon is hidden. Set up payouts to start accepting bookings.</Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleStripeConnect}
            disabled={isConnecting}
            className="shrink-0 rounded-xl shadow-none normal-case font-semibold text-xs px-4 py-1.5"
          >
            {isConnecting ? "Redirecting..." : "Setup Stripe"}
          </Button>
        </Box>
      ) : (
        <Box className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm">
          <CheckCircleOutlineIcon style={{ fontSize: 20 }} className="text-[var(--success-500)] shrink-0" />
          <Box className="flex-1 min-w-0">
            <Typography fontWeight={600} className="text-[var(--text-primary)] text-sm">Payouts Enabled</Typography>
            <Typography className="text-[var(--text-muted)] text-xs">Your salon is visible and ready to accept payments.</Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleViewDashboard}
            className="shrink-0 rounded-xl shadow-none normal-case font-semibold text-xs px-4 py-1.5"
          >
            View Stripe Earnings
          </Button>
        </Box>
      )}

      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <DashCard>
          <Box className="flex items-start justify-between mb-5">
            <Box>
              <Typography fontWeight={700} className="text-[var(--text-primary)] text-base">
                Recent sales
              </Typography>
              <Typography className="text-[var(--text-muted)] text-xs mt-0.5">
                Last {salesPeriod} days
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => { setMenuAnchor(e.currentTarget); setPendingPeriod(salesPeriod); }}
              className="text-[var(--text-muted)] -mt-1 -mr-1"
            >
              <MoreVertIcon style={{ fontSize: 20 }} />
            </IconButton>
            <Popover
              open={Boolean(menuAnchor)}
              anchorEl={menuAnchor}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ paper: {
                className: "rounded-2xl shadow-lg border border-[var(--border-subtle)] p-4 min-w-[220px]",
              }}}
            >
              <Typography fontWeight={600} className="text-[var(--text-primary)] text-sm mb-3">
                Time period
              </Typography>
              <Select
                value={pendingPeriod}
                onChange={(e) => setPendingPeriod(e.target.value as 7 | 30)}
                size="small"
                fullWidth
                className="rounded-xl text-sm mb-4"
              >
                <MenuItem value={7}>Last 7 days</MenuItem>
                <MenuItem value={30}>Last 30 days</MenuItem>
              </Select>
              <Box className="flex items-center gap-2 justify-end">
                <Button
                  size="small"
                  onClick={() => setMenuAnchor(null)}
                  className="rounded-xl normal-case text-xs font-semibold text-[var(--text-muted)] px-3"
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => { setSalesPeriod(pendingPeriod); setMenuAnchor(null); }}
                  className="rounded-xl shadow-none normal-case text-xs font-semibold px-4"
                >
                  Apply changes
                </Button>
              </Box>
            </Popover>
          </Box>
          <Typography fontWeight={800} className="text-[var(--text-primary)] text-2xl mb-1">
            ₹{periodRevenue.toLocaleString("en-IN")}
          </Typography>
          <Box className="flex items-center gap-4 mt-1">
            <Typography className="text-[var(--text-muted)] text-xs">
              Bookings <span className="font-bold text-[var(--text-primary)]">{periodBookings.length}</span>
            </Typography>
            <Typography className="text-[var(--text-muted)] text-xs">
              Bookings value <span className="font-bold text-[var(--text-primary)]">₹{periodRevenue.toLocaleString("en-IN")}</span>
            </Typography>
          </Box>
          <Box className="flex-1 flex flex-col justify-end">
            <MiniChart data1={chartData} data2={BookingData} labels={chartLabels} color1="#8b5cf6" color2="#10b981" />
          </Box>
          <Box className="flex items-center gap-4 mt-4">
            <Box className="flex items-center gap-1.5">
              <Box className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
              <Typography className="text-[var(--text-muted)] text-xs">Sales</Typography>
            </Box>
            <Box className="flex items-center gap-1.5">
              <Box className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <Typography className="text-[var(--text-muted)] text-xs">Bookings</Typography>
            </Box>
          </Box>
        </DashCard>

        <DashCard>
          <DashCardHeader title="Today's bookings" />
          {todayBookings.length === 0 ? (
            <EmptyState
              icon={CalendarTodayOutlinedIcon}
              title="No Bookings Today"
              subtitle={
                <>
                  Visit the{" "}
                  <Link to="/bookings" className="text-[var(--accent-600)] font-semibold hover:underline">calendar</Link>
                  {" "}section to add some bookings
                </>
              }
            />
          ) : (
            <Box className="flex flex-col gap-3 flex-1">
              {todayBookings.slice(0, 5).map((b) => {
                const customerName = b.admin_booking?.name || b.customer?.name || "Walk-in";
                const firstService = b.booking_services?.[0];
                const serviceName = firstService?.service?.name || "Service";
                const staffName = firstService?.staff ? `${firstService.staff.first_name} ${firstService.staff.last_name || ""}`.trim() : "";
                return (
                  <Box key={b.uuid} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-subtle)]">
                    <Box className="w-10 h-10 rounded-xl bg-[var(--accent-50)] flex items-center justify-center shrink-0">
                      <Typography fontWeight={800} className="text-[var(--accent-700)] text-sm">
                        {dayjs(b.booking_start_time).format("h:mm")}
                      </Typography>
                    </Box>
                    <Box className="flex-1 min-w-0">
                      <Typography fontWeight={600} className="text-[var(--text-primary)] text-sm truncate">
                        {serviceName}
                      </Typography>
                      <Typography className="text-[var(--text-muted)] text-xs truncate">
                        {customerName}{staffName ? ` · ${staffName}` : ""}
                      </Typography>
                    </Box>
                    <Chip
                      label={b.status}
                      size="small"
                      className="capitalize text-[10px] font-bold h-5 bg-[var(--accent-50)] text-[var(--accent-700)]"
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </DashCard>
      </Box>

      {/* ── Quick Stats Bar ── */}
      <Box className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Bookings This Month", value: thisMonthBookings.length, icon: EventNoteOutlinedIcon },
          { label: "Today's Bookings", value: todayBookings.length, icon: CalendarTodayOutlinedIcon },
          { label: "Total Staff", value: staffCount, icon: GroupsOutlinedIcon },
          { label: "Total Services", value: serviceCount, icon: ContentCutOutlinedIcon },
        ].map((stat) => (
          <Box key={stat.label} className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4">
            <Box className="w-10 h-10 rounded-xl bg-[var(--primary-50)] flex items-center justify-center shrink-0">
              <stat.icon style={{ fontSize: 20 }} className="text-[var(--primary-700)]" />
            </Box>
            <Box>
              <Typography fontWeight={800} className="text-[var(--text-primary)] text-lg leading-tight">
                {stat.value}
              </Typography>
              <Typography className="text-[var(--text-muted)] text-xs">
                {stat.label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
