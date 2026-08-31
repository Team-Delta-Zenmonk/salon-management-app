import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import CustomScheduler from "./_components/custom-scheduler";
import CreateBooking from "./_components/create-booking";
import BookingDetailsDialog from "./_components/booking-calender/_components/booking-detail-drawer";
import type { Booking, BookingStatus } from "./types/booking.type";
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

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    dispatch(listBookingsAction({ filter: BOOKING_FILTER.MONTH }));
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

  const serviceOptions = useMemo(() => {
    const parentIds = new Set<number>();
    services.forEach((s: any) => {
      if (s.parent_id) parentIds.add(s.parent_id);
    });
    return [
      { label: "All Services", value: ALL_SERVICES_VALUE },
      ...services
        .filter((s: any) => !parentIds.has(s.id))
        .map((s: any) => ({ label: s.name, value: s.uuid })),
    ];
  }, [services]);

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
            .map((bs: any) => `${bs.staff?.first_name || ""} ${bs.staff?.last_name || ""}`.trim())
            .filter(Boolean)
        ),
      ];

      return {
        ...booking,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        service_name: serviceNames.length > 0 ? serviceNames.join(", ") : "Unknown Service",
        staff_name: staffNames.length > 0 ? staffNames.join(", ") : "Unknown",
        start_time: booking.booking_start_time?.endsWith('Z') ? booking.booking_start_time.slice(0, -1) : booking.booking_start_time,
        end_time: booking.booking_end_time?.endsWith('Z') ? booking.booking_end_time.slice(0, -1) : booking.booking_end_time,
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

  const todayBookingsCount = filteredBookings.filter(
    (b) =>
      (b.status === BOOKING_STATUS.CONFIRMED || b.status === BOOKING_STATUS.PENDING) &&
      new Date(b.start_time).toDateString() === new Date().toDateString(),
  ).length;

  const handleEventClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDrawerOpen(true);
  };

  const handleCancel = (bookingUuid: string, reason?: string) => {
    dispatch(updateBookingAction({ uuid: bookingUuid, body: { status: BOOKING_STATUS.CANCELLED, notes: reason } }));
    setIsDrawerOpen(false);
    setSelectedBooking(null);
  };

  const statusLegend = [
    { status: BOOKING_STATUS.CONFIRMED, label: "Confirmed" },
    { status: BOOKING_STATUS.COMPLETED, label: "Completed" },
    { status: BOOKING_STATUS.CANCELLED, label: "Cancelled" },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-8 pb-6 shrink-0 gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Manage your salon's appointments and schedulets.
          </p>
        </div>
        <div className="shrink-0">
          <CreateBooking />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="px-4 md:px-8 pb-5 shrink-0 flex items-center gap-3 flex-wrap"
      >
        <div className="w-[175px] [&_button]:bg-card/60 [&_button]:backdrop-blur-md [&_button]:shadow-sm [&_button]:border-border/60 [&_button]:hover:bg-card/80 [&_button]:transition-all [&_button]:text-foreground [&_button]:rounded-md">
          <Select
            name="staff"
            control={control}
            placeholder="All Staff"
            options={staffOptions}
            identifier="booking-staff-filter"
            translate={false}
            disabled={staffOptions.length === 1}
          />
        </div>
        <div className="w-[175px] [&_button]:bg-card/60 [&_button]:backdrop-blur-md [&_button]:shadow-sm [&_button]:border-border/60 [&_button]:hover:bg-card/80 [&_button]:transition-all [&_button]:text-foreground [&_button]:rounded-md">
          <Select
            name="service"
            control={control}
            placeholder="All Services"
            options={serviceOptions}
            identifier="booking-service-filter"
            translate={false}
            disabled={serviceOptions.length === 1}
          />
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {statusLegend.map(({ status, label }) => {
            const color = getStatusColor(status);
            return (
              <span
                key={status}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-border bg-card/65 text-muted-foreground"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                {label}
              </span>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 px-4 md:px-8 pb-8 overflow-hidden"
      >
        <CustomScheduler
          bookings={filteredBookings}
          updateBookingStatus={(uuid, status) => dispatch(updateBookingAction({ uuid, body: { status } }))}
          getStatusColor={getStatusColor}
          onEventClick={handleEventClick}
        />
      </motion.div>

      <BookingDetailsDialog
        open={isDrawerOpen}
        booking={selectedBooking}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedBooking(null);
        }}
        getStatusColor={getStatusColor}
        onCancel={handleCancel}
      />
    </div>
  );
}
