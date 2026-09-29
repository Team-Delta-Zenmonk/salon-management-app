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
        colorClass: "text-primary",
        bgClass: "bg-primary/10",
        borderClass: "border-primary/20",
        dotClass: "bg-primary",
        targetRoute: () => "/bookings",
      };
    case "BOOKING_CONFIRMED":
      return {
        icon: CheckCircle2,
        colorClass: "text-primary",
        bgClass: "bg-primary/10",
        borderClass: "border-primary/20",
        dotClass: "bg-primary",
        targetRoute: () => "/bookings",
      };
    case "BOOKING_RESCHEDULED":
      return {
        icon: Clock,
        colorClass: "text-primary",
        bgClass: "bg-primary/10",
        borderClass: "border-primary/20",
        dotClass: "bg-primary",
        targetRoute: () => "/bookings",
      };
    case "BOOKING_CANCELLED":
      return {
        icon: Ban,
        colorClass: "text-destructive",
        bgClass: "bg-destructive/10",
        borderClass: "border-destructive/20",
        dotClass: "bg-destructive",
        targetRoute: () => "/bookings",
      };
    case "BOOKING_COMPLETED":
      return {
        icon: CheckCheck,
        colorClass: "text-primary",
        bgClass: "bg-primary/10",
        borderClass: "border-primary/20",
        dotClass: "bg-primary",
        targetRoute: () => "/bookings",
      };
    case "BOOKING_DELETED":
      return {
        icon: Trash2,
        colorClass: "text-muted-foreground",
        bgClass: "bg-muted",
        borderClass: "border-border",
        dotClass: "bg-muted-foreground",
        targetRoute: () => "/bookings",
      };
    case "SALON_ONBOARDED":
      return {
        icon: Sparkles,
        colorClass: "text-primary",
        bgClass: "bg-primary/10",
        borderClass: "border-primary/20",
        dotClass: "bg-primary",
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

