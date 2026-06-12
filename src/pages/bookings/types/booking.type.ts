import { type BookingStatus as Status } from "../../../common/enums/booking-status.enum";

export type BookingStatus = Status;

export type BookingServiceItem = {
  service_id: number;
  staff_id: number;
  sequence: number;
  duration_minutes: number;
  price: number;
  start_time: string;
  end_time: string;
  service?: {
    uuid: string;
    name: string;
  };
  staff?: {
    uuid: string;
    first_name: string;
    last_name?: string;
  };
};

export type Booking = {
  uuid: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  service_name: string;
  staff_name: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_by: string;
  notes?: string;
  total_price?: number;
  total_duration?: number;
  booking_services?: BookingServiceItem[];
  admin_booking?: {
    name?: string;
    phone?: string;
  };
  payment_policy?: 'pay_at_venue' | 'partial_deposit' | 'full_upfront';
  deposit_amount?: number;
  amount_paid_online?: number;
  [key: string]: any;
};
