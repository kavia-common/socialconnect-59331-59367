import React, { useEffect, useMemo, useState } from "react";
import { fetchNotifications, markNotificationRead } from "../services/notificationsApi";
import { useSocketStore } from "../services/socket";
import { Link } from "react-router-dom";

/**
 * Notifications page: shows real-time notifications (likes, comments, follows).
 * Loads initial list from backend, prepends real-time ones from socket store,
 * allows marking as read individually or all.
 */
// PUBLIC_INTERFACE
export default function Notifications() {
  const socketNotifications = useSocketStore((s) => s.notifications);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [busyIds, setBusyIds] = useState({});

  // initial fetch
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchNotifications({ onlyUnread, limit: 50 });
        if (alive) setItems(list);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [onlyUnread]);

  // Merge socket notifications: Put socket ones first and avoid duplicates by _id if present.
  const merged = useMemo(() => {
    const map = new Map();
    const normalized = (n) => {
      // Some socket payloads might not perfectly match schema; normalize fields.
      return {
        _id: n?._id || n?.id || `local-${Math.random().toString(36).slice(2)}`,
        type: n?.type || "info",
        message: n?.message || describeNotification(n),
        actor: n?.actor,
        post: n?.post,
        comment: n?.comment,
        isRead: !!n?.isRead,
        createdAt: n?.createdAt || new Date().toISOString(),
        metadata: n?.metadata || {},
        user: n?.user,
      };
    };
    // Put socket ones on top
    for (const n of socketNotifications) {
      const x = normalized(n);
      map.set(x._id, x);
    }
    // Then API-fetched ones, without overriding existing
    for (const n of items) {
      const id = n?._id || n?.id;
      const x = {
        _id: id || `api-${Math.random().toString(36).slice(2)}`,
        type: n?.type || "info",
        message: describeNotification(n),
        actor: n?.actor,
        post: n?.post,
        comment: n?.comment,
        isRead: !!n?.isRead,
        createdAt: n?.createdAt || new Date().toISOString(),
        metadata: n?.metadata || {},
        user: n?.user,
      };
      if (!map.has(x._id)) map.set(x._id, x);
    }
    // Sort by createdAt desc
    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [socketNotifications, items]);

  const unreadCount = useMemo(() => merged.filter((n) => !n.isRead).length, [merged]);

  const markRead = async (id) => {
    if (!id) return;
    setBusyIds((v) => ({ ...v, [id]: true }));
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {
      // ignore error for now
    } finally {
      setBusyIds((v) => ({ ...v, [id]: false }));
    }
  };

  const markAllAsRead = async () => {
    // optimistic local update; try calling mark for those with real ids.
    const ids = merged.filter((n) => !n.isRead && n._id && !String(n._id).startsWith("local-")).map((n) => n._id);
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    // fire-and-forget best-effort
    await Promise.all(ids.slice(0, 20).map((id) => markNotificationRead(id).catch(() => {})));
  };

  return (
    <div className="p-2 md:pt-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold">Notifications</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyUnread}
              onChange={(e) => setOnlyUnread(e.target.checked)}
            />
            <span>Only unread</span>
          </label>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="px-3 py-1.5 rounded border text-sm border-gray-300 dark:border-zinc-700 disabled:opacity-50"
          >
            Mark all read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse mb-2" />
          <div className="h-4 w-64 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse mb-2" />
          <div className="h-4 w-56 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      ) : merged.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">No notifications yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {merged.map((n) => (
            <li
              key={n._id}
              className={`p-3 rounded-lg border ${n.isRead ? "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800" : "bg-blue-50/60 dark:bg-blue-900/10 border-blue-200/70 dark:border-blue-900/30"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm leading-5">
                  <NotificationText n={n} />
                  <div className="text-xs text-gray-500 mt-0.5">
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <button
                      onClick={() => markRead(n._id)}
                      disabled={busyIds[n._id]}
                      className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-zinc-700"
                    >
                      {busyIds[n._id] ? "..." : "Mark read"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NotificationText({ n }) {
  const actor = n?.actor;
  const actorName = actor?.username ? `@${actor.username}` : "Someone";
  if (n?.message) {
    return <p>{n.message}</p>;
  }
  if (n?.type === "like") {
    return (
      <p>
        <strong>{actorName}</strong> liked your{" "}
        {n?.post ? <Link className="text-accent hover:underline" to={`/p/${n.post}`}>post</Link> : "post"}.
      </p>
    );
  }
  if (n?.type === "comment") {
    return (
      <p>
        <strong>{actorName}</strong> commented on your{" "}
        {n?.post ? <Link className="text-accent hover:underline" to={`/p/${n.post}`}>post</Link> : "post"}.
      </p>
    );
  }
  if (n?.type === "follow") {
    return (
      <p>
        <strong>{actorName}</strong> started following you.{" "}
        {actor?.username ? (
          <Link className="text-accent hover:underline" to={`/u/${actor.username}`}>View profile</Link>
        ) : null}
      </p>
    );
  }
  return <p>New activity.</p>;
}

function describeNotification(n) {
  // Fallback message generator when message is not provided by backend.
  const actor = n?.actor?.username ? `@${n.actor.username}` : "Someone";
  switch (n?.type) {
    case "like":
      return `${actor} liked your post.`;
    case "comment":
      return `${actor} commented on your post.`;
    case "follow":
      return `${actor} started following you.`;
    default:
      return n?.message || "New activity.";
  }
}

function timeAgo(iso) {
  try {
    const d = new Date(iso);
    const delta = Math.floor((Date.now() - d.getTime()) / 1000);
    if (delta < 60) return `${delta}s ago`;
    const m = Math.floor(delta / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    return `${days}d ago`;
  } catch {
    return "";
  }
}
