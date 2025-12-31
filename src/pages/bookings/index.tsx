import { Box, Typography } from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import BookingCalendar from "./_components/booking-calender";
import CreateBooking from "./_components/create-booking";
import type { Booking, BookingStatus } from "./types/booking.type";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ALL_SERVICES_VALUE, ALL_STAFF_VALUE, BOOKING_STATUS_COLORS } from "./constants/booking.constants";
import { listStaffAction } from "../../features/staff/list-staff/list-staff.action";
import { listServicesAction } from "../../features/service/list-services/list-service.action";
import Select from "../../components/form/select";

interface FilterForm {
  staff: string;
  service: string;
}

export default function BookingPage() {
  const dispatch = useAppDispatch();
  const { data: staff } = useAppSelector((state) => state.staff);
  const { data: services } = useAppSelector((state) => state.service);

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
      notes: "Regular customer, prefers gel polish",
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
      notes: "Regular customer, prefers gel polish",
    },
  ]);

  const { control, watch } = useForm<FilterForm>({
    defaultValues: {
      staff: ALL_STAFF_VALUE,
      service: ALL_SERVICES_VALUE,
    },
  });

  const selectedStaff = watch("staff");
  const selectedService = watch("service");

  useEffect(() => {
    dispatch(listStaffAction({ page: 1, limit: 100 }));
    dispatch(listServicesAction({ page: 1, limit: 100 }));
  }, [dispatch]);

  const staffOptions = useMemo(
    () => [
      { label: "All Staff", value: ALL_STAFF_VALUE },
      ...staff.map((s) => ({
        label: `${s.first_name}${s.last_name ? ` ${s.last_name}` : ""}`,
        value: s.uuid,
      })),
    ],
    [staff]
  );

  const serviceOptions = useMemo(
    () => [
      { label: "All Services", value: ALL_SERVICES_VALUE },
      ...services.map((s) => ({
        label: s.name,
        value: s.uuid,
      })),
    ],
    [services]
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStaff = selectedStaff === ALL_STAFF_VALUE || booking.staff_uuid === selectedStaff;
      const matchesService = selectedService === ALL_SERVICES_VALUE || booking.service_uuid === selectedService;
      return matchesStaff && matchesService;
    });
  }, [bookings, selectedStaff, selectedService]);

  const getStatusColor = (status: BookingStatus): string => {
    return BOOKING_STATUS_COLORS[status] ?? "#6b7280";
  };

  const handleDateRangeChange = (range: [Date, Date]) => {
    setSelectedRange(range);
  };

  const todayBookingsCount = filteredBookings.filter(
    (b) => b.status === "confirmed" && new Date(b.start_time).toDateString() === new Date().toDateString()
  ).length;

  const updateBookingStatus = (bookingUuid: string, newStatus: BookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.uuid === bookingUuid ? { ...b, status: newStatus } : b)));
  };

  return (
    <Box className="flex flex-col flex-1 min-h-0 w-full space-y-6 bg-gray-50 px-8 pb-6">
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

      <Box className="flex items-center gap-4 flex-wrap">
        <Box className="w-[200px]">
          <Select
            name="staff"
            control={control}
            placeholder="Select Staff"
            options={staffOptions}
            identifier="booking-staff-filter"
            translate={false}
            disabled={staffOptions.length === 1}
          />
        </Box>

        <Box className="w-[200px]">
          <Select
            name="service"
            control={control}
            placeholder="Select Service"
            options={serviceOptions}
            identifier="booking-service-filter"
            translate={false}
            disabled={serviceOptions.length === 1}
          />
        </Box>

        <Box className="bg-white p-3 shadow-sm flex gap-6 border border-gray-300 rounded-lg">
          <Box className="flex items-center gap-2">
            <Box className="w-3 h-3 rounded-full bg-[#10b981]"></Box>
            <Box className="text-xs font-medium">Confirmed</Box>
          </Box>
          <Box className="flex items-center gap-2">
            <Box className="w-3 h-3 rounded-full bg-[#ef4444]"></Box>
            <Box className="text-xs font-medium">Cancelled</Box>
          </Box>
        </Box>
      </Box>

      <Box className="flex-1 bg-white shadow-sm p-2 border border-gray-300">
        <BookingCalendar
          bookings={filteredBookings}
          onDateRangeChange={handleDateRangeChange}
          updateBookingStatus={updateBookingStatus}
          getStatusColor={getStatusColor}
        />
      </Box>
    </Box>
  );
}
