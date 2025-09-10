import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

/**
 * Feed page showing followed users' posts (placeholder grid).
 */
// PUBLIC_INTERFACE
export default function Feed() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    // Refresh user on landing
    fetchMe().catch(() => {});
  }, [fetchMe]);

  return (
    <div className="p-2 md:p-0 md:pt-4">
      <h1 className="sr-only">Feed</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-gray-100 dark:bg-zinc-800 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
