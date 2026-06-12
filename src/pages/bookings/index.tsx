import { Box, Typography, ToggleButtonGroup, ToggleButton, Button } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import BookingCalendar from "./_components/booking-calender";
import BookingTable from "./_components/booking-table";
import BookingReceiptDialog from "./_components/booking-receipt-dialog";
import CreateBooking from "./_components/create-booking";
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
}

export default function BookingPage() {
  const dispatch = useAppDispatch();
  const { data: staff } = useAppSelector((state) => state.staff);
  const { data: services } = useAppSelector((state) => state.service);
  const { data: bookings, total, page: statePage, limit, loading } = useAppSelector((state) => state.booking);
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [tablePage, setTablePage] = useState(1);

  // Calendar date range from FullCalendar's datesSet
  const [calendarRange, setCalendarRange] = useState<[Date, Date] | null>(null);

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

  // Build and dispatch server-side query
  const fetchBookings = useCallback(() => {
    const params: GetBookingsParams = {};

    // View mode
    params.view = viewMode;

    // Payment filter
    if (paymentFilter !== "ALL") {
      const policyMap: Record<string, string> = {
        FULLY_PAID: "full_upfront",
        DEPOSITED: "partial_deposit",
        PAY_AT_VENUE: "pay_at_venue",
      };
      params.payment_policy = policyMap[paymentFilter];
    }

    // Staff filter
    if (selectedStaff !== ALL_STAFF_VALUE) {
      params.staff_uuid = selectedStaff;
    }

    // Service filter
    if (selectedService !== ALL_SERVICES_VALUE) {
      params.service_uuid = selectedService;
    }

    if (viewMode === "calendar") {
      if (calendarRange) {
        params.start_date = calendarRange[0].toISOString();
        params.end_date = calendarRange[1].toISOString();
      } else {
        // Default: current month
        params.filter = "month";
      }
    } else {
      // Table view: paginated, sorted by created_at DESC
      params.page = Number(tablePage);
      params.limit = 12;
      params.filter = "month";
    }

    dispatch(listBookingsAction(params));
  }, [dispatch, viewMode, paymentFilter, selectedStaff, selectedService, calendarRange, tablePage]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset table page when filters change
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

  // Map raw bookings to display format (no client-side filtering)
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
    // newPage is 0-based from TablePagination, convert to 1-based
    setTablePage(Number(newPage) + 1);
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

      <Box className="flex items-center gap-4 flex-wrap bg-white p-3 rounded-xl border border-gray-200">
        <Box className="flex items-center gap-3 flex-1 min-w-0">
          <Box className="w-[180px]">
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
          <Box className="w-[180px]">
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
          <Box className="h-6 w-px bg-gray-300 mx-2"></Box>
          <Box className="flex items-center gap-3">
            <Typography variant="caption" fontWeight="bold" className="text-gray-400 uppercase tracking-wider">
              FILTER PAYMENT:
            </Typography>
            <Box className="flex bg-white rounded-lg p-0.5 border border-gray-100 shadow-sm gap-[2px]">
              <Button
                variant={paymentFilter === "ALL" ? "contained" : "text"}
                size="small"
                onClick={() => setPaymentFilter("ALL")}
                className={`min-w-0 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase shadow-none transition-all ${
                  paymentFilter === "ALL" ? "bg-[var(--primary-800)] text-white" : "text-[var(--primary-800)] hover:bg-[var(--primary-50)]"
                }`}
              >
                All Bookings
              </Button>
              <Button
                variant={paymentFilter === "FULLY_PAID" ? "contained" : "text"}
                size="small"
                onClick={() => setPaymentFilter("FULLY_PAID")}
                className={`min-w-0 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase shadow-none transition-all ${
                  paymentFilter === "FULLY_PAID" ? "bg-[var(--primary-800)] text-white" : "text-[var(--primary-800)] hover:bg-[var(--primary-50)]"
                }`}
              >
                Fully Paid
              </Button>
              <Button
                variant={paymentFilter === "DEPOSITED" ? "contained" : "text"}
                size="small"
                onClick={() => setPaymentFilter("DEPOSITED")}
                className={`min-w-0 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase shadow-none transition-all ${
                  paymentFilter === "DEPOSITED" ? "bg-[var(--primary-800)] text-white" : "text-[var(--primary-800)] hover:bg-[var(--primary-50)]"
                }`}
              >
                Deposited
              </Button>
              <Button
                variant={paymentFilter === "PAY_AT_VENUE" ? "contained" : "text"}
                size="small"
                onClick={() => setPaymentFilter("PAY_AT_VENUE")}
                className={`min-w-0 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase shadow-none transition-all ${
                  paymentFilter === "PAY_AT_VENUE" ? "bg-[var(--primary-800)] text-white" : "text-[var(--primary-800)] hover:bg-[var(--primary-50)]"
                }`}
              >
                Pay at Venue
              </Button>
            </Box>
          </Box>
        </Box>

        <Box className="flex items-center ml-auto">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => {
              if (newMode !== null) setViewMode(newMode);
            }}
            size="small"
            className="bg-gray-50 p-1 rounded-lg border border-gray-200"
          >
            <ToggleButton
              value="calendar"
              className={`border-none px-2.5 py-1.5 rounded-md !transition-all ${viewMode === "calendar" ? "!bg-white !shadow-sm !text-gray-900" : "!text-gray-400"}`}
            >
              <CalendarMonthIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="table"
              className={`border-none px-2.5 py-1.5 rounded-md !transition-all ${viewMode === "table" ? "!bg-white !shadow-sm !text-gray-900" : "!text-gray-400"}`}
            >
              <FormatListBulletedIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {viewMode === "calendar" ? (
        <Box className="flex-1 bg-white shadow-sm p-2 border border-gray-300 rounded-lg">
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
