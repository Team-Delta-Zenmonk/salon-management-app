import type { ManagerOptions, SocketOptions } from "socket.io-client";

export const NOTIFICATION_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  DROPDOWN_LIMIT: 3,
};

export const NOTIFICATION_SOCKET_CONFIG: Partial<ManagerOptions & SocketOptions> = {
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnectionAttempts: Number(import.meta.env.VITE_SOCKET_RECONNECTION_ATTEMPTS) || 10,
  reconnectionDelay: Number(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY) || 1000,
  reconnectionDelayMax: Number(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY_MAX) || 5000,
  timeout: Number(import.meta.env.VITE_SOCKET_TIMEOUT) || 20000,
};

export const NOTIFICATION_SOCKET_EVENTS = {
  CONNECT: "connect",
  CONNECT_ERROR: "connect_error",
  DISCONNECT: "disconnect",
  CONNECTED: "CONNECTED",
  NOTIFICATION_RECEIVED: "NOTIFICATION_RECEIVED",
} as const;
