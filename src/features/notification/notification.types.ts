export type NotificationType =
  | "BOOKING_CREATED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_CANCELLED"
  | "BOOKING_COMPLETED"
  | "BOOKING_DELETED"
  | "SALON_ONBOARDED";

export interface NotificationData {
  booking_uuid?: string;
  customer_id?: number;
  customer_name?: string;
  total_price?: number;
  source?: "CUSTOMER" | "ADMIN" | "STAFF";
  [key: string]: any;
}

export interface NotificationItem {
  id: number;
  uuid: string;
  salon_id: number;
  booking_id?: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  data: NotificationItem[];
  total: number;
  current_page: number;
  per_page: number;
  unread_notification_count: number;
}

