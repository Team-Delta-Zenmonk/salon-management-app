import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useMemo, useState } from "react";
import type { Booking, BookingStatus } from "../../types/booking.type";
import BookingEvent from "./_components/booking-events";
import styles from "./booking-calender.module.scss";
import { Box } from "@mui/material";
import BookingDetailsDrawer from "./_components/booking-detail-drawer";
import { DEFAULT_SLOT_DURATION, DEFAULT_SLOT_MAX_TIME, DEFAULT_SLOT_MIN_TIME } from "../../constants/booking.constants";
import { BOOKING_STATUS } from "../../../../common/enums/booking-status.enum";

interface BookingCalendarProps {
  bookings: Booking[];
  onDateRangeChange: (range: [Date, Date]) => void;
  updateBookingStatus: (bookingUuid: string, newStatus: BookingStatus) => void;
  getStatusColor: (status: BookingStatus) => string;
}

export default function BookingCalendar({
  bookings,
  onDateRangeChange,
  updateBookingStatus,
  getStatusColor,
}: Readonly<BookingCalendarProps>) {
  const [currentView, setCurrentView] = useState("timeGridWeek");

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleDatesSet = (arg: any) => {
    setCurrentView(arg.view.type);
    onDateRangeChange([arg.start, arg.end]);
  };

  const handleEventClick = (info: any) => {
    const booking = info.event.extendedProps as Booking;
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const eventContent = (arg: any) => {
    const booking = arg.event.extendedProps as Booking;
    const color = getStatusColor(booking.status);
    const isCancelled = booking.status === BOOKING_STATUS.CANCELLED;

    return <BookingEvent booking={booking} color={color} isCancelled={isCancelled} />;
  };

  let dayMaxEvents: number | false = false;
  if (currentView === "dayGridMonth") dayMaxEvents = 1;
  const eventMaxStack = currentView === "timeGridWeek" ? 1 : undefined;

  const selectedBookingLatest = useMemo(() => {
    if (!selectedBooking) return null;
    return bookings.find((b) => b.uuid === selectedBooking.uuid) ?? selectedBooking;
  }, [bookings, selectedBooking]);

  return (
    <>
      <Box className={styles.calendarWrapper}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={bookings.map((booking) => ({
            id: booking.uuid,
            title: `${booking.customer_name} - ${booking.service_name}`,
            start: booking.start_time,
            end: booking.end_time,
            backgroundColor: "transparent",
            borderColor: "transparent",
            extendedProps: booking,
          }))}
          eventClick={handleEventClick}
          eventContent={eventContent}
          datesSet={handleDatesSet}
          height="100%"
          timeZone="UTC"
          slotMinTime={DEFAULT_SLOT_MIN_TIME}
          slotMaxTime={DEFAULT_SLOT_MAX_TIME}
          allDaySlot={false}
          slotDuration={DEFAULT_SLOT_DURATION}
          slotLabelInterval="01:00:00"
          expandRows={true}
          dayMaxEvents={dayMaxEvents}
          {...(eventMaxStack !== undefined && { eventMaxStack })}
          nowIndicator={true}
          editable={false}
          selectable={false}
        />
      </Box>

      <BookingDetailsDrawer
        open={detailsOpen}
        booking={selectedBookingLatest}
        onClose={() => setDetailsOpen(false)}
        getStatusColor={getStatusColor}
        onCancel={(uuid: any) => updateBookingStatus(uuid, BOOKING_STATUS.CANCELLED)}
      />
    </>
  );
}
