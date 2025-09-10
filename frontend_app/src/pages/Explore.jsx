import React from "react";

/**
 * Explore page grid placeholder
 */
// PUBLIC_INTERFACE
export default function Explore() {
  return (
    <div className="p-2 md:pt-4">
      <h1 className="text-lg font-semibold mb-3">Explore</h1>
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-gray-100 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
