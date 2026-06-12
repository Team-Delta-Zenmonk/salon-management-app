import { Box, Typography, ToggleButtonGroup, ToggleButton, Button } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import BookingCalendar from "./_components/booking-calender";
import BookingTable from "./_components/booking-table";
import BookingReceiptDialog from "./_components/booking-receipt-dialog";
import CreateBooking from "./_components/create-booking";
import PageHeader from "../../components/page-header";
import type { Booking, BookingStatus } from "./types/booking.type";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { listBookingsAction } from "../../features/booking/get-bookings/get-bookings.action";
import { updateBookingAction } from "../../features/booking/update-booking/update-booking.action";
import { BOOKING_STATUS } from "../../common/enums/booking-status.enum";
import { BOOKING_SOURCE } from "../../common/enums/booking-source.enum";
import { ALL_SERVICES_VALUE, ALL_STAFF_VALUE, BOOKING_STATUS_COLORS } from "./constants/booking.constants";
import { listStaffAction } from "../../features/staff/list-staff/list-staff.action";
import { listServicesAction } from "../../features/service/list-services/list-service.action";
import Select from "../../components/form/select";
import type { GetBookingsParams } from "../../features/booking/get-bookings/get-bookings.service";

interface FilterForm {
  staff: string;
  service: string;
  payment: string;
}

