import React, { useCallback, useEffect, useRef, useState } from "react";
import { fetchExplore } from "../services/contentApi";
import PostCard from "../components/ui/PostCard";
import MasonryGrid from "../components/ui/MasonryGrid";
import { motion } from "framer-motion";

// PUBLIC_INTERFACE
export default function Explore() {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const sentinelRef = useRef(null);

  const load = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      const { items: newItems, nextCursor } = await fetchExplore({ cursor, limit: 18 });
      setItems((prev) => [...prev, ...newItems]);
      setCursor(nextCursor);
      if (!nextCursor || newItems.length === 0) setDone(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, done]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="p-2 md:pt-4">
      <h1 className="text-lg font-semibold mb-3">Explore</h1>
      <MasonryGrid minColumnWidth={180} gap={8}>
        {items.map((p) => (
          <motion.div key={p._id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <PostCard post={p} />
          </motion.div>
        ))}
      </MasonryGrid>
      <div ref={sentinelRef} className="h-10" />
      {loading && <div className="py-3 text-center text-sm text-gray-600 dark:text-gray-400">Loading...</div>}
      {done && items.length > 0 && <div className="py-3 text-center text-xs text-gray-500">No more posts</div>}
    </div>
  );
}
