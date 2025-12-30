export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  uuid: string;
  customer_name: string;
  customer_email?: string;
  service_uuid: string;
  service_name: string;
  staff_uuid: string;
  staff_name: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes?: string;
};