import { io } from "socket.io-client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// PUBLIC_INTERFACE
export function createSocket(token) {
  /**
   * Create a Socket.IO client with optional JWT auth.
   * Reads REACT_APP_SOCKET_URL, falls back to REACT_APP_API_BASE_URL.
   */
  const base = (process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_BASE_URL || "").replace(/\/+$/, "");
  const url = base || undefined; // let client decide current origin if undefined
  const auth = token ? { token } : undefined;

  const socket = io(url, {
    transports: ["websocket", "polling"],
    autoConnect: false,
    auth,
  });

  return socket;
}

// A lightweight store to track connection status and notifications (placeholder)
export const useSocketStore = create(
  persist(
    (set) => ({
      connected: false,
      lastEvent: null,
      notifications: [],
      setConnected: (v) => set({ connected: v }),
      addNotification: (n) =>
        set((s) => ({ notifications: [n, ...s.notifications].slice(0, 50), lastEvent: n })),
      clearNotifications: () => set({ notifications: [] }),
      // Note: Notifications coming via socket should include isRead=false to trigger badges.
    }),
    { name: "socket-store", partialize: (s) => ({ notifications: s.notifications }) }
  )
);
