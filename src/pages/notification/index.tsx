import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  MoreHorizontal,
  MailOpen,
  ArrowRight,
} from "lucide-react";
import { useNotifications } from "../../features/notification/notification-context";
import {
  formatNotificationTime,
  getNotificationMetadata,
} from "../../features/notification/notification-utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function NotificationPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.is_read);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleActionClick = (item: any) => {
    if (!item.is_read) {
      markAsRead(item.uuid);
    }
    const meta = getNotificationMetadata(item.type);
    navigate(meta.targetRoute(item.data));
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-background pb-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-8 pb-6 shrink-0 gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="text-muted-foreground/80 text-sm">
            Stay updated on new bookings, customer reschedules, and salon activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="rounded-full gap-2 text-xs font-semibold shadow-xs shrink-0 cursor-pointer hover:bg-muted/80"
          >
            <CheckCheck className="w-3.5 h-3.5 text-primary" />
            Mark all as read ({unreadCount})
          </Button>
        )}
      </motion.div>

      <div className="w-full max-w-[1400px] px-4 md:px-8 space-y-6">

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "unread"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                  activeTab === "unread"
                    ? "bg-primary-foreground text-primary"
                    : "bg-blue-600 text-white"
                )}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl overflow-hidden shadow-xs divide-y divide-border/40">
          {filteredNotifications.length === 0 ? (
            <div className="py-20 px-6 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground/70">
                <Bell className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  {activeTab === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {activeTab === "unread"
                    ? "You've read all your notifications. Great job keeping up!"
                    : "When bookings are created, updated, or cancelled, alerts will show up right here."}
                </p>
              </div>
              {activeTab === "unread" && notifications.length > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setActiveTab("all")}
                  className="text-primary text-xs font-semibold cursor-pointer mt-1"
                >
                  View all notifications
                </Button>
              )}
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const meta = getNotificationMetadata(item.type);
              const Icon = meta.icon;
              const hasBookingTarget = Boolean(
                item.data?.booking_uuid || item.booking_id || item.type?.startsWith("BOOKING_")
              );

              return (
                <div
                  key={item.uuid}
                  onClick={() => handleActionClick(item)}
                  className={cn(
                    "p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4 transition-colors cursor-pointer group relative",
                    "hover:bg-muted/40",
                    !item.is_read && "bg-blue-500/[0.04] dark:bg-blue-500/[0.08]"
                  )}
                >
                  <div className="w-2.5 shrink-0 flex items-center justify-center pt-2">
                    {!item.is_read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 ring-4 ring-blue-500/20 shrink-0" />
                    )}
                  </div>

                  <div
                    className={cn(
                      "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border shadow-xs transition-transform group-hover:scale-105",
                      meta.bgClass,
                      meta.colorClass,
                      meta.borderClass
                    )}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm leading-relaxed text-foreground">
                      <span className="font-semibold text-foreground mr-1.5">
                        {item.title}
                      </span>
                      <span className="text-muted-foreground">{item.message}</span>
                    </p>

                    {hasBookingTarget && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(item);
                          }}
                          className="h-7 text-xs rounded-full px-3.5 gap-1.5 font-semibold text-primary hover:text-primary border-primary/30 hover:bg-primary/10 cursor-pointer shadow-2xs"
                        >
                          View Booking
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 self-start pt-0.5">
                    <span className="text-xs font-medium text-muted-foreground/75 whitespace-nowrap">
                      {formatNotificationTime(item.created_at)}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors outline-none"
                        title="Options"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 p-1 rounded-xl z-50">
                        {!item.is_read ? (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(item.uuid);
                            }}
                            className="text-xs font-medium gap-2 cursor-pointer py-2"
                          >
                            <Check className="w-3.5 h-3.5 text-blue-600" />
                            Mark as read
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(item.uuid);
                            }}
                            className="text-xs font-medium gap-2 cursor-pointer py-2 text-muted-foreground"
                          >
                            <MailOpen className="w-3.5 h-3.5" />
                            Already read
                          </DropdownMenuItem>
                        )}

                        {hasBookingTarget && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionClick(item);
                            }}
                            className="text-xs font-medium gap-2 cursor-pointer py-2"
                          >
                            <ArrowRight className="w-3.5 h-3.5 text-primary" />
                            Go to bookings
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(item.uuid);
                          }}
                          className="text-xs font-medium gap-2 text-destructive cursor-pointer py-2 focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
