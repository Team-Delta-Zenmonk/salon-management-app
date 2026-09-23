import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { NotificationItem } from "../notification.types";
import {
  NOTIFICATION_SOCKET_CONFIG,
  NOTIFICATION_SOCKET_EVENTS,
} from "../notification.constants";

interface UseNotificationSocketOptions {
  salonId?: number | null;
  enabled: boolean;
  onNotificationReceived?: (notification: NotificationItem) => void;
}

export function useNotificationSocket({
  salonId,
  enabled,
  onNotificationReceived,
}: UseNotificationSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const onNotificationReceivedRef = useRef(onNotificationReceived);

  useEffect(() => {
    onNotificationReceivedRef.current = onNotificationReceived;
  }, [onNotificationReceived]);

  useEffect(() => {
    if (!enabled || !salonId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      console.warn("[NotificationSocket] Missing VITE_BACKEND_URL environment variable.");
      return;
    }

    const socket = io(backendUrl, {
      ...NOTIFICATION_SOCKET_CONFIG,
      auth: { salonId },
      query: { salonId: String(salonId) },
    });

    socketRef.current = socket;

    socket.on(NOTIFICATION_SOCKET_EVENTS.CONNECT, () => {
      if (import.meta.env.DEV) {
        console.log("[NotificationSocket] Connected:", socket.id);
      }
    });

    socket.on(NOTIFICATION_SOCKET_EVENTS.CONNECTED, (data: unknown) => {
      if (import.meta.env.DEV) {
        console.log("[NotificationSocket] Joined notification stream:", data);
      }
    });

    socket.on(NOTIFICATION_SOCKET_EVENTS.CONNECT_ERROR, (err: Error) => {
      if (import.meta.env.DEV) {
        console.warn("[NotificationSocket] Connection error:", err.message);
      }
    });

    socket.on(
      NOTIFICATION_SOCKET_EVENTS.NOTIFICATION_RECEIVED,
      (newNotification: NotificationItem) => {
        if (import.meta.env.DEV) {
          console.log("[NotificationSocket] Event received:", newNotification);
        }
        onNotificationReceivedRef.current?.(newNotification);
      }
    );

    return () => {
      socket.off(NOTIFICATION_SOCKET_EVENTS.CONNECT);
      socket.off(NOTIFICATION_SOCKET_EVENTS.CONNECTED);
      socket.off(NOTIFICATION_SOCKET_EVENTS.CONNECT_ERROR);
      socket.off(NOTIFICATION_SOCKET_EVENTS.NOTIFICATION_RECEIVED);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, salonId]);

  return socketRef;
}
