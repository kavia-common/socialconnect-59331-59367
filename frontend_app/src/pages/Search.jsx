import { useState } from "react";

/**
 * Search page placeholder for users/posts
 */
// PUBLIC_INTERFACE
export default function Search() {
  const [q, setQ] = useState("");

  return (
    <div className="p-2 md:pt-4">
      <div className="max-w-lg">
        <form onSubmit={(e) => e.preventDefault()} className="mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
            placeholder="Search users or posts..."
          />
        </form>
        <div className="space-y-2">
          {q ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing results for: <span className="font-medium">{q}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">Try searching for users or hashtags.</p>
          )}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-gray-100 dark:bg-zinc-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
