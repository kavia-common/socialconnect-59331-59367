import api from "./api";

/**
 * Notifications API helper functions.
 * Wrap backend endpoints for listing notifications and marking them as read.
 */

// PUBLIC_INTERFACE
export async function fetchNotifications({ onlyUnread = false, limit = 50 } = {}) {
  /** Fetch notifications from the backend. */
  const params = { limit };
  if (onlyUnread) params.onlyUnread = "1";
  const res = await api.get("/notifications", { params });
  const items = Array.isArray(res.data) ? res.data : [];
  return items;
}

// PUBLIC_INTERFACE
export async function markNotificationRead(id) {
  /** Mark a specific notification as read. */
  if (!id) return null;
  const res = await api.post(`/notifications/${id}/read`);
  return res.data;
}
