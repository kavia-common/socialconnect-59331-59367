import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchMyFeed } from "../services/contentApi";
import PostCard from "../components/ui/PostCard";
import MasonryGrid from "../components/ui/MasonryGrid";
import { motion } from "framer-motion";
import { useSocketStore } from "../services/socket";

/**
 * Feed page shows followed users' posts with infinite scroll and real-time refresh.
 */
// PUBLIC_INTERFACE
export default function Feed() {
  const lastEvent = useSocketStore((s) => s.lastEvent);
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const sentinelRef = useRef(null);

  const load = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      const { items: newItems, nextCursor } = await fetchMyFeed({ cursor, limit: 12 });
      setItems((prev) => [...prev, ...newItems]);
      setCursor(nextCursor);
      if (!nextCursor || newItems.length === 0) setDone(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, done]);

  useEffect(() => {
    // initial load
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        load();
      }
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  // Real-time: when we receive a new-post event, refresh from top
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent?.type === "post_created") {
      // naive refresh: prepend? We'll simply refresh the list from scratch.
      setItems([]);
      setCursor(null);
      setDone(false);
      setTimeout(() => load(), 0);
    }
  }, [lastEvent, load]);

  const onLikeToggle = useCallback((id, liked) => {
    setItems((prev) =>
      prev.map((p) => (p._id === id ? { ...p, likeCount: (p.likeCount || 0) + (liked ? 1 : -1) } : p))
    );
  }, []);

  const empty = !loading && items.length === 0;

  return (
    <div className="p-2 md:p-0 md:pt-4">
      <h1 className="sr-only">Feed</h1>

      {empty ? (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">No posts in your feed yet. Follow users or explore!</p>
        </div>
      ) : (
        <MasonryGrid minColumnWidth={220} gap={10}>
          {items.map((p) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <PostCard post={p} onLikeToggle={onLikeToggle} />
            </motion.div>
          ))}
        </MasonryGrid>
      )}

      <div ref={sentinelRef} className="h-10" />
      {loading && (
        <div className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">Loading...</div>
      )}
      {done && items.length > 0 && (
        <div className="py-4 text-center text-xs text-gray-500">You have reached the end.</div>
      )}
    </div>
  );
}
