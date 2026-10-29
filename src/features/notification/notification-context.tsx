import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import type { NotificationItem } from "./notification.types";
import { getNotificationsAction } from "./get-notifications/get-notifications.action";
import {
  resetNotifications,
  addRealtimeNotification,
  markNotificationAsReadLocally,
  markAllNotificationsAsReadLocally,
  removeNotificationLocally,
} from "./notification.slice";
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
  isFetchingMore: boolean;
  hasMore: boolean;
  fetchNotifications: (targetPage?: number, isReadFilter?: boolean) => Promise<void>;
  markAsRead: (uuid: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (uuid: string) => Promise<void>;
  requestPermission: () => Promise<boolean>;
  onThemePurchasedEvent?: (callback: (data: unknown) => void) => () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, salon } = useAppSelector((state: RootState) => state.auth);
  const {
    notifications,
    unreadCount,
    total,
    page,
    loading,
    isFetchingMore,
    hasMore,
  } = useAppSelector((state: RootState) => state.notification);

  const isInitialFetchDone = React.useRef(false);

  const fetchNotifications = useCallback(
    async (
      targetPage: number = NOTIFICATION_PAGINATION.DEFAULT_PAGE,
      isReadFilter?: boolean
    ) => {
      if (!isAuthenticated) return;
      try {
        await dispatch(
          getNotificationsAction({
            page: targetPage,
            limit: NOTIFICATION_PAGINATION.DEFAULT_LIMIT,
            is_read: isReadFilter,
          })
        ).unwrap();
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    },
    [dispatch, isAuthenticated]
  );

  const handleNotificationReceived = useCallback(
    (newNotification: NotificationItem) => {
      dispatch(addRealtimeNotification(newNotification));
      callSnack(newNotification.title, "info");
      showBrowserNotification(newNotification);
    },
    [dispatch]
  );

  const themePurchasedListenersRef = React.useRef<Set<(data: unknown) => void>>(new Set());

  const onThemePurchasedEvent = useCallback((callback: (data: unknown) => void) => {
    themePurchasedListenersRef.current.add(callback);
    return () => {
      themePurchasedListenersRef.current.delete(callback);
    };
  }, []);

  const handleThemePurchased = useCallback((data: unknown) => {
    themePurchasedListenersRef.current.forEach((cb) => {
      try {
        cb(data);
      } catch (e) {
        console.error("Error in themePurchased listener:", e);
      }
    });
  }, []);

  useNotificationSocket({
    salonId: salon?.id,
    enabled: isAuthenticated,
    onNotificationReceived: handleNotificationReceived,
    onThemePurchased: handleThemePurchased,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(resetNotifications());
      isInitialFetchDone.current = false;
      return;
    }

    if (isInitialFetchDone.current) return;
    isInitialFetchDone.current = true;

    requestNotificationPermission();
    fetchNotifications(NOTIFICATION_PAGINATION.DEFAULT_PAGE);
  }, [dispatch, isAuthenticated, fetchNotifications]);

  const markAsRead = useCallback(
    async (uuid: string) => {
      dispatch(markNotificationAsReadLocally(uuid));
      try {
        await markNotificationReadService(uuid);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        fetchNotifications(page);
      }
    },
    [dispatch, fetchNotifications, page]
  );

  const markAllAsRead = useCallback(async () => {
    dispatch(markAllNotificationsAsReadLocally());
    try {
      await markAllNotificationsReadService();
      callSnack("All notifications marked as read", "success");
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      fetchNotifications(page);
    }
  }, [dispatch, fetchNotifications, page]);

  const deleteNotification = useCallback(
    async (uuid: string) => {
      dispatch(removeNotificationLocally(uuid));
      try {
        await deleteNotificationService(uuid);
        callSnack("Notification removed", "info");
      } catch (err) {
        console.error("Failed to delete notification:", err);
        fetchNotifications(page);
      }
    },
    [dispatch, fetchNotifications, page]
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
      isFetchingMore,
      hasMore,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      requestPermission,
      onThemePurchasedEvent,
    }),
    [
      notifications,
      unreadCount,
      total,
      page,
      loading,
      isFetchingMore,
      hasMore,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      requestPermission,
      onThemePurchasedEvent,
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
