import { Link } from "react-router-dom";
import { useSocketStore } from "../../services/socket";

/**
 * Right sidebar for suggestions/notifications placeholder
 */
// PUBLIC_INTERFACE
export default function RightSidebar() {
  const { notifications } = useSocketStore((s) => ({ notifications: s.notifications }));

  return (
    <aside className="sticky top-16 p-4 space-y-4">
      <section className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800">
        <h3 className="font-semibold mb-2">Suggestions</h3>
        <ul className="space-y-2 text-sm">
          <li><Link to="/u/janedoe" className="hover:underline">janedoe</Link></li>
          <li><Link to="/u/johndoe" className="hover:underline">johndoe</Link></li>
          <li><Link to="/u/alex" className="hover:underline">alex</Link></li>
        </ul>
      </section>
      <section className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800">
        <h3 className="font-semibold mb-2">Notifications</h3>
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Real-time notifications will appear here.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {notifications.slice(0, 5).map((n, idx) => (
              <li key={idx} className="px-2 py-1 rounded bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800">
                {n?.message || n?.type || "New activity"}
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
