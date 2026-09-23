import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  Ban,
  CheckCheck,
  Trash2,
  Sparkles,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { NotificationItem, NotificationType } from "./notification.types";

export interface NotificationMeta {
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
  targetRoute: (data?: NotificationItem["data"]) => string;
}

export function getNotificationMetadata(type: NotificationType): NotificationMeta {
  switch (type) {
    case "BOOKING_CREATED":
      return {
        icon: CalendarPlus,
        colorClass: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-emerald-500/10",
        borderClass: "border-emerald-500/20",
        dotClass: "bg-emerald-500",
        targetRoute: () => "/bookings",
      };
    case "BOOKING_CONFIRMED":
      return {
        icon: CheckCircle2,
        colorClass: "text-blue-600 dark:text-blue-400",
        bgClass: "bg-blue-500/10",
        borderClass: "border-blue-500/20",
        dotClass: "bg-blue-500",
        targetRoute: () => "/bookings",
      };
    case "BOOKING_RESCHEDULED":
      return {
        icon: Clock,
        colorClass: "text-amber-600 dark:text-amber-400",
        bgClass: "bg-amber-500/10",
        borderClass: "border-amber-500/20",
        dotClass: "bg-amber-500",
        targetRoute: () => "/bookings",
      };
    case "BOOKING_CANCELLED":
      return {
        icon: Ban,
        colorClass: "text-rose-600 dark:text-rose-400",
        bgClass: "bg-rose-500/10",
        borderClass: "border-rose-500/20",
        dotClass: "bg-rose-500",
        targetRoute: () => "/bookings",
      };
    case "BOOKING_COMPLETED":
      return {
        icon: CheckCheck,
        colorClass: "text-purple-600 dark:text-purple-400",
        bgClass: "bg-purple-500/10",
        borderClass: "border-purple-500/20",
        dotClass: "bg-purple-500",
        targetRoute: () => "/bookings",
      };
    case "BOOKING_DELETED":
      return {
        icon: Trash2,
        colorClass: "text-neutral-500 dark:text-neutral-400",
        bgClass: "bg-neutral-500/10",
        borderClass: "border-neutral-500/20",
        dotClass: "bg-neutral-500",
        targetRoute: () => "/bookings",
      };
    case "SALON_ONBOARDED":
      return {
        icon: Sparkles,
        colorClass: "text-amber-500 dark:text-amber-300",
        bgClass: "bg-amber-500/15",
        borderClass: "border-amber-500/30",
        dotClass: "bg-amber-500",
        targetRoute: () => "/dashboard",
      };
    default:
      return {
        icon: Bell,
        colorClass: "text-primary",
        bgClass: "bg-primary/10",
        borderClass: "border-primary/20",
        dotClass: "bg-primary",
        targetRoute: () => "/notifications",
      };
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (err) {
      console.warn("Could not request notification permission:", err);
      return false;
    }
  }
  return false;
}

export function showBrowserNotification(notification: NotificationItem): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    try {
      const desktopNotif = new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.uuid,
      });

      desktopNotif.onclick = () => {
        window.focus();
        const meta = getNotificationMetadata(notification.type);
        const route = meta.targetRoute(notification.data);
        if (window.location.pathname !== route) {
          window.location.href = route;
        }
      };
    } catch (err) {
      console.warn("Error showing browser notification:", err);
    }
  }
}

export function formatNotificationTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (isNaN(diffInSeconds) || diffInSeconds < 0) return "Just now";
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function formatFullNotificationDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

