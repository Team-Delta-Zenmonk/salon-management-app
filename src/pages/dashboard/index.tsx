import ContentCutIcon from "@mui/icons-material/ContentCut";
import { Box, Typography } from "@mui/material";

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
  return (
    <Box className="space-y-8 flex flex-col">
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
                  className={`inline-block px-3 py-1 rounded-full ${
                    booking.status === "Confirmed" ? "bg-(--primary-900) text-white" : "bg-blue-100 text-(--primary-900)"
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
