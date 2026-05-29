import ContentCutIcon from "@mui/icons-material/ContentCut";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { onboardStripeAction } from "../../features/stripe/onboard-stripe/onboard-stripe.action";
import { getStripeDashboardLinkAction } from "../../features/stripe/get-dashboard-link/get-dashboard-link.action";
import type { RootState } from "../../store/store";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert } from "../../components/alert";
import { getSalonProfileAction } from "../../features/auth/profile/get-salon-profile/getSalonProfile.action";

const stats = [
  {
    title: "Total Bookings",
    value: "156",
    change: "+12% from last month",
    icon: ContentCutIcon,
  },
  {
    title: "Total Customers",
    value: "892",
    change: "+8% from last month",
    icon: ContentCutIcon,
  },
  {
    title: "Revenue",
    value: "$45,230",
    change: "+18% from last month",
    icon: ContentCutIcon,
  },
  {
    title: "Notifications",
    value: "23",
    change: "5 unread messages",
    icon: ContentCutIcon,
  },
];

const recentBookings = [
  { id: 1, customer: "Sarah Johnson", service: "Haircut & Styling", time: "10:00 AM", status: "Confirmed" },
  { id: 2, customer: "Mike Davis", service: "Beard Trim", time: "11:30 AM", status: "Pending" },
  { id: 3, customer: "Emily Chen", service: "Hair Coloring", time: "2:00 PM", status: "Confirmed" },
  { id: 4, customer: "James Wilson", service: "Haircut", time: "3:30 PM", status: "Confirmed" },
];

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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

  return (
    <Box className="space-y-8 flex flex-col">
      {isVerifying ? (
        <Alert
          variant="warning"
          icon={<CircularProgress size={24} color="inherit" />}
          title="Verifying Payouts Setup"
        >
          Stripe is currently verifying your account for payments. This may take a few moments.
        </Alert>
      ) : !salon?.stripe_account_id ? (
        <Alert
          variant="error"
          icon={<ErrorOutlineIcon className="text-red-800!" />}
          title="Action Required: Setup Payouts"
          action={
            <Button
              variant="contained"
              color="error"
              className="w-full md:w-auto"
              onClick={handleStripeConnect}
              disabled={isConnecting}
            >
              {isConnecting ? "Redirecting..." : "Set up Bank Account (Stripe)"}
            </Button>
          }
        >
          Your salon is currently hidden from customers. Set up payouts to start accepting bookings.
        </Alert>
      ) : (
        <Alert
          variant="success"
          icon={<CheckCircleOutlineIcon className="text-green-800!" />}
          title="Payouts Enabled"
          action={
            <Button
              variant="contained"
              color="success"
              className="w-full md:w-auto text-white shadow-sm"
              onClick={handleViewDashboard}
            >
              View Stripe Earnings
            </Button>
          }
        >
          Your salon is visible and ready to accept payments.
        </Alert>
      )}

      <Box>
        <Typography className="text-(--primary-900) mb-2">Dashboard Overview</Typography>
        <Typography className="">Welcome back! Here's what's happening today.</Typography>
      </Box>
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Box key={stat.title} className="p-6 bg-card text-card-foreground flex flex-col gap-6 rounded-xl border">
              <Box className="flex items-start justify-between">
                <Box>
                  <Typography className="mb-2">{stat.title}</Typography>
                  <Typography className="mb-1">{stat.value}</Typography>
                  <Typography className="text-gray-500">{stat.change}</Typography>
                </Box>
                <Box className="w-12 h-12 bg-(--primary-900) rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white!" />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box className="p-6 bg-card text-card-foreground flex flex-col gap-6 rounded-xl border">
        <Typography className="text-(--primary-900) mb-6">Today's Bookings</Typography>
        <Box className="space-y-4">
          {recentBookings.map((booking) => (
            <Box key={booking.id} className="flex items-center justify-between p-4 border border-blue-200 rounded-lg">
              <Box>
                <Typography className="">{booking.customer}</Typography>
                <Typography className="">{booking.service}</Typography>
              </Box>
              <Box className="text-right">
                <Typography className="text-(--primary-900)">{booking.time}</Typography>
                <span
                  className={`inline-block px-3 py-1 rounded-full ${booking.status === "Confirmed" ? "bg-(--primary-900) text-white"
                    : "bg-blue-100 text-(--primary-900)"
                    }`}
                >
                  {booking.status}
                </span>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
