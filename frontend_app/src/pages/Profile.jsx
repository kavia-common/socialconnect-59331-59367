import { useParams } from "react-router-dom";

/**
 * Profile page placeholder
 */
// PUBLIC_INTERFACE
export default function Profile() {
  const { username } = useParams();

  return (
    <div className="p-2 md:pt-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-zinc-800" />
        <div>
          <h1 className="text-2xl font-semibold">@{username}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Bio goes here.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-gray-100 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
