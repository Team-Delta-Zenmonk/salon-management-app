import { Box, Typography } from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import BookingCalendar from "./_components/booking-calender";
import CreateBooking from "./_components/create-booking";
import type { BookingStatus } from "./types/booking.type";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { listBookingsAction } from "../../features/booking/get-bookings/get-bookings.action";
import { updateBookingAction } from "../../features/booking/update-booking/update-booking.action";
import { BOOKING_STATUS } from "../../common/enums/booking-status.enum";
import { BOOKING_FILTER } from "../../common/enums/booking-filter.enum";
import { BOOKING_SOURCE } from "../../common/enums/booking-source.enum";
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
  const { data: bookings } = useAppSelector((state) => state.booking);
  const [selectedRange, setSelectedRange] = useState<[Date, Date] | null>(null);

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
    dispatch(listBookingsAction({ filter: BOOKING_FILTER.MONTH })); // Load all for the month by default
  }, [dispatch]);

  const staffOptions = useMemo(
    () => [
      { label: "All Staff", value: ALL_STAFF_VALUE },
      ...staff.map((s) => ({
        label: `${s.first_name}${s.last_name ? ` ${s.last_name}` : ""}`,
        value: s.uuid,
      })),
    ],
    [staff],
  );

  const serviceOptions = useMemo(
    () => [
      { label: "All Services", value: ALL_SERVICES_VALUE },
      ...services.map((s) => ({
        label: s.name,
        value: s.uuid,
      })),
    ],
    [services],
  );

  const mappedBookings = useMemo(() => {
    return bookings.map((booking) => {
      const bookingServices = booking.booking_services ?? [];
      const isCustomerBooking = booking.created_by === BOOKING_SOURCE.CUSTOMER;

      const customerName = isCustomerBooking
        ? booking.customer?.name || "Registered Customer"
        : booking.admin_booking?.name || "Walk-in Customer";

      const customerEmail = isCustomerBooking ? booking.customer?.email || "" : "";

      const customerPhone = isCustomerBooking ? "" : booking.admin_booking?.phone || "";

      const serviceNames = bookingServices.map((bs: any) => bs.service?.name).filter(Boolean);
      const staffNames = [
        ...new Set(
          bookingServices
            .map((bs: any) => {
              const first = bs.staff?.first_name || "";
              const last = bs.staff?.last_name || "";
              return `${first} ${last}`.trim();
            })
            .filter(Boolean),
        ),
      ];

      return {
        ...booking,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        service_name: serviceNames.length > 0 ? serviceNames.join(", ") : "Unknown Service",
        staff_name: staffNames.length > 0 ? staffNames.join(", ") : "Unknown",
        start_time: booking.booking_start_time,
        end_time: booking.booking_end_time,
        created_by: booking.created_by,
      };
    });
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return mappedBookings.filter((booking: any) => {
      const services = booking.booking_services ?? [];
      const matchesStaff =
        selectedStaff === ALL_STAFF_VALUE || services.some((bs: any) => bs.staff?.uuid === selectedStaff);
      const matchesService =
        selectedService === ALL_SERVICES_VALUE || services.some((bs: any) => bs.service?.uuid === selectedService);
      return matchesStaff && matchesService;
    });
  }, [mappedBookings, selectedStaff, selectedService]);

  const getStatusColor = (status: BookingStatus): string => {
    return BOOKING_STATUS_COLORS[status] ?? "#6b7280";
  };

  const handleDateRangeChange = (range: [Date, Date]) => {
    setSelectedRange(range);
  };

  const todayBookingsCount = filteredBookings.filter(
    (b) => b.status === BOOKING_STATUS.CONFIRMED && new Date(b.start_time).toDateString() === new Date().toDateString(),
  ).length;

  const updateBookingStatus = (bookingUuid: string, newStatus: BookingStatus) => {
    dispatch(updateBookingAction({ uuid: bookingUuid, body: { status: newStatus } }));
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
