import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { CalendarDays, LayoutList } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import CustomScheduler from "./_components/custom-scheduler";
import CreateBooking from "./_components/create-booking";
import BookingDetailsDialog from "./_components/booking-calender/_components/booking-detail-drawer";
import BookingTable from "./_components/booking-table";
import BookingReceiptDialog from "./_components/booking-receipt-dialog";
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
import { Button } from "@/components/ui/button";
import BookingFilterDialog from "./_components/booking-filter-dialog";

interface FilterForm {
  staff: string;
  service: string;
  payment: string;
}

export default function BookingPage() {
  const dispatch = useAppDispatch();
  const { data: staff } = useAppSelector((state) => state.staff);
  const { data: services } = useAppSelector((state) => state.service);
  const { data: bookings, total, page, limit, loading } = useAppSelector((state) => state.booking);

  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statePage, setStatePage] = useState(1);

  const startDateStr = useMemo(
    () => format(startOfWeek(startOfMonth(currentDate)), "yyyy-MM-dd"),
    [currentDate]
  );
  const endDateStr = useMemo(
    () => format(endOfWeek(endOfMonth(currentDate)), "yyyy-MM-dd"),
    [currentDate]
  );

  const { control, watch } = useForm<FilterForm>({
    defaultValues: {
      staff: ALL_STAFF_VALUE,
      service: ALL_SERVICES_VALUE,
      payment: "ALL",
    },
  });

  const selectedStaff = watch("staff");
  const selectedService = watch("service");
  const selectedPayment = watch("payment");

  useEffect(() => {
    dispatch(listStaffAction({ page: 1, limit: 100 }));
    dispatch(listServicesAction({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      listBookingsAction({
        filter: BOOKING_FILTER.MONTH,
        start_date: startDateStr,
        end_date: endDateStr,
        page: statePage,
        limit: 12,
        view: viewMode,
        payment_policy: selectedPayment !== "ALL" ? selectedPayment : undefined,
        staff_uuid: selectedStaff !== ALL_STAFF_VALUE ? selectedStaff : undefined,
        service_uuid: selectedService !== ALL_SERVICES_VALUE ? selectedService : undefined,
      })
    );
  }, [dispatch, startDateStr, endDateStr, statePage, viewMode, selectedPayment, selectedStaff, selectedService]);

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

  const paymentOptions = [
    { label: "All Payment Modes", value: "ALL" },
    { label: "Pay at Venue", value: "pay_at_venue" },
    { label: "Partial Deposit", value: "partial_deposit" },
    { label: "Full Payment Upfront", value: "full_upfront" },
  ];

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
      const matchesPayment =
        selectedPayment === "ALL" || booking.payment_policy === selectedPayment;

      return matchesStaff && matchesService && matchesPayment;
    });
  }, [mappedBookings, selectedStaff, selectedService, selectedPayment]);

  const getStatusColor = (status: BookingStatus): string => {
    return BOOKING_STATUS_COLORS[status] ?? "#6b7280";
  };

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
    { label: "Confirmed", color: getStatusColor(BOOKING_STATUS.CONFIRMED) },
    { label: "Completed", color: getStatusColor(BOOKING_STATUS.COMPLETED) },
    { label: "Cancelled", color: getStatusColor(BOOKING_STATUS.CANCELLED) },
    { label: "Walk-in", color: "#f59e0b", dotClass: "bg-amber-500" },
    { label: "Online", color: "#10b981", dotClass: "bg-emerald-500" },
  ];

  const liveReceiptBooking = useMemo(() => {
    if (!receiptBooking) return null;
    return mappedBookings.find((b) => b.uuid === receiptBooking.uuid) || receiptBooking;
  }, [mappedBookings, receiptBooking]);

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-8 pb-4 sm:pb-6 shrink-0 gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Manage your salon's appointments, schedule, and payment policies.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
          {/* Mobile filter button */}
          <div className="block sm:hidden">
            <BookingFilterDialog
              control={control}
              staffOptions={staffOptions}
              serviceOptions={serviceOptions}
              paymentOptions={paymentOptions}
              statusLegend={statusLegend}
            />
          </div>
          <CreateBooking />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="px-4 md:px-8 pb-5 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
      >
        <div className="w-full sm:w-auto">
          {/* Desktop inline selects */}
          <div className="hidden sm:flex items-center gap-3">
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
            <div className="w-[190px] [&_button]:bg-card/60 [&_button]:backdrop-blur-md [&_button]:shadow-sm [&_button]:border-border/60 [&_button]:hover:bg-card/80 [&_button]:transition-all [&_button]:text-foreground [&_button]:rounded-md">
              <Select
                name="payment"
                control={control}
                placeholder="All Payment Modes"
                options={paymentOptions}
                identifier="booking-payment-filter"
                translate={false}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:ml-auto w-full sm:w-auto">
          {viewMode === "calendar" && (
            <div className="hidden sm:flex items-center gap-2">
              {statusLegend.map(({ label, color, dotClass }) => (
                <span
                  key={label}
                  className={`inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 px-2 sm:w-[96px] rounded-full border backdrop-blur-sm transition-all border-border/60 bg-card/60 text-muted-foreground`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass || ""}`}
                    style={!dotClass ? { backgroundColor: color } : undefined}
                  />
                  {label}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center p-1 rounded-xl bg-card/60 backdrop-blur-md border border-border/60 shadow-sm gap-1 shrink-0">
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setViewMode("calendar")}
              className={`h-8 px-3 flex-1 sm:flex-initial justify-center rounded-lg font-bold gap-1.5 text-xs transition-all ${
                viewMode === "calendar"
                  ? "bg-background text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setViewMode("table")}
              className={`h-8 px-3 flex-1 sm:flex-initial justify-center rounded-lg font-bold gap-1.5 text-xs transition-all ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              Table
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full px-4 md:px-8 flex-1 flex flex-col"
      >
        {viewMode === "calendar" ? (
          <CustomScheduler
            bookings={filteredBookings}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            updateBookingStatus={(uuid, status) => dispatch(updateBookingAction({ uuid, body: { status } }))}
            getStatusColor={getStatusColor}
            onEventClick={handleEventClick}
          />
        ) : (
          <BookingTable
            bookings={filteredBookings}
            onViewReceipt={(b) => setReceiptBooking(b)}
            total={total}
            page={statePage}
            limit={limit}
            onPageChange={(p) => setStatePage(p)}
            loading={loading}
          />
        )}
      </motion.div>

      {/* Explicit bottom spacer element */}
      <div className="h-16 sm:h-20 w-full shrink-0" />

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

      <BookingReceiptDialog
        open={Boolean(receiptBooking)}
        onClose={() => setReceiptBooking(null)}
        booking={liveReceiptBooking}
      />
    </div>
  );
}
