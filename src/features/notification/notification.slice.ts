import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { NotificationItem } from "./notification.types";
import { getNotificationsAction } from "./get-notifications/get-notifications.action";
import { NOTIFICATION_PAGINATION } from "./notification.constants";

export interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  total: 0,
  page: NOTIFICATION_PAGINATION.DEFAULT_PAGE,
  limit: NOTIFICATION_PAGINATION.DEFAULT_LIMIT,
  loading: false,
  isFetchingMore: false,
  hasMore: false,
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    resetNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
      state.total = 0;
      state.page = NOTIFICATION_PAGINATION.DEFAULT_PAGE;
      state.loading = false;
      state.isFetchingMore = false;
      state.hasMore = false;
    },
    addRealtimeNotification(state, action: PayloadAction<NotificationItem>) {
      const newNotification = action.payload;
      if (!state.notifications.some((n) => n.uuid === newNotification.uuid)) {
        state.notifications.unshift(newNotification);
        state.unreadCount += 1;
        state.total += 1;
      }
    },
    markNotificationAsReadLocally(state, action: PayloadAction<string>) {
      const uuid = action.payload;
      const target = state.notifications.find((n) => n.uuid === uuid);
      if (target && !target.is_read) {
        target.is_read = true;
        target.read_at = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsAsReadLocally(state) {
      state.notifications.forEach((n) => {
        n.is_read = true;
        n.read_at = new Date().toISOString();
      });
      state.unreadCount = 0;
    },
    removeNotificationLocally(state, action: PayloadAction<string>) {
      const uuid = action.payload;
      const target = state.notifications.find((n) => n.uuid === uuid);
      if (target && !target.is_read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter((n) => n.uuid !== uuid);
      state.total = Math.max(0, state.total - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotificationsAction.pending, (state, { meta }) => {
        const page = meta.arg?.page ?? NOTIFICATION_PAGINATION.DEFAULT_PAGE;
        if (page === NOTIFICATION_PAGINATION.DEFAULT_PAGE) {
          state.loading = true;
        } else {
          state.isFetchingMore = true;
        }
      })
      .addCase(getNotificationsAction.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.isFetchingMore = false;
        const currentPage = payload.current_page ?? NOTIFICATION_PAGINATION.DEFAULT_PAGE;

        if (currentPage === NOTIFICATION_PAGINATION.DEFAULT_PAGE) {
          state.notifications = payload.data || [];
        } else {
          const existingUuids = new Set(state.notifications.map((n) => n.uuid));
          const freshItems = (payload.data || []).filter((n) => !existingUuids.has(n.uuid));
          state.notifications = [...state.notifications, ...freshItems];
        }

        state.total = payload.total ?? state.notifications.length;
        state.page = currentPage;
        state.limit = payload.per_page ?? NOTIFICATION_PAGINATION.DEFAULT_LIMIT;
        state.unreadCount = payload.unread_notification_count ?? 0;
        state.hasMore = state.notifications.length < state.total;
      })
      .addCase(getNotificationsAction.rejected, (state) => {
        state.loading = false;
        state.isFetchingMore = false;
      });
  },
});

export const {
  resetNotifications,
  addRealtimeNotification,
  markNotificationAsReadLocally,
  markAllNotificationsAsReadLocally,
  removeNotificationLocally,
} = notificationSlice.actions;

export default notificationSlice.reducer;
