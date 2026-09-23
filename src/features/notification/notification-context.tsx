import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import type { NotificationItem } from "./notification.types";
import { fetchNotificationsService } from "./get-notifications/get-notifications.service";
import { markNotificationReadService } from "./mark-notification-read/mark-notification-read.service";
import { markAllNotificationsReadService } from "./mark-all-notifications-read/mark-all-notifications-read.service";
import { deleteNotificationService } from "./delete-notification/delete-notification.service";
import {
  showBrowserNotification,
  requestNotificationPermission,
} from "./notification-utils";
import { NOTIFICATION_PAGINATION } from "./notification.constants";
import { useNotificationSocket } from "./hooks/use-notification-socket";
import { callSnack } from "../../components/snackbar";

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  total: number;
  page: number;
  loading: boolean;
  fetchNotifications: (targetPage?: number, isReadFilter?: boolean) => Promise<void>;
  markAsRead: (uuid: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (uuid: string) => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, salon } = useAppSelector((state: RootState) => state.auth);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(NOTIFICATION_PAGINATION.DEFAULT_PAGE);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(
    async (
      targetPage: number = NOTIFICATION_PAGINATION.DEFAULT_PAGE,
      isReadFilter?: boolean
    ) => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const res = await fetchNotificationsService({
          page: targetPage,
          limit: NOTIFICATION_PAGINATION.DEFAULT_LIMIT,
          is_read: isReadFilter,
        });

        if (res?.data && Array.isArray(res.data)) {
          setNotifications(res.data);
          setTotal(res.total ?? res.data.length);
          setPage(res.current_page ?? targetPage);
          setUnreadCount(res.unread_notification_count ?? 0);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const handleNotificationReceived = useCallback((newNotification: NotificationItem) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.uuid === newNotification.uuid)) return prev;
      return [newNotification, ...prev];
    });
    setUnreadCount((prev) => prev + 1);
    setTotal((prev) => prev + 1);

    callSnack(newNotification.title, "info");
    showBrowserNotification(newNotification);
  }, []);

  useNotificationSocket({
    salonId: salon?.id,
    enabled: isAuthenticated,
    onNotificationReceived: handleNotificationReceived,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setTotal(0);
      return;
    }

    requestNotificationPermission();
    fetchNotifications(NOTIFICATION_PAGINATION.DEFAULT_PAGE);
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = useCallback(
    async (uuid: string) => {
      let wasUnread = false;
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.uuid === uuid) {
            if (!n.is_read) wasUnread = true;
            return { ...n, is_read: true, read_at: new Date().toISOString() };
          }
          return n;
        })
      );

      if (!wasUnread) return;

      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await markNotificationReadService(uuid);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        fetchNotifications(page);
      }
    },
    [fetchNotifications, page]
  );

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsReadService();
      callSnack("All notifications marked as read", "success");
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      fetchNotifications(page);
    }
  }, [fetchNotifications, page]);

  const deleteNotification = useCallback(
    async (uuid: string) => {
      setNotifications((prev) => {
        const target = prev.find((n) => n.uuid === uuid);
        if (target && !target.is_read) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.uuid !== uuid);
      });
      setTotal((prev) => Math.max(0, prev - 1));

      try {
        await deleteNotificationService(uuid);
        callSnack("Notification removed", "info");
      } catch (err) {
        console.error("Failed to delete notification:", err);
        fetchNotifications(page);
      }
    },
    [fetchNotifications, page]
  );

  const requestPermission = useCallback(() => {
    return requestNotificationPermission();
  }, []);

  const contextValue = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      total,
      page,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      requestPermission,
    }),
    [
      notifications,
      unreadCount,
      total,
      page,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      requestPermission,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
