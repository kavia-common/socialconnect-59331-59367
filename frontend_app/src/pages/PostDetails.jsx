import { useParams } from "react-router-dom";

/**
 * Post details page placeholder
 */
// PUBLIC_INTERFACE
export default function PostDetails() {
  const { postId } = useParams();

  return (
    <div className="p-2 md:pt-4">
      <div className="max-w-3xl mx-auto rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="aspect-square bg-gray-100 dark:bg-zinc-800" />
        <div className="p-4">
          <h1 className="text-lg font-semibold mb-1">Post {postId}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Caption and comments will appear here.</p>
        </div>
      </div>
    </div>
  );
}
