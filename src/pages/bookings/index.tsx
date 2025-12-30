import { Box, Typography } from "@mui/material";
import { useState } from "react";
import BookingCalendar from "./_components/booking-calender";
import CreateBooking from "./_components/create-booking";
import type { Booking, BookingStatus } from "./types/booking.type";

export default function BookingPage() {
  const [selectedRange, setSelectedRange] = useState<[Date, Date] | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([
    {
      uuid: "b1",
      customer_name: "Rahul Sharma",
      customer_email: "rahul@example.com",
      service_uuid: "s1",
      service_name: "Haircut",
      staff_uuid: "st1",
      staff_name: "John Doe",
      start_time: "2025-12-29T10:00:00",
      end_time: "2025-12-29T11:00:00",
      status: "confirmed",
      notes: "Front side trim",
    },
    {
      uuid: "b2",
      customer_name: "Priya Singh",
      customer_email: "priya@example.com",
      service_uuid: "s2",
      service_name: "Hair Coloring",
      staff_uuid: "st2",
      staff_name: "Jane Smith",
      start_time: "2025-12-29T10:00:00",
      end_time: "2025-12-29T11:00:00",
      status: "confirmed",
      notes: "Full highlights",
    },
    {
      uuid: "b3",
      customer_name: "Amit Patel",
      customer_email: "amit@example.com",
      service_uuid: "s3",
      service_name: "Manicure",
      staff_uuid: "st3",
      staff_name: "Sarah Wilson",
      start_time: "2025-12-29T10:00:00",
      end_time: "2025-12-29T11:00:00",
      status: "confirmed",
    },
    {
      uuid: "b4",
      customer_name: "Neha Gupta",
      customer_email: "neha@example.com",
      service_uuid: "s4",
      service_name: "Facial",
      staff_uuid: "st1",
      staff_name: "John Doe",
      start_time: "2025-12-29T15:00:00",
      end_time: "2025-12-29T16:00:00",
      status: "cancelled",
      notes: "Customer no-show",
    },
    {
      uuid: "b5",
      customer_name: "Vikram Singh",
      customer_email: "vikram@example.com",
      service_uuid: "s5",
      service_name: "Pedicure",
      staff_uuid: "st2",
      staff_name: "Jane Smith",
      start_time: "2025-12-30T09:30:00",
      end_time: "2025-12-30T10:30:00",
      status: "confirmed",
    },
  ]);

  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case "confirmed":
        return "#10b981";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const handleDateRangeChange = (range: [Date, Date]) => {
    setSelectedRange(range);
    console.log("Selected range:", range);
  };

  const todayBookingsCount = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.start_time).toDateString() === new Date().toDateString()
  ).length;

  const updateBookingStatus = (bookingUuid: string, newStatus: BookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.uuid === bookingUuid ? { ...b, status: newStatus } : b)));
    console.log(`Booking ${bookingUuid} → ${newStatus}`);
  };

  return (
    <Box className="flex flex-col flex-1 min-h-0 w-full space-y-6 bg-gray-50 px-8 pb-6 ">
      <Box className="flex justify-between items-start shrink-0">
        <Box>
          <Typography variant="h5" fontWeight="fontWeightBold" className="text-(--primary-900) mb-2">
            Booking Calendar
          </Typography>
          <Typography className="text-gray-600">
            Manage appointments • Today: <span className="font-semibold text-gray-900">{todayBookingsCount}</span>{" "}
            confirmed bookings
          </Typography>
        </Box>

        <CreateBooking />
      </Box>

      <Box className="bg-white p-4 shadow-sm flex gap-6 max-w-[250px]  border border-gray-300 rounded-lg">
        <Box className="flex items-center gap-2">
          <Box className="w-3 h-3 rounded-full bg-[#10b981]"></Box>
          <Box className="text-xs font-medium">Confirmed</Box>
        </Box>
        <Box className="flex items-center gap-2">
          <Box className="w-3 h-3 rounded-full bg-[#ef4444]"></Box>
          <Box className="text-xs font-medium">Cancelled</Box>
        </Box>
      </Box>

      <Box className="flex-1 bg-white shadow-sm p-2 border border-gray-300">
        <BookingCalendar
          bookings={bookings}
          onDateRangeChange={handleDateRangeChange}
          updateBookingStatus={updateBookingStatus}
          getStatusColor={getStatusColor}
        />
      </Box>
    </Box>
  );
}
