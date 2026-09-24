import React, { useState } from "react";
import { Bell, Mail, MailOpen, Trash2, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "../../../features/notification/notification-context";
import {
  formatFullNotificationDate,
  getNotificationMetadata,
} from "../../../features/notification/notification-utils";
import { NOTIFICATION_PAGINATION } from "../../../features/notification/notification.constants";
import { cn } from "@/lib/utils";

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleSeeAll = () => {
    setOpen(false);
    navigate("/notifications");
  };

  const handleNotificationClick = (item: any) => {
    if (!item.is_read) {
      markAsRead(item.uuid);
    }
    setOpen(false);

    const meta = getNotificationMetadata(item.type);
    const targetRoute = meta.targetRoute(item.data);
    navigate(targetRoute);
  };

  const displayNotifications = notifications.slice(
    0,
    NOTIFICATION_PAGINATION.DROPDOWN_LIMIT
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground hover:bg-accent/60 hover:text-foreground cursor-pointer shrink-0 transition-colors outline-none"
        title="Notifications"
      >
        <Bell className="h-[1.2rem] w-[1.2rem]" />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white shadow-sm border border-background",
              "bg-blue-600 animate-in zoom-in-50"
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] sm:w-[410px] p-0 overflow-hidden rounded-xl border border-border shadow-2xl bg-popover z-50 text-foreground"
      >
        {/* Header matching image 1 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 bg-muted/15">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base tracking-tight text-foreground">
              Notifications
            </h4>
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSeeAll}
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider cursor-pointer"
          >
            SEE ALL
          </button>
        </div>

        <div className="max-h-[380px] overflow-y-auto custom-scrollbar divide-y divide-border/40">
          {displayNotifications.length === 0 ? (
            <div className="py-12 px-6 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground/60">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  You're all caught up!
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  No new notifications right now.
                </p>
              </div>
            </div>
          ) : (
            displayNotifications.map((item) => {
              const meta = getNotificationMetadata(item.type);
              const Icon = meta.icon;

              return (
                <div
                  key={item.uuid}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative hover:bg-muted/40",
                    !item.is_read && "bg-blue-500/5 dark:bg-blue-500/10"
                  )}
                >
                  {!item.is_read && (
                    <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                  )}

                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                      meta.bgClass,
                      meta.colorClass,
                      meta.borderClass
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0 pr-1">
                    <p className="text-xs font-semibold text-foreground truncate leading-snug">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[11px] text-muted-foreground/75 block mt-1">
                      {formatFullNotificationDate(item.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                    <button
                      type="button"
                      title={item.is_read ? "Mark as unread" : "Mark as read"}
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(item.uuid);
                      }}
                      className="p-1 rounded-md hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      {item.is_read ? (
                        <MailOpen className="w-4 h-4 opacity-50" />
                      ) : (
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.uuid);
                      }}
                      className="p-1 rounded-md hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {displayNotifications.length > 0 && (
          <div className="p-2 border-t border-border/50 bg-muted/10 flex items-center justify-between px-4">
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 py-1 font-medium transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
            <button
              type="button"
              onClick={handleSeeAll}
              className="text-xs text-primary hover:underline font-semibold cursor-pointer"
            >
              View all ({notifications.length})
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
export default NotificationDropdown;