export default function BookingPage() {
  const dispatch = useAppDispatch();
  const { data: staff } = useAppSelector((state) => state.staff);
  const { data: services } = useAppSelector((state) => state.service);
  const { data: bookings, total, page: statePage, limit, loading } = useAppSelector((state) => state.booking);
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [tablePage, setTablePage] = useState(1);

  const [calendarRange, setCalendarRange] = useState<[Date, Date] | null>(null);

  const { control, watch } = useForm<FilterForm>({
    defaultValues: {
      staff: ALL_STAFF_VALUE,
      service: ALL_SERVICES_VALUE,
      payment: "ALL",
    },
  });

  const selectedStaff = watch("staff");
  const selectedService = watch("service");
  const paymentFilter = watch("payment");

  useEffect(() => {
    dispatch(listStaffAction({ page: 1, limit: 100 }));
    dispatch(listServicesAction({ page: 1, limit: 100 }));
  }, [dispatch]);

  const fetchBookings = useCallback(() => {
    const params: GetBookingsParams = {};

    params.view = viewMode;
    if (paymentFilter !== "ALL") {
      const policyMap: Record<string, string> = {
        FULLY_PAID: "full_upfront",
        DEPOSITED: "partial_deposit",
        PAY_AT_VENUE: "pay_at_venue",
      };
      params.payment_policy = policyMap[paymentFilter];
    }

    if (selectedStaff !== ALL_STAFF_VALUE) {
      params.staff_uuid = selectedStaff;
    }

    if (selectedService !== ALL_SERVICES_VALUE) {
      params.service_uuid = selectedService;
    }

    if (viewMode === "calendar") {
      if (calendarRange) {
        params.start_date = calendarRange[0].toISOString();
        params.end_date = calendarRange[1].toISOString();
      } else {
        params.filter = "month";
      }
    } else {
      params.page = Number(tablePage);
      params.limit = 12;
      params.filter = "month";
    }

    dispatch(listBookingsAction(params));
  }, [dispatch, viewMode, paymentFilter, selectedStaff, selectedService, calendarRange, tablePage]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (viewMode === "table") {
      setTablePage(1);
    }
  }, [paymentFilter, selectedStaff, selectedService]);

  const staffOptions = useMemo(
    () => [
      { label: "All Staff", value: ALL_STAFF_VALUE },
      ...staff.map((s) => {
        const lastName = s.last_name ? ` ${s.last_name}` : "";
        return {
          label: `${s.first_name}${lastName}`,
          value: s.uuid,
        };
      }),
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
    { label: "All Bookings", value: "ALL" },
    { label: "Fully Paid", value: "FULLY_PAID" },
    { label: "Deposited", value: "DEPOSITED" },
    { label: "Pay at Venue", value: "PAY_AT_VENUE" },
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
        customer_name: customerName.replace(/\b\w/g, (c) => c.toUpperCase()),
        customer_email: customerEmail,
        customer_phone: customerPhone,
        service_name: serviceNames.length > 0 ? serviceNames.join(", ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Unknown Service",
        staff_name: staffNames.length > 0 ? staffNames.join(", ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Unknown",
        start_time: booking.booking_start_time,
        end_time: booking.booking_end_time,
        created_by: booking.created_by,
      };
    });
  }, [bookings]);

  const getStatusColor = (status: BookingStatus): string => {
    return BOOKING_STATUS_COLORS[status] ?? "#6b7280";
  };

  const handleCalendarDateRangeChange = (range: [Date, Date]) => {
    setCalendarRange(range);
  };

  const todayBookingsCount = mappedBookings.filter(
    (b) => b.status === BOOKING_STATUS.CONFIRMED && new Date(b.start_time).toDateString() === new Date().toDateString(),
  ).length;

  const updateBookingStatus = (bookingUuid: string, newStatus: BookingStatus) => {
    dispatch(updateBookingAction({ uuid: bookingUuid, body: { status: newStatus } }));
  };

  const handleTablePageChange = (_event: unknown, newPage: number) => {
    setTablePage(Number(newPage) + 1);
  };

  return (
    <Box className="flex flex-col flex-1 min-h-0 w-full space-y-6">
      <PageHeader
        title="Booking Workspace"
        subtitle={`Manage Bookings • Today: ${todayBookingsCount} confirmed bookings`}
        action={<CreateBooking />}
      />

      <Box className="flex flex-col md:flex-row md:items-center gap-4">
        <Box className="flex items-center gap-3 flex-1 min-w-0">
          <Box className="w-[180px]">
            <Select
              name="staff"
              control={control}
              placeholder="All Staff"
              options={staffOptions}
              identifier="booking-staff-filter"
              translate={false}
              disabled={staffOptions.length === 1}
            />
          </Box>
          <Box className="w-[180px]">
            <Select
              name="service"
              control={control}
              placeholder="All Services"
              options={serviceOptions}
              identifier="booking-service-filter"
              translate={false}
              disabled={serviceOptions.length === 1}
            />
          </Box>
          <Box className="w-[180px]">
            <Select
              name="payment"
              control={control}
              placeholder="All Bookings"
              options={paymentOptions}
              identifier="booking-payment-filter"
              translate={false}
            />
          </Box>
        </Box>

        <Box className="flex items-center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => {
              if (newMode !== null) setViewMode(newMode);
            }}
            size="small"
            className="bg-[var(--surface-muted)] p-1 rounded-lg border border-[var(--border-subtle)]"
          >
            <ToggleButton
              value="calendar"
              className={`border-none px-3 py-1.5 rounded-md !transition-all ${viewMode === "calendar" ? "!bg-[var(--surface)] !shadow-sm !text-[var(--text-primary)] border border-[var(--border-subtle)]!" : "!text-[var(--text-muted)]"}`}
            >
              <CalendarMonthIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="table"
              className={`border-none px-3 py-1.5 rounded-md !transition-all ${viewMode === "table" ? "!bg-[var(--surface)] !shadow-sm !text-[var(--text-primary)] border border-[var(--border-subtle)]!" : "!text-[var(--text-muted)]"}`}
            >
              <FormatListBulletedIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {viewMode === "calendar" ? (
        <Box className="flex-1 bg-[var(--surface)] shadow-sm p-3 border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <BookingCalendar
            bookings={mappedBookings}
            onDateRangeChange={handleCalendarDateRangeChange}
            updateBookingStatus={updateBookingStatus}
            getStatusColor={getStatusColor}
          />
        </Box>
      ) : (
        <Box className="flex-1">
          <BookingTable
            bookings={mappedBookings}
            onViewReceipt={(b) => setReceiptBooking(b)}
            total={total}
            page={statePage}
            limit={limit}
            onPageChange={handleTablePageChange}
            loading={loading}
          />
        </Box>
      )}

      <BookingReceiptDialog
        open={Boolean(receiptBooking)}
        onClose={() => setReceiptBooking(null)}
        booking={receiptBooking}
      />
    </Box>
  );
}
